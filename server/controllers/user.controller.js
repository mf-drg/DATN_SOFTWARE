import { userService } from '../services/index.js'

export const getMany = async (req, res, next) => {
  try {
    const result = await userService.getMany(req.query)
    res.status(200).send({ code: 200, success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const getOne = async (req, res, next) => {
  try {
    const user = await userService.getOne(req.params.id)
    res.status(200).send({ code: 200, success: true, data: user })
  } catch (err) {
    next(err)
  }
}

export const updateOne = async (req, res, next) => {
  try {
    const user = await userService.updateOne(req.params.id, req.body)
    res.status(200).send({ code: 200, success: true, data: user, message: 'Update success' })
  } catch (err) {
    next(err)
  }
}

export const getPermission = async (req, res, next) => {
  try {
    const permissionArray = await userService.getPermission(req.params.id)
    res.status(200).send({ code: 200, success: true, data: permissionArray })
  } catch (err) {
    next(err)
  }
}

export const setPermission = async (req, res, next) => {
  try {
    const user = await userService.setPermission(req.params.id, req.body)
    res.status(200).send({ code: 200, success: true, data: user, message: 'Update permission success' })
  } catch (err) {
    next(err)
  }
}
export const deletePermission = async (req, res, next) => {
  try {
    await userService.deletePermission(req.params.id, req.params.deviceId)
    res.status(200).send({ code: 200, success: true, data: null, message: 'Delete permission success' })
  } catch (err) {
    next(err)
  }
}

export const createOne = async (req, res, next) => {
  try {
    const user = await userService.createOne(req.body)
    res.status(200).send({ code: 201, success: true, data: user, message: 'Create success' })
  } catch (err) {
    next(err)
  }
}
