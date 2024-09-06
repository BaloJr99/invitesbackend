import { Request, Response } from 'express';
import { InvitesService } from '../services/invites.js';
import { FullInviteModel, PartialInviteModel } from '../interfaces/invitesModels.js';
import { validateBulkDeleteInvites, validateBulkInvite, validateConfirmationSchema, validateInvite } from '../schemas/invites.js';
import { verifyJwtToken } from '../utils/jwt.handle.js';
import { AuthModel } from '../interfaces/authModel.js';
import { ErrorHandler } from '../utils/error.handle.js';
import { LoggerService } from '../services/logger.js';
import { FamilyGroupsService } from '../services/familyGroups.js';
import { FamilyGroupModel, FullFamilyGroupModel } from '../interfaces/familyGroupModel.js';

export class InvitesController {
  errorHandler: ErrorHandler;

  constructor (
    private invitesService: InvitesService,
    private loggerService: LoggerService,
    private familyGroupsService: FamilyGroupsService
  ) {
    this.invitesService = invitesService;
    this.errorHandler = new ErrorHandler(this.loggerService);
  }

  getInvites = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization || '';

      const decoded = verifyJwtToken(token) as AuthModel;
      const isAdmin = decoded.roles.some(r => r.name == "admin");
      const [invites] = await this.invitesService.getAllInvites(decoded.id, isAdmin) as FullInviteModel[];

      return res.status(200).json(invites);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_GET_ALL_INVITES', e.message, req.userId);
    }
  };

  getInviteById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const invite = await this.invitesService.getInviteById(id) as FullInviteModel[];

      if (invite.length > 0) return res.json(invite.at(0));

      return res.status(404).json({ message: req.t('messages.INVITE_NOT_FOUND') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_GET_INVITE_BY_ID', e.message, req.userId);
    }
  };

  getInviteForEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const invite = await this.invitesService.getInvite(id) as FullInviteModel;

      if (invite) {
        await this.invitesService.markAsViewed(id);
        return res.json(invite);
      }

      return res.status(404).json({ message: req.t('messages.INVITE_NOT_FOUND') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_GET_INVITE_FOR_EVENT', e.message, req.userId);
    }
  };

  createInvite = async (req: Request, res: Response) => {
    try {
      const result = validateInvite(req.body);

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      const inviteId = await this.invitesService.createInvite(result.data);

      return res.status(201).json({ id: inviteId, message: req.t('messages.INVITE_CREATED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_CREATE_INVITE', e.message, req.userId);
    }
  };

  bulkInvites = async (req: Request, res: Response) => {
    try {
      const result = validateBulkInvite(req.body);

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      const bulkFamilyGroups = result.data.filter(f => f.isNewFamilyGroup).map(x => { 
        return {
          familyGroup: x.familyGroupName,
          eventId: x.eventId
        }
      }) as FamilyGroupModel[];
      
      let generatedIds: FullFamilyGroupModel[] = [];

      if (bulkFamilyGroups) {
        generatedIds = await this.familyGroupsService.bulkFamilyGroup(bulkFamilyGroups);
      }

      const bulkInvites = result.data.map((bulk) => {
        return {
          family: bulk.family,
          entriesNumber: bulk.entriesNumber,
          phoneNumber: bulk.phoneNumber,
          kidsAllowed: bulk.kidsAllowed,
          eventId: bulk.eventId,
          familyGroupId: bulk.familyGroupId ?? generatedIds.find(g => g.familyGroup === bulk.familyGroupName)?.id
        } as PartialInviteModel;
      });

      await this.invitesService.createBulkInvite(bulkInvites);

      return res.status(201).json({ message: req.t('messages.INVITES_CREATED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_BULK_INVITES', e.message, req.userId);
    }
  };

  bulkDeleteInvites = async (req: Request, res: Response) => {
    try {
      const result = validateBulkDeleteInvites(req.body);

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      await this.invitesService.bulkDeleteInvite(result.data);

      return res.status(201).json({ message: req.t('messages.INVITES_BULK_DELETED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_BULK_INVITES', e.message, req.userId);
    }
  };

  deleteInvite = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await this.invitesService.deleteInvite(id);

      return res.json({ message: req.t('messages.INVITE_DELETED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_DELETE_INVITE', e.message, req.userId);
    }
  };

  updateInvite = async (req: Request, res: Response) => {
    try {
      const result = validateInvite(req.body);

      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
      }

      const { id } = req.params;

      await this.invitesService.updateInvite(id, result.data);

      return res.status(201).json({ message: req.t('messages.INVITE_UPDATED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_UPDATE_INVITE', e.message, req.userId);
    }
  };

  updateConfirmation = async (req: Request, res: Response) => {
    try {
      const result = validateConfirmationSchema(req.body);

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params;
    await this.invitesService.updateConfirmation(id, result.data);

    return res.status(201).json({ message: req.t('messages.CONFIRMATION_SENT') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_UPDATE_CONFIRMATION', e.message, req.userId);
    }
  };

  readMessage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.invitesService.readMessage(id);
      return res.status(201).json({ message: req.t('messages.MESSAGE_READ') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_READ_MESSAGE', e.message, req.userId);
    }
  };
}