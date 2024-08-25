import { Router } from 'express'
import { SettingsController } from '../controllers/settings.js'
import { EventSettingsService } from '../services/settings.js'
import { isInvitesAdmin } from '../middleware/auth.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { checkJwt } from '../middleware/session.js'

export const settingsRouter = Router()

export const createSettingsRouter = (eventSettingsService: EventSettingsService) => {
  const eventController = new SettingsController(eventSettingsService);

  settingsRouter.get('/:id', [validateUuid], eventController.getEventSettingsById);
  settingsRouter.post('/', [checkJwt, isInvitesAdmin], eventController.createEventSettings);
  settingsRouter.put('/:id', [checkJwt, isInvitesAdmin, validateUuid], eventController.updateEventSettings);

  return settingsRouter;
}
