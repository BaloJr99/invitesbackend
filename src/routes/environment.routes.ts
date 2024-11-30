import { Router } from 'express'
import { LoggerService } from '../services/logger.js'
import { EnvironmentService } from '../services/environment.js'
import { EnvironmentController } from '../controllers/environment.js'

export const environmentRouter = Router()

export const createEnvironmentRouter = (
  environmentService: EnvironmentService,
  loggerService: LoggerService
) => {
  const environmentController = new EnvironmentController(
    environmentService,
    loggerService
  )

  environmentRouter.post('/reset', environmentController.cleanEnvironment)

  return environmentRouter
}
