import { NextFunction, Request, Response } from 'express'

export const isDevelopment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      next()
      return
    }

    return res.status(500).json({ error: req.t('messages.INVALID_ENV') })
  } catch (error) {
    return res.status(500).json({ error: req.t('messages.INVALID_ENV') })
  }
}
