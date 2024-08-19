import { Router } from 'express'
import { RolesController } from '../controllers/roles.js'
import { RolesService } from '../services/roles.js'
import { isEntriesAdmin } from '../middleware/auth.js'
import { checkJwt } from '../middleware/session.js'

export const rolesRouter = Router()

export const createRolesRouter = (rolesService: RolesService) => {
  const rolesController = new RolesController(rolesService);

  rolesRouter.get('/', [checkJwt, isEntriesAdmin], rolesController.getRoles);
  rolesRouter.post('/', [checkJwt, isEntriesAdmin], rolesController.createRole);

  rolesRouter.put('/:id', [checkJwt, isEntriesAdmin], rolesController.updateRole);
  rolesRouter.delete('/:id', [checkJwt, isEntriesAdmin], rolesController.deleteRole);

  return rolesRouter;
}
