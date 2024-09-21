import {
  validateFamilyGroup,
  validateUpdateFamilyGroup
} from '../schemas/familyGroups.js'
import { FamilyGroupsService } from '../services/familyGroups.js'
import { Request, Response } from 'express'
import { ErrorHandler } from '../utils/error.handle.js'
import { LoggerService } from '../services/logger.js'

export class FamilyGroupsController {
  errorHandler: ErrorHandler
  constructor(
    private familyGroupService: FamilyGroupsService,
    private loggerService: LoggerService
  ) {
    this.familyGroupService = familyGroupService
    this.errorHandler = new ErrorHandler(this.loggerService)
  }

  getFamilyGroups = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const familyGroups = await this.familyGroupService.getFamilyGroups(id)

      return res.json(familyGroups)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_ALL_GROUPS',
        e.message,
        req.userId
      )
    }
  }

  createFamilyGroup = async (req: Request, res: Response) => {
    try {
      const result = validateFamilyGroup(req.body)

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      const familyGroupId = await this.familyGroupService.createFamilyGroup(
        result.data
      )

      return res
        .status(201)
        .json({ id: familyGroupId, message: req.t('messages.GROUP_CREATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CREATE_GROUP',
        e.message,
        req.userId
      )
    }
  }

  updateFamilyGroup = async (req: Request, res: Response) => {
    try {
      const result = validateUpdateFamilyGroup(req.body)

      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
      }

      const { id } = req.params

      await this.familyGroupService.updateFamilyGroup({
        id,
        familyGroup: result.data.familyGroup
      })

      return res.status(201).json({ message: req.t('messages.GROUP_UPDATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPDATE_GROUP',
        e.message,
        req.userId
      )
    }
  }
}
