import { deviceService, mqttService } from '../services/index.js'

export const auth = async (req, res, next) => {
  try {
    const mqttData = await mqttService.auth(req.body)
    res.status(200).send(mqttData)
  } catch (err) {
    next(err)
  }
}
export const status = async (req, res, next) => {
  try {
    const body = req.body
    await mqttService.status(body)
    res.status(200).send()
  } catch (err) {
    next(err)
  }
}

export const onMessage = async (req, res, next) => {
  try {
    const body = req.body
    await mqttService.onMessage(body)
    res.status(200).send('ok')
  } catch (err) {
    next(err)
  }
}

export const publishState = async (req, res, next) => {
  try {
    const { deviceId, controlState } = req.body
    const mqttData = await deviceService.changeDeviceProperty(deviceId, { controlState })
    res.status(200).send(mqttData)
  } catch (err) {
    next(err)
  }
}
