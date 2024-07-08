import jwt from 'jsonwebtoken'
const isAuthorized = function (req, res, next) {
  try {
    if (!req.headers.authorization) {
      throw { status: 401, message: 'Invalid token' }
    }
    req.user = validationToken(req.headers.authorization)
    return next()
  } catch (e) {
    next(e)
  }
}

function validationToken(bearerString) {
  if (bearerString.split(' ')[0] !== 'Bearer') {
    throw { status: 401, message: 'Invalid token' }
  }
  const token = bearerString.split(' ')[1]
  try {
    return jwt.verify(token, process.env.APP_KEY)
  } catch (err) {
    const message = 'Token error: ' + (err.message || err.name)
    throw { status: 401, message }
  }
}

export { isAuthorized }
