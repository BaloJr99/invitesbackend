import express, { json } from 'express'

import { createEntriesRouter } from './routes/entries.routes.js'
import { createUsersRouter } from './routes/user.routes.js'
import { createAuthRouter } from './routes/auth.routes.js'
import { corsMiddleware } from './middlewares/cors.js'
import 'dotenv/config.js'

export const createApp = ({ entryModel, userModel }) => {
  const app = express()

  app.use(json())
  app.use(corsMiddleware())
  app.disable('x-powered-by')

  app.use('/entries', createEntriesRouter({ entryModel }))
  app.use('/users', createUsersRouter({ userModel }))
  app.use('/auth', createAuthRouter({ userModel }))

  const PORT = process.env.PORT ?? 3000

  app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
  })
}
