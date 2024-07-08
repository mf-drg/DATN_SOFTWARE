import express from 'express'
import healthRouter from './health.router.js'
import userRouter from './user.router.js'
import authRouter from './auth.router.js'
import mqttRouter from './mqtt.router.js'
import deviceRouter from './device.router.js'
import { authMiddleware, isAllowRole } from '../../middlewares/index.js'
import { EUserRole } from '../../enums/index.js'

export default (app) => {
  const routers = express.Router()
  routers.use(healthRouter)
  routers.use('/auth', authRouter)
  routers.use('/mqtt', mqttRouter)
  routers.use('/device', authMiddleware.isAuthorized, deviceRouter)
  routers.use('/admin/user', authMiddleware.isAuthorized, isAllowRole(EUserRole.ROOT), userRouter)
  app.use('/api/v1/', routers)
  return app
}
