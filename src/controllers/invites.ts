import { Request, Response } from 'express'
import { InvitesService } from '../services/invites.js'
import {
  validateBulkDeleteInvites,
  validateBulkInvite,
  validateConfirmationSchema,
  validateInvite
} from '../schemas/invites.js'
import { verifyJwtToken } from '../utils/jwt.handle.js'
import { ErrorHandler } from '../utils/error.handle.js'
import { LoggerService } from '../services/logger.js'
import { InviteGroupsService } from '../services/inviteGroups.js'
import { IFullInviteGroup } from '../interfaces/inviteGroupsModel.js'
import { IBulkInvite } from '../interfaces/invitesModels.js'

export class InvitesController {
  errorHandler: ErrorHandler

  constructor(
    private invitesService: InvitesService,
    private loggerService: LoggerService,
    private inviteGroupsService: InviteGroupsService
  ) {
    this.invitesService = invitesService
    this.errorHandler = new ErrorHandler(this.loggerService)
  }

  getInvites = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization || ''

      const decoded = verifyJwtToken(token)
      const isAdmin = decoded.roles.some((r) => r.name == 'admin')
      const invites = await this.invitesService.getAllInvites(
        decoded.id,
        isAdmin
      )

      return res.status(200).json(invites)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_ALL_INVITES',
        e.message,
        req.userId
      )
    }
  }

  getInviteForEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const invite = await this.invitesService.getInvite(id)

      if (invite.length > 0) {
        await this.invitesService.markAsViewed(id)
        return res.json(invite.at(0))
      }

      return res
        .status(404)
        .json({ message: req.t('messages.INVITE_NOT_FOUND') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_INVITE_FOR_EVENT',
        e.message,
        req.userId
      )
    }
  }

  createInvite = async (req: Request, res: Response) => {
    try {
      const result = validateInvite(req.body)

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      const inviteId = await this.invitesService.createInvite({
        ...result.data,
        id: ''
      })

      return res
        .status(201)
        .json({ id: inviteId, message: req.t('messages.INVITE_CREATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CREATE_INVITE',
        e.message,
        req.userId
      )
    }
  }

  bulkInvites = async (req: Request, res: Response) => {
    try {
      const result = validateBulkInvite(req.body)

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      const bulkInviteGroups = result.data
        .filter((f) => f.isNewInviteGroup)
        .map((x) => {
          return {
            inviteGroup: x.inviteGroupName,
            eventId: x.eventId
          }
        })

      let generatedInviteGroups: IFullInviteGroup[] = []

      if (bulkInviteGroups) {
        generatedInviteGroups = await this.inviteGroupsService.bulkInviteGroup(
          bulkInviteGroups
        )
      }

      const bulkInvites = result.data.map((bulk) => {
        return {
          family: bulk.family,
          entriesNumber: bulk.entriesNumber,
          phoneNumber: bulk.phoneNumber,
          kidsAllowed: bulk.kidsAllowed,
          eventId: bulk.eventId,
          inviteGroupId:
            bulk.inviteGroupId === ''
              ? generatedInviteGroups.find(
                  (g) => g.inviteGroup === bulk.inviteGroupName
                )?.id
              : bulk.inviteGroupId
        } as IBulkInvite
      })

      const generatedInvites = await this.invitesService.createBulkInvite(
        bulkInvites
      )

      return res.status(201).json({
        inviteGroupsGenerated: generatedInviteGroups,
        invitesGenerated: generatedInvites,
        message: req.t('messages.INVITES_CREATED')
      })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_BULK_INVITES',
        e.message,
        req.userId
      )
    }
  }

  bulkDeleteInvites = async (req: Request, res: Response) => {
    try {
      const result = validateBulkDeleteInvites(req.body)

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      await this.invitesService.bulkDeleteInvite(result.data)

      return res
        .status(201)
        .json({ message: req.t('messages.INVITES_BULK_DELETED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_BULK_INVITES',
        e.message,
        req.userId
      )
    }
  }

  deleteInvite = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      await this.invitesService.deleteInvite(id)

      return res.json({ message: req.t('messages.INVITE_DELETED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_DELETE_INVITE',
        e.message,
        req.userId
      )
    }
  }

  updateInvite = async (req: Request, res: Response) => {
    try {
      const result = validateInvite(req.body)

      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
      }

      const { id } = req.params

      await this.invitesService.updateInvite({
        ...result.data,
        id
      })

      return res.status(201).json({ message: req.t('messages.INVITE_UPDATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPDATE_INVITE',
        e.message,
        req.userId
      )
    }
  }

  updateConfirmation = async (req: Request, res: Response) => {
    try {
      const result = validateConfirmationSchema(req.body)

      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
      }

      const { id } = req.params
      await this.invitesService.updateConfirmation({
        ...result.data,
        id,
        entriesNumber: 0
      })

      return res
        .status(201)
        .json({ message: req.t('messages.CONFIRMATION_SENT') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPDATE_CONFIRMATION',
        e.message,
        req.userId
      )
    }
  }

  readMessage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      await this.invitesService.readMessage(id)
      return res.status(201).json({ message: req.t('messages.MESSAGE_READ') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_READ_MESSAGE',
        e.message,
        req.userId
      )
    }
  }

  getInviteEventType = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const invite = await this.invitesService.getInviteEventType(id)

      if (invite.length > 0) {
        return res.json(invite[0].typeOfEvent)
      }

      return res
        .status(404)
        .json({ message: req.t('messages.INVITE_NOT_FOUND') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_INVITE_EVENT_TYPE',
        e.message,
        req.userId
      )
    }
  }
}
