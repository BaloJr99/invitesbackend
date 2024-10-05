import { Router } from 'express'
import { SettingsController } from '../controllers/settings.js'
import { SettingsService } from '../services/settings.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { LoggerService } from '../services/logger.js'
import { checkJwt } from '../middleware/session.js'
import { isInvitesAdmin } from '../middleware/auth.js'

export const settingsRouter = Router()

export const createSettingsRouter = (
  settingsService: SettingsService,
  loggerService: LoggerService
) => {
  const eventController = new SettingsController(settingsService, loggerService)

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
