import { Router } from 'express'
import { InviteGroupsController } from '../controllers/inviteGroups.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { isInvitesAdmin } from '../middleware/auth.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export const inviteGroupsRouter = Router()

export const createInviteGroupsRouter = (mysqlDatabase: MysqlDatabase) => {
  const inviteGroupController = new InviteGroupsController(mysqlDatabase)

  inviteGroupsRouter.get(
    '/:id',
    [validateUuid],
    inviteGroupController.getInviteGroups
  )

  inviteGroupsRouter.post('/', inviteGroupController.createInviteGroup)

  inviteGroupsRouter.put(
    '/:id',
    [validateUuid],
    inviteGroupController.updateInviteGroup
  )

  inviteGroupsRouter.get(
    `/check-invite-group/:eventId/:inviteGroup`,
    [validateUuid, isInvitesAdmin],
    inviteGroupController.checkInviteGroup
  )

  return inviteGroupsRouter
}
