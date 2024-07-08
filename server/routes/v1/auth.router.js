import express from 'express'
import { authController, userController } from '../../controllers/index.js'
import { authMiddleware } from '../../middlewares/index.js'

const router = express.Router()

router.route('/login').post(authController.login)
router.route('/signup').post(authController.signup)
router.route('/me/:id').get(authMiddleware.isAuthorized, userController.getOne)

export default router
