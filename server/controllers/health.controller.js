const healthCheck = (req, res, next) => {
  res.send('Server is running!')
}

export { healthCheck }
