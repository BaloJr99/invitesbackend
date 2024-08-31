import { Router } from 'express'
import { SettingsController } from '../controllers/settings.js'
import { SettingsService } from '../services/settings.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { LoggerService } from '../services/logger.js'

export const settingsRouter = Router()

export const createSettingsRouter = (settingsService: SettingsService, loggerService: LoggerService) => {
  const eventController = new SettingsController(settingsService, loggerService);

  settingsRouter.get('/:id', [validateUuid], eventController.getEventSettingsById);
  settingsRouter.post('/', eventController.createEventSettings);
  settingsRouter.put('/:id', [validateUuid], eventController.updateEventSettings);

  return settingsRouter;
}
