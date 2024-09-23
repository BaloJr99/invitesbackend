import { Router } from 'express'
import { InviteGroupsController } from '../controllers/inviteGroups.js'
import { InviteGroupsService } from '../services/inviteGroups.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { LoggerService } from '../services/logger.js'

export const inviteGroupsRouter = Router()

export const createInviteGroupsRouter = (
  inviteGroupService: InviteGroupsService,
  loggerService: LoggerService
) => {
  const inviteGroupController = new InviteGroupsController(
    inviteGroupService,
    loggerService
  )

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

  return inviteGroupsRouter
}
