import { Router } from 'express'
import { InvitesService } from '../services/invites.js'
import { isInvitesAdmin } from '../middleware/auth.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { checkJwt } from '../middleware/session.js'
import { LoggerService } from '../services/logger.js'
import { InvitesController } from '../controllers/invites.js'
import { InviteGroupsService } from '../services/inviteGroups.js'

export const invitesRouter = Router()

export const createInvitesRouter = (
  invitesService: InvitesService,
  loggerService: LoggerService,
  inviteGroupsService: InviteGroupsService
) => {
  const invitesController = new InvitesController(
    invitesService,
    loggerService,
    inviteGroupsService
  )

  invitesRouter.get(
    '/',
    [checkJwt, isInvitesAdmin],
    invitesController.getInvites
  )
  invitesRouter.post(
    '/',
    [checkJwt, isInvitesAdmin],
    invitesController.createInvite
  )
  invitesRouter.post(
    '/bulkInvites',
    [checkJwt, isInvitesAdmin],
    invitesController.bulkInvites
  )
  invitesRouter.delete(
    '/bulkInvites',
    [checkJwt, isInvitesAdmin],
    invitesController.bulkDeleteInvites
  )

  invitesRouter.get(
    '/invite/:id/event',
    [validateUuid],
    invitesController.getInviteEventType
  )

  invitesRouter.get(
    '/invite/:id',
    [validateUuid],
    invitesController.getInviteForEvent
  )

  invitesRouter.delete(
    '/:id',
    [checkJwt, isInvitesAdmin, validateUuid],
    invitesController.deleteInvite
  )

  invitesRouter.put(
    '/:id',
    [checkJwt, isInvitesAdmin, validateUuid],
    invitesController.updateInvite
  )

  invitesRouter.patch(
    '/messages/:id',
    [checkJwt, isInvitesAdmin, validateUuid],
    invitesController.readMessage
  )

  invitesRouter.patch(
    '/:id',
    [validateUuid],
    invitesController.updateConfirmation
  )

  return invitesRouter
}
