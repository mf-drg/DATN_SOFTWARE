import express from 'express'
import { healthController } from '../../controllers/index.js'

const router = express.Router()

router.route('/health').get(healthController.healthCheck)

export default router
