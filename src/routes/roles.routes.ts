import { Router } from 'express'
import { RolesController } from '../controllers/roles.js'
import { RolesService } from '../services/roles.js'
import { LoggerService } from '../services/logger.js'

export const rolesRouter = Router()

export const createRolesRouter = (
  rolesService: RolesService,
  loggerService: LoggerService
) => {
  const rolesController = new RolesController(rolesService, loggerService)

  rolesRouter.get('/', rolesController.getRoles)

  rolesRouter.get(
    '/profile/check-roleName/:roleName',
    rolesController.checkRoleName
  )

  rolesRouter.post('/', rolesController.createRole)
  rolesRouter.put('/:id', rolesController.updateRole)

  return rolesRouter
}
