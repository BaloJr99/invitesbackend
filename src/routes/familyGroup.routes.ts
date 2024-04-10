import { Router } from 'express'
import { FamilyGroupsController } from '../controllers/familyGroups.js'
import { FamilyGroupService } from '../services/familyGroups.js'
import { isEntriesAdmin } from '../middleware/auth.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { checkJwt } from '../middleware/session.js'

export const familyGroupsRouter = Router()

export const createFamilyGroupsRouter = (familyGroupService: FamilyGroupService) => {
  const familyGroupController = new FamilyGroupsController(familyGroupService);

  familyGroupsRouter.get('/', [checkJwt, isEntriesAdmin], familyGroupController.getFamilyGroups);
  familyGroupsRouter.post('/', [checkJwt, isEntriesAdmin], familyGroupController.createFamilyGroup);

  familyGroupsRouter.get('/:id', [validateUuid], familyGroupController.getFamilyGroupById);
  familyGroupsRouter.put('/:id', [checkJwt, isEntriesAdmin, validateUuid], familyGroupController.updateFamilyGroup);

  return familyGroupsRouter;
}
