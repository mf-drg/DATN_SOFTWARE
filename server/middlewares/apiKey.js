const isApiKeyAuthorized = function (req, res, next) {
  try {
    const xApiKey = req.headers['x-api-key']
    if (!xApiKey || xApiKey !== process.env.APP_API_KEY) {
      throw { status: 401, message: 'Invalid token' }
    }
    return next()
  } catch (e) {
    next(e)
  }
}

export { isApiKeyAuthorized }
