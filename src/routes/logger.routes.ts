import { Router } from 'express'
import { LoggersController } from '../controllers/logs.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { LoggerService } from '../services/logger.js'
import { UsersService } from '../services/users.js'

export const logsRouter = Router()

export const createLoggersRouter = (loggerService: LoggerService, usersService: UsersService) => {
  const loggerController = new LoggersController(loggerService, usersService);

  logsRouter.get('/', [validateUuid], loggerController.getLogs);

  return logsRouter;
}
