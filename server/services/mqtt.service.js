import { and, eq, or } from 'drizzle-orm'
import { db } from '../database/index.js'
import { deviceProperties, devices } from '../entities/index.js'
import { EDeviceStatus, EDeviceType } from '../enums/index.js'

export const auth = async (loginDto) => {
  const { username, password } = loginDto
  try {
    console.log({ username, password })
    return {
      result: 'allow',
      is_superuser: false,
    }
  } catch (e) {
    throw e
  }
}
export const publish = async (topic, message) => {
  try {
    const url = process.env.MQTT_API_URL + '/api/v5/publish'
    const payload = {
      payload_encoding: 'plain',
      topic,
      qos: 0,
      payload: JSON.stringify(message),
      properties: {
        payload_format_indicator: 0,
        message_expiry_interval: 0,
        response_topic: '',
        correlation_data: 'string',
        user_properties: {},
        content_type: 'text/plain',
      },
      retain: false,
    }
    const username = process.env.MQTT_API_KEY_USERNAME
    const password = process.env.MQTT_API_KEY_PASSWORD
    const auth = Buffer.from(`${username}:${password}`).toString('base64')
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    }
    const response = await fetch(url, config)
    return await response.json()
  } catch (e) {
    throw e
  }
}
export const onMessage = async (body) => {
  try {
    const { topic, payload } = body
    const regexMatchReport = /^hust\/[a-zA-Z0-9]*\/report$/
    if (regexMatchReport.test(topic)) {
      const { ID, STATUS } = JSON.parse(payload)
      const device = await db.query.devices.findFirst({ where: and(eq(devices.hardwareId, ID)) })
      if (!device) return
      await db
        .update(deviceProperties)
        .set({ state: STATUS === 'ON' ? 1 : 0 })
        .where(eq(deviceProperties.deviceId, device.id))
    }
  } catch {
    return
  }
}
export const status = async (body) => {
  const { username, clientid, event, peername } = body
  if (username === 'device') {
    const status = event === 'client.connected' ? EDeviceStatus.ONLINE : EDeviceStatus.OFFLINE
    const [device] = await db.select().from(devices).where(eq(devices.hardwareId, clientid)).limit(1)
    if (device) {
      await db
        .update(devices)
        .set({ status, ipAddress: peername })
        .where(or(eq(devices.id, device.id), and(eq(devices.gatewayId, device.id), eq(devices.type, EDeviceType.LIGHT))))
    }
  }
}
