import { NextFunction, Request, Response } from 'express'
import { z, ZodError } from 'zod'

export const validateUuid = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pathsWithUUID: string[] = req.route.path
    .split('/')
    .filter((path: string) => path.match(':[a-z].*'))
    .filter((path: string) => path.toLowerCase().includes('id'))

  const errors: ZodError<string>[] = []

  pathsWithUUID.forEach((path) => {
    const cleanPath = path.replace(':', '')
    const value = req.params[cleanPath]

    const result = z
      .string()
      .uuid({
        message: 'Invalid UUID'
      })
      .safeParse(value)

    if (!result.success) {
      errors.push(result.error)
    }
  })

  if (errors.length > 0) {
    return res.status(400).json(req.t('messages.WRONG_UUID'))
  }

  next()
}
