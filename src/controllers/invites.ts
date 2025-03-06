import { Request, RequestHandler, Response } from 'express'
import {
  validateBulkDeleteInvites,
  validateBulkInvite,
  validateInvite,
  validateConfirmationSchema,
  validateSaveTheDateConfirmationSchema
} from '../schemas/invites.js'
import { verifyJwtToken } from '../utils/jwt.handle.js'
import { ErrorHandler } from '../utils/error.handle.js'
import { IBulkInvite, IFullInviteGroup } from '../global/types.js'
import { EventType } from '../global/enum.js'
import { InviteGroupsRepository } from '../repositories/invite-groups-repository.js'
import { InvitesRepository } from '../repositories/invites-repository.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { IInviteGroupsRepository } from '../interfaces/invite-groups-repository.js'
import { IInvitesRepository } from '../interfaces/invites-repository.js'
import { IEventsRepository } from '../interfaces/events-repository.js'
import { EventsRepository } from '../repositories/events-repository.js'

export class InvitesController {
  private errorHandler: ErrorHandler
  private invitesRepository: IInvitesRepository
  private inviteGroupsRepository: IInviteGroupsRepository
  private eventsRepository: IEventsRepository

  constructor(mysqlDatabase: MysqlDatabase) {
    this.inviteGroupsRepository = new InviteGroupsRepository(mysqlDatabase)
    this.invitesRepository = new InvitesRepository(mysqlDatabase)
    this.errorHandler = new ErrorHandler(mysqlDatabase)
    this.eventsRepository = new EventsRepository(mysqlDatabase)
  }

  getInvites: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const token = req.headers.authorization || ''

      const decoded = verifyJwtToken(token)
      const isAdmin = decoded.roles.some((r) => r.name == 'admin')
      const invites = await this.invitesRepository.getAllInvites(
        decoded.id,
        isAdmin
      )

      res.json(invites)
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

  getInviteForEvent: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params

      const invite = await this.invitesRepository.getInvite(id)

      if (invite.length > 0) {
        await this.invitesRepository.markAsViewed(id)
        res.json(invite.at(0))
        return
      }

      res.status(404).json({ message: req.t('messages.INVITE_NOT_FOUND') })
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

  createInvite: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateInvite(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const inviteId = await this.invitesRepository.createInvite({
        ...result.data,
        id: ''
      })

      res
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

  bulkInvites: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateBulkInvite(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const bulkInviteGroups = [
        ...new Set(
          result.data
            .filter((f) => f.isNewInviteGroup)
            .map((x) => {
              return x.inviteGroupName
            })
        )
      ]

      let generatedInviteGroups: IFullInviteGroup[] = []

      if (bulkInviteGroups) {
        generatedInviteGroups =
          await this.inviteGroupsRepository.bulkInviteGroup(
            result.data[0].eventId,
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

      const generatedInvites = await this.invitesRepository.createBulkInvite(
        bulkInvites
      )

      res.status(201).json({
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

  bulkDeleteInvites: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateBulkDeleteInvites(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      await this.invitesRepository.bulkDeleteInvite(result.data)

      res.status(201).json({ message: req.t('messages.INVITES_BULK_DELETED') })
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

  deleteInvite: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params

      await this.invitesRepository.deleteInvite(id)

      res.json({ message: req.t('messages.INVITE_DELETED') })
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

  updateInvite: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateInvite(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const { id } = req.params

      await this.invitesRepository.updateInvite({
        ...result.data,
        id
      })

      res.status(201).json({ message: req.t('messages.INVITE_UPDATED') })
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

  updateConfirmation: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      let result

      const { id, eventType } = req.params

      if (eventType === EventType.Xv) {
        result = validateConfirmationSchema(req.body)

        if (!result.success) {
          res.status(422).json(JSON.parse(result.error.message))
          return
        }

        await this.invitesRepository.updateSweetXvConfirmation({
          ...result.data,
          id
        })
      } else {
        result = validateSaveTheDateConfirmationSchema(req.body)

        if (!result.success) {
          res.status(422).json(JSON.parse(result.error.message))
          return
        }

        await this.invitesRepository.updateSaveTheDateConfirmation({
          ...result.data,
          id
        })
      }

      res.status(201).json({ message: req.t('messages.CONFIRMATION_SENT') })
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

  readMessage: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params
      await this.invitesRepository.readMessage(id)
      res.json({ message: req.t('messages.MESSAGE_READ') })
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

  getInviteEventType: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params

      const invite = await this.invitesRepository.getInviteEventType(id)

      if (invite.length > 0) {
        res.json(invite[0].typeOfEvent)
        return
      }

      res.status(404).json({ message: req.t('messages.INVITE_NOT_FOUND') })
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

  isActive: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params

      const eventId = await this.eventsRepository.getEventId(id)

      if (eventId === '') {
        res.status(404).json({ message: req.t('messages.EVENT_NOT_FOUND') })
        return
      }

      const isActive = await this.eventsRepository.isActive(id)

      res.json({
        isActive,
        eventId
      })
      return
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_IS_ACTIVE',
        e.message,
        req.userId
      )
    }
  }
}
