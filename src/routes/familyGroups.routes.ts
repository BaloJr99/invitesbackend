import { Router } from 'express'
import { FamilyGroupsController } from '../controllers/familyGroups.js'
import { FamilyGroupsService } from '../services/familyGroups.js'
import { isEntriesAdmin } from '../middleware/auth.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { checkJwt } from '../middleware/session.js'

export const familyGroupsRouter = Router()

export const createFamilyGroupsRouter = (familyGroupService: FamilyGroupsService) => {
  const familyGroupController = new FamilyGroupsController(familyGroupService);

  familyGroupsRouter.get('/', [checkJwt, isEntriesAdmin], familyGroupController.getFamilyGroups);
  familyGroupsRouter.post('/', [checkJwt, isEntriesAdmin], familyGroupController.createFamilyGroup);

  familyGroupsRouter.put('/:id', [checkJwt, isEntriesAdmin, validateUuid], familyGroupController.updateFamilyGroup);

  return familyGroupsRouter;
}
