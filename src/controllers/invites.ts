import { Request, Response } from 'express';
import { InvitesService } from '../services/invites.js';
import { FullInviteModel } from '../interfaces/invitesModels.js';
import { validateBulkInvite, validateConfirmationSchema, validateInvite } from '../schemas/invites.js';
import { verifyJwtToken } from '../utils/jwt.handle.js';
import { AuthModel } from '../interfaces/authModel.js';
import { ErrorHandler } from '../utils/error.handle.js';
import { LoggerService } from '../services/logger.js';

export class InvitesController {
  errorHandler: ErrorHandler;

  constructor (
    private invitesService: InvitesService,
    private loggerService: LoggerService
  ) {
    this.invitesService = invitesService;
    this.errorHandler = new ErrorHandler(this.loggerService);
  }

  getInvites = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization || '';

      if (token === "") {
        return res.status(403).json({ error: 'No token provided' });
      }

      const decoded = verifyJwtToken(token) as AuthModel;
      const isAdmin = decoded.roles.some(r => r.name == "admin");
      const [invites] = await this.invitesService.getAllInvites(decoded.id, isAdmin) as FullInviteModel[];

      return res.status(200).json(invites);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_GET_ALL_INVITES', e.message, req.userId);
    }
  };

  getInviteById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const invite = await this.invitesService.getInviteById(id) as FullInviteModel[];

      if (invite.length > 0) return res.json(invite.at(0));

      return res.status(404).json({ message: 'Invitación no encontrada' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_GET_INVITE_BY_ID', e.message, req.userId);
    }
  };

  getInviteForEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const invite = await this.invitesService.getInvite(id) as FullInviteModel[];

      if (invite.length > 0) return res.json(invite.at(0));

      return res.status(404).json({ message: 'Invitación no encontrada' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_GET_INVITE_FOR_EVENT', e.message, req.userId);
    }
  };

  createInvite = async (req: Request, res: Response) => {
    try {
      const result = validateInvite(req.body);

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      const inviteId = await this.invitesService.createInvite(result.data);

      return res.status(201).json({ id: inviteId, message: 'Invitación creada' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_CREATE_INVITE', e.message, req.userId);
    }
  };

  bulkInvites = async (req: Request, res: Response) => {
    try {
      const result = validateBulkInvite(req.body);

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      await this.invitesService.createBulkInvite(result.data);

      return res.status(201).json({ message: 'Invitaciones creadas' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_BULK_INVITES', e.message, req.userId);
    }
  };

  deleteInvite = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await this.invitesService.deleteInvite(id);

      return res.json({ message: 'Invitación eliminada' })
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_DELETE_INVITE', e.message, req.userId);
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

      return res.status(201).json({ message: 'Invitación actualizada' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_UPDATE_INVITE', e.message, req.userId);
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

    return res.status(201).json({ message: 'Respuesta enviada' })
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_UPDATE_CONFIRMATION', e.message, req.userId);
    }
  };

  readMessage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.invitesService.readMessage(id);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_READ_MESSAGE', e.message, req.userId);
    }
  };
}