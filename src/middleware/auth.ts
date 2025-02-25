import User from '../models/user.js'
import Role from '../models/role.js'
import { NextFunction, Request, RequestHandler, Response } from 'express'

export const isInvitesAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId)

    if (user) {
      const roles = await Role.find({ _id: { $in: user.roles } })

      if (roles.some((x) => x.name === 'invitesAdmin')) {
        next()
        return
      }
    }

    res.status(403).json({ error: req.t('messages.SESSION_NOT_ADMIN') })
    return
  } catch {
    res.status(500).json({ error: req.t('messages.INVALID_AUTH') })
    return
  }
}

export const isAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId)

    if (user) {
      const roles = await Role.find({ _id: { $in: user.roles } })

      if (roles.some((x) => x.name === 'admin')) {
        next()
        return
      }
    }

    res.status(403).json({ error: req.t('messages.SESSION_NOT_ADMIN') })
    return
  } catch {
    res.status(500).json({ error: req.t('messages.INVALID_AUTH') })
    return
  }
}
