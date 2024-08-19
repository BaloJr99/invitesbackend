import { validateFamilyGroup } from '../schemas/familyGroups.js'
import { FamilyGroupsService } from '../services/familyGroups.js';
import { Request, Response } from 'express';
import { AuthModel } from '../interfaces/authModel.js';
import { handleHttp } from '../utils/error.handle.js';
import { verifyJwtToken } from '../utils/jwt.handle.js';

export class FamilyGroupsController {
  constructor (private familyGroupService: FamilyGroupsService) {
    this.familyGroupService = familyGroupService;
  }

  getFamilyGroups = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization || '';

      if (token === "") return res.status(403).json({ error: 'No token provided' });

      const decoded = verifyJwtToken(token) as AuthModel;

      const familyGroups = await this.familyGroupService.getFamilyGroups(decoded.id);

      return res.json(familyGroups);
    } catch (error) {
      handleHttp(res, 'ERROR_GET_ALL_FAMILIES');
    }
  }

  createFamilyGroup = async (req: Request, res: Response) => {
    try {
      const result = validateFamilyGroup(req.body);
  
      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }
  
      const token = req.headers.authorization || '';
  
      if (token === "") return res.status(403).json({ error: 'No token provided' });
  
      const decoded = verifyJwtToken(token) as AuthModel;
  
      const familyGroupId = await this.familyGroupService.createFamilyGroup(
        result.data,
        decoded.id
      );

      return res.status(201).json({ id: familyGroupId, message: 'Grupo familiar creado' });
    } catch (error) {
      handleHttp(res, 'ERROR_CREATE_FAMILY');
    }
  }

  updateFamilyGroup = async (req: Request, res: Response) => {
    try {
      const result = validateFamilyGroup(req.body);
  
      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
      }
  
      const { id } = req.params;
      
      await this.familyGroupService.updateFamilyGroup(
        id,
        result.data
      );
  
      return res.status(201).json({ message: 'Grupo familiar actualizado' });
    } catch (error) {
      handleHttp(res, 'ERROR_UPDATE_FAMILY');
    }
  }
}
