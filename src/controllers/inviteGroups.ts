import {
  validateInviteGroup,
  validateUpdateInviteGroup
} from '../schemas/inviteGroups.js'
import { Request, RequestHandler, Response } from 'express'
import { ErrorHandler } from '../utils/error.handle.js'
import { InviteGroupsRepository } from '../repositories/invite-groups-repository.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export class InviteGroupsController {
  private errorHandler: ErrorHandler
  private inviteGroupsRepository: InviteGroupsRepository

  constructor(mysqlDatabase: MysqlDatabase) {
    this.inviteGroupsRepository = new InviteGroupsRepository(mysqlDatabase)
    this.errorHandler = new ErrorHandler(mysqlDatabase)
  }

  getInviteGroups: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params

      const inviteGroups = await this.inviteGroupsRepository.getInviteGroups(id)

      res.json(inviteGroups)
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

  createInviteGroup: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateInviteGroup(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const inviteGroupId = await this.inviteGroupsRepository.createInviteGroup(
        result.data
      )

      res
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

  updateInviteGroup: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateUpdateInviteGroup(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const { id } = req.params

      await this.inviteGroupsRepository.updateInviteGroup({
        id,
        inviteGroup: result.data.inviteGroup
      })

      res.status(201).json({ message: req.t('messages.GROUP_UPDATED') })
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

  checkInviteGroup: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { eventId, inviteGroup } = req.params
      const isDuplicated = await this.inviteGroupsRepository.checkInviteGroup(
        eventId,
        inviteGroup
      )

      res.json(isDuplicated)
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
