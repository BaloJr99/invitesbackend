import { NextFunction, Request, RequestHandler, Response } from 'express'
import { z, ZodError } from 'zod'

export const validateUuid: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
    res.status(422).json(JSON.parse(errors[0].message))
    return
  }

  next()
  return
}
