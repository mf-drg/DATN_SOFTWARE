import { and, asc, eq, exists, inArray, like, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/mysql-core'
import { omit } from 'lodash-es'
import moment from 'moment'
import { ulid } from 'ulid'
import { db } from '../database/index.js'
import { deviceProperties, devices, permissions, schedules, users } from '../entities/index.js'
import { EDeviceType, EPermission } from '../enums/index.js'
import { generateResponseMeta } from '../utils/index.js'
import { cronicleService } from './index.js'
import { publish } from './mqtt.service.js'

export const getMany = async (query) => {
  const { userId, isSkipCheckPermission, limit: queryLimit, page: queryPage, keyword = '', type } = query
  const limit = Number(queryLimit) || 10
  const page = Number(queryPage) || 1
  const sqlQueries = []
  if (String(keyword)) {
    sqlQueries.push(like(devices.hardwareId, '%' + String(keyword) + '%'))
  }
  if (type) {
    sqlQueries.push(eq(devices.type, type))
  }
  const gateway = alias(devices, 'gateway')
  const selects = {
    id: devices.id,
    hardwareId: devices.hardwareId,
    gatewayId: devices.gatewayId,
    gatewayHardwareId: gateway.hardwareId,
    name: devices.name,
    userName: devices.userName,
    password: devices.password,
    status: devices.status,
    type: devices.type,
    tag: devices.tag,
    ipAddress: devices.ipAddress,
    macAddress: devices.macAddress,
    createdAt: devices.createdAt,
  }
  let qb
  let countQb
  if (isSkipCheckPermission) {
    qb = db
      .select({
        ...selects,
        permission: sql`${EPermission.EDIT} as permission`,
      })
      .from(devices)
      .where(and(...sqlQueries))
    countQb = db
      .select({
        total: sql`count(${devices.id})`.as('total'),
      })
      .from(devices)
      .where(and(...sqlQueries))
  } else {
    qb = db
      .select({
        ...selects,
        permission: permissions.permission,
      })
      .from(permissions)
      .leftJoin(devices, eq(permissions.deviceId, devices.id))
    countQb = db
      .select({
        total: sql`count(${devices.id})`.as('total'),
      })
      .from(permissions)
      .leftJoin(devices, eq(permissions.deviceId, devices.id))
    qb.where(and(eq(permissions.userId, userId), ...sqlQueries))
    countQb.where(and(eq(permissions.userId, userId), ...sqlQueries))
  }

  const result = await qb
    .leftJoin(gateway, eq(devices.gatewayId, gateway.id))
    .limit(limit)
    .offset(limit * (page - 1))
    .orderBy(asc(devices.id))
  const [{ total }] = await countQb
  if (result.length > 0) {
    const deviceIds = result.map((d) => d.id)
    const devicePropertiesQb = db.select().from(deviceProperties).where(inArray(deviceProperties.deviceId, deviceIds))
    const schedulesQb = db.select().from(schedules).where(inArray(schedules.deviceId, deviceIds))
    const [devicePropertiesData, schedulesData] = await Promise.all([devicePropertiesQb, schedulesQb])
    const propertiesMap = new Map(devicePropertiesData.map((d) => [d.deviceId, d]))
    result.forEach((d) => {
      d.property = propertiesMap.get(d.id)
      d.schedules = schedulesData
        .filter((s) => s.deviceId === d.id)
        .map((s) => {
          return {
            ...s,
            weekdays: JSON.parse(s.weekdays),
          }
        })
    })
  }

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
    if (!body.hardwareId) {
      throw { status: 400, message: 'Hardware ID không được trống.' }
    }
    const [existDevice] = await db
      .select()
      .from(devices)
      .where(or(eq(devices.hardwareId, body.hardwareId)))
      .limit(1)

    if (existDevice) throw { status: 400, message: 'Hardware ID đã tồn tại ở thiết bị khác.' }
    await db.transaction(async (trx) => {
      const id = ulid()
      await trx.insert(devices).values({
        id,
        hardwareId: body.hardwareId,
        gatewayId: body.gatewayId,
        name: body.name,
        userName: body.userName,
        password: body.password,
        status: body.status,
        type: body.type,
        tag: body.tag,
        ipAddress: body.ipAddress,
        macAddress: body.macAddress,
      })
      await trx.insert(deviceProperties).values({
        deviceId: id,
        state: 0,
        brightness: 100,
      })
    })
    return
  } catch (e) {
    throw e
  }
}
export const updateOne = async (id, body) => {
  const [existDevice] = await db
    .select()
    .from(devices)
    .where(or(eq(devices.id, id)))
    .limit(1)

  if (!existDevice) throw { status: 400, message: 'Không tìm thấy Device.' }

  if (body.gatewayId && body.gatewayId !== existDevice.gatewayId) {
    const [existGateway] = await db
      .select()
      .from(devices)
      .where(and(eq(devices.id, body.gatewayId), eq(devices.type, EDeviceType.GATEWAY)))
      .limit(1)
    if (!existGateway) throw { status: 400, message: 'Không tìm thấy Gateway.' }
  }

  const setBody = omit(body, ['id', 'hardwareId', 'type', 'createdAt'])
  await db
    .update(devices)
    .set(setBody)
    .where(and(eq(devices.id, id)))

  return
}
export const saveManySchedule = async (id, body) => {
  try {
    if (!body.data || body.data.length === 0) {
      return
    }
    const device = await db.query.devices.findFirst({
      where: and(eq(devices.id, id), eq(devices.type, EDeviceType.GATEWAY)),
    })
    if (!device) {
      throw new Error('Không tìm thấy thiết bị.')
    }

    const property = await db.query.deviceProperties.findFirst({
      where: and(eq(deviceProperties.deviceId, device.id)),
    })
    device.property = property
    const existSchedules = await db.query.schedules.findMany({
      where: eq(schedules.deviceId, device.id),
    })

    if (existSchedules.length > 0) {
      await db.delete(schedules).where(eq(schedules.deviceId, device.id))
      await Promise.all(existSchedules.map((el) => cronicleService.deleteSchedule(el.startJobId)))
      await Promise.all(existSchedules.map((el) => cronicleService.deleteSchedule(el.endJobId)))
    }
    const schedulePromises = body.data.map(async (el) => {
      const { time, weekdays, duration } = el
      const [hour, minute] = time.split(':')
      const momentTime = moment(time, 'HH:mm')
      momentTime.add(duration, 'minutes')
      const durationTime = momentTime.format('HH:mm')
      const [endHour, endMinute] = durationTime.split(':')
      const startCronPayload = { deviceId: device.id, controlState: 1 }
      const endCronPayload = { deviceId: device.id, controlState: 0 }
      const jobStart = cronicleService.createSchedule(hour, minute, weekdays, startCronPayload)
      const jobEnd = cronicleService.createSchedule(endHour, endMinute, weekdays, endCronPayload)
      const [{ id: startJobId }, { id: endJobId }] = await Promise.all([jobStart, jobEnd])
      return {
        id: ulid(),
        deviceId: device.id,
        startJobId,
        endJobId,
        time: time,
        duration: duration,
        weekdays: JSON.stringify(weekdays),
      }
    })
    const schedulesNeedSave = await Promise.all(schedulePromises)
    await db.insert(schedules).values(schedulesNeedSave)

    return schedulesNeedSave
  } catch (e) {
    console.log(e)
    throw e
  }
}
export const deleteOneSchedule = async (id, scheduleId) => {
  try {
    const schedule = await db.query.schedules.findFirst({
      where: and(eq(schedules.id, scheduleId), eq(schedules.deviceId, id)),
    })
    if (!schedule) {
      throw new Error('Không tìm thấy lập lịch đã chọn.')
    }
    await db.delete(schedules).where(and(eq(schedules.id, scheduleId), eq(schedules.deviceId, id)))
    await Promise.all([cronicleService.deleteSchedule(schedule.startJobId), cronicleService.deleteSchedule(schedule.endJobId)])
    return
  } catch (e) {
    throw e
  }
}

