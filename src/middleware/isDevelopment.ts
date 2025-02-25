import { NextFunction, Request, RequestHandler, Response } from 'express'
import { EnvConfig } from '../config/config.js'

export const isDevelopment: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (EnvConfig().node_env === 'development') {
      next()
      return
    }

    res.status(500).json({ error: req.t('messages.INVALID_ENV') })
    return
  } catch {
    res.status(500).json({ error: req.t('messages.INVALID_ENV') })
    return
  }
}
