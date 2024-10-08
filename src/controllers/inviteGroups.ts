import {
  validateInviteGroup,
  validateUpdateInviteGroup
} from '../schemas/inviteGroups.js'
import { InviteGroupsService } from '../services/inviteGroups.js'
import { Request, Response } from 'express'
import { ErrorHandler } from '../utils/error.handle.js'
import { LoggerService } from '../services/logger.js'

export class InviteGroupsController {
  errorHandler: ErrorHandler
  constructor(
    private inviteGroupService: InviteGroupsService,
    private loggerService: LoggerService
  ) {
    this.inviteGroupService = inviteGroupService
    this.errorHandler = new ErrorHandler(this.loggerService)
  }

  getInviteGroups = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const inviteGroups = await this.inviteGroupService.getInviteGroups(id)

      return res.json(inviteGroups)
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

  createInviteGroup = async (req: Request, res: Response) => {
    try {
      const result = validateInviteGroup(req.body)

      if (!result.success) {
        return res.status(422).json(JSON.parse(result.error.message))
      }

      const inviteGroupId = await this.inviteGroupService.createInviteGroup(
        result.data
      )

      return res
        .status(201)
        .json({ id: inviteGroupId, message: req.t('messages.GROUP_CREATED') })
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

  updateInviteGroup = async (req: Request, res: Response) => {
    try {
      const result = validateUpdateInviteGroup(req.body)

      if (!result.success) {
        return res.status(422).json(JSON.parse(result.error.message))
      }

      const { id } = req.params

      await this.inviteGroupService.updateInviteGroup({
        id,
        inviteGroup: result.data.inviteGroup
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

  checkInviteGroup = async (req: Request, res: Response) => {
    try {
      const { eventId, inviteGroup } = req.params
      const isDuplicated = await this.inviteGroupService.checkInviteGroup(
        eventId,
        inviteGroup
      )

      return res.json(isDuplicated)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CHECK_INVITE_GROUP',
        e.message,
        req.userId
      )
    }
  }
}
