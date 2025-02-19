import { NextFunction, Request, Response } from 'express'
import { EnvConfig } from '../config/config.js'

export const isDevelopment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (EnvConfig().node_env === 'development') {
      next()
      return
    }

    return res.status(500).json({ error: req.t('messages.INVALID_ENV') })
  } catch {
    return res.status(500).json({ error: req.t('messages.INVALID_ENV') })
  }
}
