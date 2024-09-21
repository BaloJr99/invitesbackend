import User from '../models/user.js'
import { NextFunction, Request, Response } from 'express'
import { verifyJwtToken } from '../utils/jwt.handle.js'
import { AuthModel } from '../interfaces/authModel.js'

export const checkJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jwt = req.headers.authorization || ''

    const decoded = verifyJwtToken(jwt) as AuthModel

    if (!decoded)
      return res.status(401).json({ error: req.t('messages.INVALID_AUTH') })

    const user = await User.findById(decoded.id, { password: 0 })

    if (!user)
      return res.status(404).json({ error: req.t('messages.INVALID_USER') })

    req.userId = decoded.id

    next()
  } catch (error) {
    return res.status(401).json({ error: req.t('messages.INVALID_AUTH') })
  }
}
