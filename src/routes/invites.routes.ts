import { Router } from 'express'
import { isInvitesAdmin } from '../middleware/auth.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { checkJwt } from '../middleware/session.js'
import { InvitesController } from '../controllers/invites.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export const invitesRouter = Router()

export const createInvitesRouter = (mysqlDatabase: MysqlDatabase) => {
  const invitesController = new InvitesController(mysqlDatabase)

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

  invitesRouter.get('/isActive/:id', invitesController.isActive)

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
    '/cancel/:id',
    [checkJwt, validateUuid, isInvitesAdmin],
    invitesController.cancelInvites
  )

  invitesRouter.patch(
    '/overwrite/:id',
    [checkJwt, validateUuid, isInvitesAdmin],
    invitesController.overwriteConfirmation
  )

  invitesRouter.patch(
    '/:id/:eventType',
    [validateUuid],
    invitesController.updateConfirmation
  )

  return invitesRouter
}
