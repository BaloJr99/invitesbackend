import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

export const validateUuid = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.route.path === '/:id') {
    const { id } = req.params

    const result = z
      .string()
      .uuid({
        message: 'Invalid UUID'
      })
      .safeParse(id)

    if (!result.success) {
      return res.status(400).json({ error: req.t('messages.WRONG_UUID') })
    }
  }

  next()
}
