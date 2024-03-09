import { Router } from 'express'
import { FamilyGroupsController } from '../controllers/familyGroups.js'
import { isEntriesAdmin, verifyToken } from '../middlewares/authJwt.js'
import { validateUuid } from '../middlewares/validateUuid.js'

export const familyGroupsRouter = Router()

export const createFamilyGroupsRouter = ({ familyGroupModel }) => {
  const familyGroupController = new FamilyGroupsController({ familyGroupModel })

  familyGroupsRouter.get('/', [verifyToken, isEntriesAdmin], familyGroupController.getAll)
  familyGroupsRouter.post('/', [verifyToken, isEntriesAdmin], familyGroupController.create)

  familyGroupsRouter.get('/:id', [validateUuid], familyGroupController.getById)
  familyGroupsRouter.put('/:id', [verifyToken, isEntriesAdmin, validateUuid], familyGroupController.update)

  return familyGroupsRouter
}
