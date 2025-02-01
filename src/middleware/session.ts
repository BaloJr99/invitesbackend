import User from '../models/user.js'
import { NextFunction, Request, Response } from 'express'
import { verifyJwtToken } from '../utils/jwt.handle.js'

export const checkJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jwt = req.headers.authorization?.split(' ')[1]
    let decoded = null

    // Check if the access token is valid
    if (!jwt) {
      const refreshToken = req.cookies['refreshToken']

      // Check if the refresh token is valid
      if (!refreshToken)
        return res.status(401).json({ error: req.t('messages.INVALID_AUTH') })

      // Verify the refresh token
      decoded = verifyJwtToken(refreshToken)
    } else {
      // Verify the access token
      decoded = verifyJwtToken(jwt)
    }

    // Check if the token is valid
    if (!decoded)
      return res.status(401).json({ error: req.t('messages.INVALID_AUTH') })

    // Check if the user exists
    const user = await User.findById(decoded.id, { password: 0 })
    if (!user)
      return res.status(404).json({ error: req.t('messages.INVALID_USER') })

    // Set the user id
    req.userId = decoded.id

    next()
  } catch {
    return res.status(401).json({ error: req.t('messages.INVALID_AUTH') })
  }
}
