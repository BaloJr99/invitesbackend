import { RolesService } from '../services/roles.js';
import { Request, Response } from 'express';
import { handleHttp } from '../utils/error.handle.js';
import { validateFullRole, validateRole } from '../schemas/roles.js';

export class RolesController {
  constructor (private rolesService: RolesService) {
    this.rolesService = rolesService;
  }

  getRoles = async (req: Request, res: Response) => {
    try {
      const roles = await this.rolesService.getRoles();

      return res.json(roles);
    } catch (error) {
      handleHttp(res, 'ERROR_GET_ALL_ROLES');
    }
  }

  createRole = async (req: Request, res: Response) => {
    try {
      const result = validateFullRole(req.body)

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      await this.rolesService.createRole(result.data);

      return res.status(201).json({ message: 'Rol creado' });
    } catch (error) {
      handleHttp(res, 'ERROR_CREATE_ROLE');
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
  
      return res.status(201).json({ message: 'Rol actualizado' });
    } catch (error) {
      handleHttp(res, 'ERROR_UPDATE_ROLE');
    }
  }

  deleteRole = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.rolesService.deleteRole(id);
  
      return res.json({ message: 'Rol desactivado' });
    } catch (error) {
      handleHttp(res, 'ERROR_DELETE_ROLE');
    }
  }
}
