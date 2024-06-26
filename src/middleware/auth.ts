import User from '../models/user.js'
import Role from '../models/role.js'
import { NextFunction, Request, Response } from 'express';

export const isEntriesAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);

    if (user) {
      const roles = await Role.find({ _id: { $in: user.roles } });

      if (roles.some(x => x.name === 'entriesAdmin' || x.name === 'admin')) {
        next();
        return;
      }
    }
    
    return res.status(403).json({ error: 'SESSION_NOT_ADMIN' });
  } catch (error) {
    return res.status(500).json({ error: 'ERROR_AUTH' });
  }
}