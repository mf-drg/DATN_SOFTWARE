import { EUserRole } from '../enums/index.js'
import { deviceService } from '../services/index.js'

export const getMany = async (req, res, next) => {
  try {
    const query = req.query
    query.userId = req.user.id
    query.isSkipCheckPermission = req.user.role === EUserRole.ROOT
    const response = await deviceService.getMany(query)
    res.status(200).send({ code: 200, success: true, ...response })
  } catch (err) {
    next(err)
  }
}

export const getOne = async (req, res, next) => {
  try {
    const response = await deviceService.getOne(req.params.deviceId)
    res.status(200).send({ code: 200, success: true, data: response })
  } catch (err) {
    next(err)
  }
}

export const updateOne = async (req, res, next) => {
  try {
    await deviceService.updateOne(req.params.deviceId, req.body)
    res.status(200).send({ code: 200, success: true, data: null, message: 'Cập nhật thiết bị thành công.' })
  } catch (err) {
    next(err)
  }
}
export const createOne = async (req, res, next) => {
  try {
    const response = await deviceService.createOne(req.body)
    res.status(200).send({ code: 201, success: true, data: response, message: 'Tạo mới thiết bị thành công.' })
  } catch (err) {
    next(err)
  }
}
export const saveManySchedule = async (req, res, next) => {
  try {
    const response = await deviceService.saveManySchedule(req.params.deviceId, req.body)
    res.status(200).send({ code: 200, success: true, data: response, message: 'Lưu lập lịch thành công.' })
  } catch (err) {
    next(err)
  }
}

export const deleteOneSchedule = async (req, res, next) => {
  try {
    const { deviceId, scheduleId } = req.params
    const response = await deviceService.deleteOneSchedule(deviceId, scheduleId)
    res.status(200).send({ code: 200, success: true, data: response, message: 'Xóa lập lịch thành công.' })
  } catch (err) {
    next(err)
  }
}

export const changeDeviceProperty = async (req, res, next) => {
  try {
    const { deviceId } = req.params
    const response = await deviceService.changeDeviceProperty(deviceId, req.body)
    res.status(200).send({ code: 200, success: true, data: response, message: 'Thiết lập thuộc tính thiết bị thành công.' })
  } catch (err) {
    next(err)
  }
}

export const deleteOne = async (req, res, next) => {
  try {
    const { deviceId } = req.params
    const response = await deviceService.deleteOne(deviceId)
    res.status(200).send({ code: 200, success: true, data: response, message: 'Xóa thiết bị thành công.' })
  } catch (err) {
    next(err)
  }
}
