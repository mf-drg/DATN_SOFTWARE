import { EUserRole } from '../enums/index.js'

const isAllowPermission = function (permission) {
  return function (req, res, next) {
    try {
      const loginUser = req.user
      if (loginUser.role === EUserRole.ROOT) {
        return next()
      }
      const deviceId = req.params.deviceId
      const devicePermission = loginUser.permissions[deviceId]
      if (!devicePermission || Number(devicePermission) < Number(permission)) {
        throw { status: 403, message: 'Forbidden resource' }
      }
      return next()
    } catch (e) {
      next(e)
    }
  }
}

export { isAllowPermission }
