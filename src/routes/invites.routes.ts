import { Router } from 'express'
import { InvitesService } from '../services/invites.js';
import { isInvitesAdmin } from '../middleware/auth.js';
import { validateUuid } from '../middleware/validateUuid.js';
import { checkJwt } from '../middleware/session.js';
import InvitesController from '../controllers/invites.js';

export const invitesRouter = Router();

export const createInvitesRouter = (invitesService: InvitesService) => {
  const invitesController = new InvitesController(invitesService);

  invitesRouter.get('/', [checkJwt, isInvitesAdmin], invitesController.getInvites);
  invitesRouter.post('/', [checkJwt, isInvitesAdmin], invitesController.createInvite);
  invitesRouter.post('/bulkInvites', [checkJwt, isInvitesAdmin], invitesController.bulkInvites);

  invitesRouter.get('/:id', [validateUuid], invitesController.getInviteById);
  invitesRouter.get('/invite/:id', [validateUuid], invitesController.getInviteForEvent);
  invitesRouter.delete('/:id', [checkJwt, isInvitesAdmin, validateUuid], invitesController.deleteInvite);
  invitesRouter.put('/:id', [checkJwt, isInvitesAdmin, validateUuid], invitesController.updateInvite);

  invitesRouter.patch('/messages/:id', [checkJwt, isInvitesAdmin], invitesController.readMessage);
  invitesRouter.patch('/:id', [validateUuid], invitesController.updateConfirmation);

  return invitesRouter
}