import { Router } from 'express'
import { FamilyGroupsController } from '../controllers/familyGroups.js'
import { FamilyGroupsService } from '../services/familyGroups.js'
import { isInvitesAdmin } from '../middleware/auth.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { checkJwt } from '../middleware/session.js'

export const familyGroupsRouter = Router()

export const createFamilyGroupsRouter = (familyGroupService: FamilyGroupsService) => {
  const familyGroupController = new FamilyGroupsController(familyGroupService);

  familyGroupsRouter.get('/', [checkJwt, isInvitesAdmin], familyGroupController.getFamilyGroups);
  familyGroupsRouter.post('/', [checkJwt, isInvitesAdmin], familyGroupController.createFamilyGroup);

  familyGroupsRouter.put('/:id', [checkJwt, isInvitesAdmin, validateUuid], familyGroupController.updateFamilyGroup);

  return familyGroupsRouter;
}
