import { NextFunction, Request, RequestHandler, Response } from 'express'
import { ROLES } from '../models/role.js'
import User from '../models/user.js'

export const checkRolesExisted: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.lenght; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        const roleNotFound = req.body.roles[i]
        res.status(400).json({
          message: req.t('messages.ROLE_NOT_FOUND', { roleNotFound })
        })
        return
      }
    }
  }

  next()
  return
}

export const checkDuplicateUsernameOrEmail: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = await User.findOne({ username: req.body.username })

  if (user) {
    res.status(409).json({ message: req.t('messages.USER_EXISTS') })
    return
  }

  const email = await User.findOne({ email: req.body.email })
  if (email) {
    res.status(409).json({ message: req.t('messages.EMAIL_EXISTS') })
    return
  }

  next()
  return
}
