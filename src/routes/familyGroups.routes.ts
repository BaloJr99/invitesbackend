import { Router } from 'express'
import { FamilyGroupsController } from '../controllers/familyGroups.js'
import { FamilyGroupsService } from '../services/familyGroups.js'
import { isInvitesAdmin } from '../middleware/auth.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { checkJwt } from '../middleware/session.js'
import { LoggerService } from '../services/logger.js'

export const familyGroupsRouter = Router()

export const createFamilyGroupsRouter = (familyGroupService: FamilyGroupsService, loggerService: LoggerService) => {
  const familyGroupController = new FamilyGroupsController(familyGroupService, loggerService);

  familyGroupsRouter.get('/:id', [checkJwt, isInvitesAdmin], familyGroupController.getFamilyGroups);
  familyGroupsRouter.post('/', [checkJwt, isInvitesAdmin], familyGroupController.createFamilyGroup);

  familyGroupsRouter.put('/:id', [checkJwt, isInvitesAdmin, validateUuid], familyGroupController.updateFamilyGroup);

  return familyGroupsRouter;
}
