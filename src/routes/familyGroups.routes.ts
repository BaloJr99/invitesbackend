import { Router } from 'express'
import { FamilyGroupsController } from '../controllers/familyGroups.js'
import { FamilyGroupsService } from '../services/familyGroups.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { LoggerService } from '../services/logger.js'

export const familyGroupsRouter = Router()

export const createFamilyGroupsRouter = (
  familyGroupService: FamilyGroupsService,
  loggerService: LoggerService
) => {
  const familyGroupController = new FamilyGroupsController(
    familyGroupService,
    loggerService
  )

  familyGroupsRouter.get(
    '/:id',
    [validateUuid],
    familyGroupController.getFamilyGroups
  )
  familyGroupsRouter.post('/', familyGroupController.createFamilyGroup)

  familyGroupsRouter.put(
    '/:id',
    [validateUuid],
    familyGroupController.updateFamilyGroup
  )

  return familyGroupsRouter
}
