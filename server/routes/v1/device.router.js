import express from 'express'
import { deviceController } from '../../controllers/index.js'
import { isAllowPermission, isAllowRole } from '../../middlewares/index.js'
import { EPermission, EUserRole } from '../../enums/index.js'

const router = express.Router()

router.route('/').get(deviceController.getMany)
router.route('/').post(isAllowRole(EUserRole.ROOT, EUserRole.ADMIN), deviceController.createOne)
router
  .route('/:deviceId')
  .get(isAllowPermission(EPermission.READ), deviceController.getOne)
  .put(isAllowPermission(EPermission.EDIT), deviceController.updateOne)
  .delete(isAllowPermission(EPermission.EDIT), deviceController.deleteOne)
router.route('/:deviceId/set').put(isAllowPermission(EPermission.CONTROL), deviceController.changeDeviceProperty)

router.route('/:deviceId/schedule').post(isAllowPermission(EPermission.EDIT), deviceController.saveManySchedule)
router.route('/:deviceId/schedule/:scheduleId').delete(isAllowPermission(EPermission.EDIT), deviceController.deleteOneSchedule)

export default router
