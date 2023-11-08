import { z } from 'zod'

export const validateUuid = (req, res, next) => {
  if (req.route.path === '/:id') {
    const { id } = req.params

    const result = z.string().uuid({
      message: 'Invalid UUID'
    }).safeParse(id)

    if (result.error) {
      return res.status(400).json({ error: 'Wrong uuid format' })
    }
  }

  next()
}
