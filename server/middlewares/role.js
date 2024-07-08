const isAllowRole = function (...roles) {
  return function (req, res, next) {
    try {
      const loginUser = req.user
      if (roles.includes(loginUser.role)) {
        return next()
      }
      throw { status: 403, message: 'Forbidden resource' }
    } catch (e) {
      next(e)
    }
  }
}

export { isAllowRole }
