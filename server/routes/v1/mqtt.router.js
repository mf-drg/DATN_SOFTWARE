import express from 'express'
import { mqttController } from '../../controllers/index.js'
import { isApiKeyAuthorized } from '../../middlewares/apiKey.js'

const router = express.Router()

router.route('/auth').post(mqttController.auth)
router.route('/message').post(isApiKeyAuthorized, mqttController.onMessage)
router.route('/status').post(mqttController.status)
router.route('/publish/state').post(isApiKeyAuthorized, mqttController.publishState)
export default router
