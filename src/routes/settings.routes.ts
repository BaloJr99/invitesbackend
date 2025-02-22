import { Router } from 'express'
import { SettingsController } from '../controllers/settings.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { checkJwt } from '../middleware/session.js'
import { isInvitesAdmin } from '../middleware/auth.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export const settingsRouter = Router()

export const createSettingsRouter = (mysqlDatabase: MysqlDatabase) => {
  const eventController = new SettingsController(mysqlDatabase)

  settingsRouter.get(
    '/:id',
    [validateUuid],
    eventController.getEventSettingsById
  )

  settingsRouter.post(
    '/:eventType',
    [checkJwt, isInvitesAdmin],
    eventController.createEventSettings
  )

  settingsRouter.put(
    '/:id/:eventType',
    [checkJwt, isInvitesAdmin, validateUuid],
    eventController.updateEventSettings
  )

  return settingsRouter
}
