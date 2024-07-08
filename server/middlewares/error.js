export default (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  const code = err.status || 500
  res.status(code).send({
    code,
    success: false,
    message: err.message || 'Internal Server Error',
  })
}
