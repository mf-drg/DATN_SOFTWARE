import express from 'express'
import { userController } from '../../controllers/index.js'

const router = express.Router()

router.route('/').get(userController.getMany).post(userController.createOne)
router.route('/:id').get(userController.getOne).put(userController.updateOne)
router.route('/:id/permission').get(userController.getPermission).put(userController.setPermission)
router.route('/:id/permission/:deviceId').delete(userController.deletePermission)
export default router
