import { Router } from 'express'
import { FamilyGroupsController } from '../controllers/familyGroups.js'
import { FamilyGroupService } from '../services/familyGroups.js'
import { isEntriesAdmin, verifyToken } from '../middleware/authJwt.js'
import { validateUuid } from '../middleware/validateUuid.js'

export const familyGroupsRouter = Router()

export const createFamilyGroupsRouter = (familyGroupService: FamilyGroupService) => {
  const familyGroupController = new FamilyGroupsController(familyGroupService);

  familyGroupsRouter.get('/', [verifyToken, isEntriesAdmin], familyGroupController.getFamilyGroups);
  familyGroupsRouter.post('/', [verifyToken, isEntriesAdmin], familyGroupController.createFamilyGroup);

  familyGroupsRouter.get('/:id', [validateUuid], familyGroupController.getFamilyGroupById);
  familyGroupsRouter.put('/:id', [verifyToken, isEntriesAdmin, validateUuid], familyGroupController.updateFamilyGroup);

  return familyGroupsRouter;
}
