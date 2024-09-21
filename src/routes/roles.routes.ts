import { Router } from 'express'
import { RolesController } from '../controllers/roles.js'
import { RolesService } from '../services/roles.js'
import { LoggerService } from '../services/logger.js'
import { validateUuid } from '../middleware/validateUuid.js'

export const rolesRouter = Router()

export const createRolesRouter = (
  rolesService: RolesService,
  loggerService: LoggerService
) => {
  const rolesController = new RolesController(rolesService, loggerService)

  rolesRouter.get('/', rolesController.getRoles)
  rolesRouter.post('/', rolesController.createRole)

  rolesRouter.put('/:id', [validateUuid], rolesController.updateRole)
  rolesRouter.delete('/:id', [validateUuid], rolesController.deleteRole)

  return rolesRouter
}
