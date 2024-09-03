import User from '../models/user.js'
import Role from '../models/role.js'
import { NextFunction, Request, Response } from 'express';

export const isInvitesAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);

    if (user) {
      const roles = await Role.find({ _id: { $in: user.roles } });

      if (roles.some(x => x.name === 'invitesAdmin')) {
        next();
        return;
      }
    }
    
    return res.status(403).json({ error: req.t('messages.SESSION_NOT_ADMIN') });
  } catch (error) {
    return res.status(500).json({ error: req.t('messages.INVALID_AUTH') });
  }
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);

    if (user) {
      const roles = await Role.find({ _id: { $in: user.roles } });

      if (roles.some(x => x.name === 'admin')) {
        next();
        return;
      }
    }
    
    return res.status(403).json({ error: req.t('messages.SESSION_NOT_ADMIN') });
  } catch (error) {
    return res.status(500).json({ error: req.t('messages.INVALID_AUTH') });
  }
}