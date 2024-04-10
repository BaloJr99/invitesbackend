import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import Role from '../models/role.js'
import { NextFunction, Request, Response } from 'express'
import { AuthModel } from '../interfaces/authModel.js'

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['x-access-token'] as string;

    if (token === "") {
      return res.status(403).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.SECRET) as AuthModel;

    const user = await User.findById(decoded.id, { password: 0 });

    if (!user) return res.status(404).json({ error: 'No user found' });

    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

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