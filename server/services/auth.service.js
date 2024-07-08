import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { and, eq } from 'drizzle-orm'
import { db } from '../database/index.js'
import { devices, permissions, users } from '../entities/index.js'
import { EUserRole } from '../enums/index.js'

const login = async (loginDto) => {
  const { email, password } = loginDto
  try {
    const [foundUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!foundUser) throw { status: 400, message: 'Wrong user name or password' }
    let userPassHash = crypto.createHash('sha256').update(password).digest('base64')
    if (userPassHash === foundUser.password) {
      const permissionsAllow = await db
        .select({
          deviceId: devices.id,
          hardwareId: devices.hardwareId,
          permission: permissions.permission,
        })
        .from(permissions)
        .innerJoin(devices, eq(permissions.deviceId, devices.id))
        .where(and(eq(permissions.userId, foundUser.id)))
      const permissionsObject = permissionsAllow.reduce(function (map, obj) {
        map[obj.deviceId] = obj.permission
        return map
      }, {})
      const user = foundUser
      delete user.password
      user.permissions = permissionsObject
      const token = jwt.sign(user, process.env.APP_KEY, { expiresIn: 3600 * 24 + 's' })
      const mqttToken = jwt.sign(
        {
          username: user.id,
          acl: [
            {
              permission: 'allow',
              action: 'subscribe',
              topic: 'hust/+/report',
            },
            {
              permission: 'allow',
              action: 'subscribe',
              topic: 'hust/+/cmd',
            },
            {
              permission: 'deny',
              action: 'all',
              topic: '#',
            },
          ],
        },
        process.env.EMQX_BROKER_AUTH_KEY,
        { expiresIn: 3600 * 24 + 's' }
      )
      return { user, token, mqttToken }
    } else {
      throw { status: 400, message: 'Wrong user name or password' }
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}

const signup = async (signupDto) => {
  try {
    const { userName, email, password } = signupDto
    const [foundUser] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.userName, userName)))
      .limit(1)
    if (foundUser) {
      throw { status: 400, message: 'User already exists' }
    } else {
      let userPassHash = crypto.createHash('sha256').update(password).digest('base64')
      const result = await db.insert(users).values({
        userName,
        email,
        password: userPassHash,
        role: EUserRole.NORMAL,
      })
      if (!result) {
        throw { status: 400, message: 'Fail to signup' }
      }
      return
    }
  } catch (err) {
    throw err
  }
}
export { login, signup }
