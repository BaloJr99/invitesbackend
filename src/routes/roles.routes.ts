import { Router } from 'express'
import { RolesController } from '../controllers/roles.js'
import { RolesService } from '../services/roles.js'
import { isInvitesAdmin } from '../middleware/auth.js'
import { checkJwt } from '../middleware/session.js'

export const rolesRouter = Router()

export const createRolesRouter = (rolesService: RolesService) => {
  const rolesController = new RolesController(rolesService);

  rolesRouter.get('/', [checkJwt, isInvitesAdmin], rolesController.getRoles);
  rolesRouter.post('/', [checkJwt, isInvitesAdmin], rolesController.createRole);

  rolesRouter.put('/:id', [checkJwt, isInvitesAdmin], rolesController.updateRole);
  rolesRouter.delete('/:id', [checkJwt, isInvitesAdmin], rolesController.deleteRole);

  return rolesRouter;
}