export const changeDeviceProperty = async (id, body) => {
  try {
    const device = await db.query.devices.findFirst({
      where: and(eq(devices.id, id)),
    })
    if (!device) {
      throw new Error('Không tìm thấy thiết bị đã chọn.')
    }
    let deviceId = device.hardwareId
    let subQuery = []
    if (device.type !== EDeviceType.GATEWAY) {
      const gateway = await db.query.devices.findFirst({
        where: and(eq(devices.id, device.gatewayId)),
      })
      deviceId = gateway.hardwareId
    } else {
      const subDevices = await db.select().from(devices).where(eq(devices.gatewayId, device.id))
      if (subDevices.length > 0) {
        subQuery.push(
          inArray(
            deviceProperties.deviceId,
            subDevices.map((el) => el.id)
          )
        )
      }
    }

    await db
      .update(deviceProperties)
      .set(body)
      .where(or(eq(deviceProperties.deviceId, id), ...subQuery))
    const property = await db.query.deviceProperties.findFirst({
      where: and(eq(deviceProperties.deviceId, id)),
    })
    await publish(`hust/${deviceId}/cmd`, {
      ID: device.type === EDeviceType.GATEWAY ? 'ALL' : device.hardwareId,
      DIM: property.brightness,
      STATE: property.controlState ? 'ON' : 'OFF',
    })
    return
  } catch (e) {
    throw e
  }
}

export const deleteOne = async (id) => {
  try {
    const [existDevice] = await db
      .select()
      .from(devices)
      .where(or(eq(devices.id, id)))
      .limit(1)

    if (!existDevice) throw { status: 400, message: 'Thiết bị đã chọn không tồn tại.' }

    if (existDevice.type === EDeviceType.GATEWAY) {
      const subDevice = await db.query.devices.findFirst({
        where: eq(devices.gatewayId, existDevice.id),
      })
      if (subDevice) throw { status: 400, message: 'Không thể xoá gateway có chứa subdevice.' }
    }
    const existSchedules = await db.query.schedules.findMany({
      where: and(eq(schedules.deviceId, existDevice.id)),
    })

    await db.transaction(async (trx) => {
      await Promise.all(existSchedules.map((el) => cronicleService.deleteSchedule(el.startJobId)))
      await Promise.all(existSchedules.map((el) => cronicleService.deleteSchedule(el.endJobId)))
      await trx.delete(devices).where(or(eq(devices.id, existDevice.id)))
      await trx.delete(schedules).where(or(eq(schedules.deviceId, existDevice.id)))
      await trx.delete(deviceProperties).where(or(eq(deviceProperties.deviceId, existDevice.id)))
    })
    return
  } catch (e) {
    throw e
  }
}
