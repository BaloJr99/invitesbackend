import { Router } from 'express'
import { LoggersController } from '../controllers/logs.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export const logsRouter = Router()

export const createLoggersRouter = (mysqlDatabase: MysqlDatabase) => {
  const loggerController = new LoggersController(mysqlDatabase)

  logsRouter.get('/', [validateUuid], loggerController.getLogs)

  return logsRouter
}
