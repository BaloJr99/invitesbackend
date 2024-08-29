import { Request, Response } from 'express';
import { handleHttp } from '../utils/error.handle.js';
import { InvitesService } from '../services/invites.js';
import { FullInviteModel } from '../interfaces/invitesModels.js';
import { validateBulkInvite, validateConfirmationSchema, validateInvite } from '../schemas/invites.js';
import { verifyJwtToken } from '../utils/jwt.handle.js';
import { AuthModel } from '../interfaces/authModel.js';

export class InvitesController {
  constructor (private invitesService: InvitesService) {
    this.invitesService = invitesService;
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
    } catch (error) {
      handleHttp(res, 'ERROR_GET_ALL_INVITES');
    }
  };

  getInviteById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const invite = await this.invitesService.getInviteById(id) as FullInviteModel[];

      if (invite.length > 0) return res.json(invite.at(0));

      return res.status(404).json({ message: 'Invitación no encontrada' });
    } catch (error) {
      handleHttp(res, 'ERROR_GET_INVITE_BY_ID');
    }
  };

  getInviteForEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const invite = await this.invitesService.getInvite(id) as FullInviteModel[];

      if (invite.length > 0) return res.json(invite.at(0));

      return res.status(404).json({ message: 'Invitación no encontrada' });
    } catch (error) {
      handleHttp(res, 'ERROR_GET_INVITE_FOR_EVENT');
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
    } catch (error) {
      handleHttp(res, 'ERROR_CREATE_INVITE');
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
    } catch (error) {
      handleHttp(res, 'ERROR_CREATE_INVITE');
    }
  };

  deleteInvite = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await this.invitesService.deleteInvite(id);

      return res.json({ message: 'Invitación eliminada' })
    } catch (error) {
      handleHttp(res, 'ERROR_DELETE_INVITE');
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
    } catch (error) {
      handleHttp(res, 'ERROR_UPDATE_INVITE');
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
    } catch (error) {
      handleHttp(res, 'ERROR_UPDATE_CONFIRMATION');
    }
  };

  readMessage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.invitesService.readMessage(id);
    } catch (error) {
      handleHttp(res, 'ERROR_READ_MESSAGE');
    }
  };
}

export default InvitesController;