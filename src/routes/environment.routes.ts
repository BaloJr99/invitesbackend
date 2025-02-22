import { Router } from 'express'
import { EnvironmentController } from '../controllers/environment.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export const environmentRouter = Router()

export const createEnvironmentRouter = (mysqlDatabase: MysqlDatabase) => {
  const environmentController = new EnvironmentController(mysqlDatabase)

  environmentRouter.post('/reset', environmentController.cleanEnvironment)

  return environmentRouter
}
