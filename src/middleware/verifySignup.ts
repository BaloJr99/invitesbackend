import { NextFunction, Request, Response } from 'express'
import { ROLES } from '../models/role.js'
import User from '../models/user.js'

export const checkRolesExisted = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.lenght; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        const roleNotFound = req.body.roles[i];
        return res.status(400).json({
          message: req.t('messages.ROLE_NOT_FOUND', { roleNotFound })
        })
      }
    }
  }

  next()
}

export const checkDuplicateUsernameOrEmail = async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ username: req.body.username })

  if (user) return res.status(409).json({ message: req.t('messages.USER_EXISTS') })

  const email = await User.findOne({ email: req.body.email })
  if (email) return res.status(409).json({ message: req.t('messages.EMAIL_EXISTS') })

  next()
}
