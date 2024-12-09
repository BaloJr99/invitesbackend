import { Router } from 'express'
import { LoggerService } from '../services/logger.js'
import { EnvironmentService } from '../services/environment.js'
import { EnvironmentController } from '../controllers/environment.js'
import { FilesService } from '../services/files.js'
import { UsersService } from '../services/users.js'
import { RolesService } from '../services/roles.js'

export const environmentRouter = Router()

export const createEnvironmentRouter = (
  environmentService: EnvironmentService,
  filesService: FilesService,
  loggerService: LoggerService,
  rolesService: RolesService,
  usersService: UsersService
) => {
  const environmentController = new EnvironmentController(
    environmentService,
    filesService,
    loggerService,
    rolesService,
    usersService
  )

  environmentRouter.post('/reset', environmentController.cleanEnvironment)

  return environmentRouter
}
