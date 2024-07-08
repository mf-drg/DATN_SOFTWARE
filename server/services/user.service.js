import { and, asc, eq, inArray, like, ne, or, sql } from 'drizzle-orm'
import crypto from 'crypto'
import { db } from '../database/index.js'
import { devices, permissions, users } from '../entities/index.js'
import { EUserRole } from '../enums/index.js'
import { generateResponseMeta } from '../utils/index.js'

export const getMany = async (query) => {
  const { limit: queryLimit, page: queryPage, keyword = '' } = query
  const limit = Number(queryLimit) || 10
  const page = Number(queryPage) || 1
  const sqlQueries = []
  if (String(keyword)) {
    sqlQueries.push(or(like(users.email, '%' + String(keyword) + '%'), like(users.userName, '%' + String(keyword) + '%')))
  }
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      userName: users.userName,
      phoneNumber: users.phoneNumber,
      role: users.role,
    })
    .from(users)
    .where(and(ne(users.role, EUserRole.ROOT), ...sqlQueries))
    .limit(limit)
    .offset(limit * (page - 1))
    .orderBy(asc(users.id))
  const [{ total }] = await db
    .select({
      total: sql`count(${users.id})`.as('total'),
    })
    .from(users)
    .where(and(ne(users.role, EUserRole.ROOT), ...sqlQueries))

  const meta = generateResponseMeta(total, page, limit)
  return { meta, data: result }
}

export const getOne = async (id) => {
  const [foundUser] = await db
    .select({
      id: users.id,
      email: users.email,
      userName: users.userName,
      phoneNumber: users.phoneNumber,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
  return foundUser
}

export const createOne = async (body) => {
  try {
    if (body.role && body.role === EUserRole.ROOT) {
      throw { status: 400, message: 'Bad role config!' }
    }
    const existUser = await db.query.users.findFirst({ where: or(eq(users.email, body.email), eq(users.userName, body.userName)) })

    if (existUser) throw { status: 400, message: 'User Email/Username aready exists!' }
    let userPassHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const newUser = await db.insert(users).values({
      email: body.email,
      userName: body.userName,
      phoneNumber: body.phoneNumber,
      role: body.role,
      password: userPassHash,
    })
    return newUser
  } catch (e) {
    throw e
  }
}
export const updateOne = async (id, body) => {
  if (body.role && body.role === EUserRole.ROOT) {
    throw { status: 400, message: 'Bad role config!' }
  }
  const existUser = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), ne(users.role, EUserRole.ROOT)))
    .limit(1)

  if (!existUser) throw { status: 400, message: 'User not found!' }
  const existsEmailOrUserName = await db
    .select()
    .from(users)
    .where(and(ne(users.id, id), or(eq(users.email, body.email), eq(users.userName, body.userName))))
    .limit(1)
  if (existsEmailOrUserName.length > 0) {
    throw { status: 400, message: 'User Email/Username aready exists!' }
  }
  const updateData = {
    userName: body.userName,
    email: body.email,
    phoneNumber: body.phoneNumber,
    role: body.role,
  }
  if (body.password && body.password !== existUser.password) {
    let userPassHash = crypto.createHash('sha256').update(body.password).digest('base64')
    updateData.password = userPassHash
  }
  const returning = await db.update(users).set(updateData).where(eq(users.id, id))
  return returning
}
export const getPermission = async (id) => {
  const [existUser] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), ne(users.role, EUserRole.ROOT)))
    .limit(1)
  if (!existUser) throw { status: 400, message: 'User not found!' }

  const permissionArray = await db
    .select({
      deviceId: devices.id,
      hardwareId: devices.hardwareId,
      deviceType: devices.type,
      permission: permissions.permission,
    })
    .from(permissions)
    .leftJoin(devices, eq(permissions.deviceId, devices.id))
    .where(eq(permissions.userId, existUser.id))

  return permissionArray
}
export const setPermission = async (id, body) => {
  const [existUser] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), ne(users.role, EUserRole.ROOT)))
    .limit(1)
  if (!existUser) throw { status: 400, message: 'User not found!' }
  if (body.payload.length === 0) return
  const existDevices = await db
    .select()
    .from(devices)
    .where(
      inArray(
        devices.id,
        body.payload.map((el) => el.deviceId)
      )
    )

  if (existDevices.length !== body.payload.length) throw { status: 400, message: 'Some devices not found!' }

  const newPermissions = body.payload.map((el) => ({
    userId: existUser.id,
    deviceId: el.deviceId,
    permission: el.permission,
  }))
  await db
    .insert(permissions)
    .values(newPermissions)
    .onDuplicateKeyUpdate({ set: { permission: sql`values(permission)` } })
  return
}
export const deletePermission = async (id, deviceId) => {
  await db.delete(permissions).where(and(eq(permissions.userId, id), eq(permissions.deviceId, deviceId)))
  return
}
