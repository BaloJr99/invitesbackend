import { RolesService } from '../services/roles.js';
import { Request, Response } from 'express';
import { ErrorHandler } from '../utils/error.handle.js';
import { validateFullRole, validateRole } from '../schemas/roles.js';
import { LoggerService } from '../services/logger.js';

export class RolesController {
  errorHandler: ErrorHandler;
  constructor (
    private rolesService: RolesService,
    private loggerService: LoggerService
  ) {
    this.rolesService = rolesService;
    this.errorHandler = new ErrorHandler(this.loggerService);
  }

  getRoles = async (req: Request, res: Response) => {
    try {
      const roles = await this.rolesService.getRoles();

      return res.json(roles);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_GET_ALL_ROLES', e.message, req.userId);
    }
  }

  createRole = async (req: Request, res: Response) => {
    try {
      const result = validateFullRole(req.body)

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      await this.rolesService.createRole(result.data);

      return res.status(201).json({ message: req.t('messages.ROLE_CREATED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_CREATE_ROLE', e.message, req.userId);
    }
  }

  updateRole = async (req: Request, res: Response) => {
    try {
      const result = validateRole(req.body);
  
      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
      }
  
      const { id } = req.params;

      await this.rolesService.updateRole(
        id,
        result.data
      );
  
      return res.status(201).json({ message: req.t('messages.ROLE_UPDATED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_UPDATE_ROLE', e.message, req.userId);
    }
  }

  deleteRole = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.rolesService.deleteRole(id);
  
      return res.json({ message: req.t('messages.ROLE_DELETED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_DELETE_ROLE', e.message, req.userId);
    }
  }
}
