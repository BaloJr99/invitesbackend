import express, { json } from 'express'

import { Server } from 'socket.io'
import { createServer } from 'node:http'

import { createEntriesRouter } from './routes/entries.routes.js'
import { createEventsRouter } from './routes/events.routes.js'
import { createFamilyGroupsRouter } from './routes/familyGroup.routes.js'
import { createUsersRouter } from './routes/user.routes.js'
import { createAuthRouter } from './routes/auth.routes.js'
import { ACCEPTED_ORIGINS, corsMiddleware } from './middlewares/cors.js'
import 'dotenv/config.js'

export const createApp = ({ entryModel, userModel, eventModel, familyGroupModel }) => {
  const app = express()

  const server = createServer(app)

  const io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
      origin: ACCEPTED_ORIGINS,
      credentials: true
    }
  })

  io.on('connection', async (socket) => {
    socket.on('joinRoom', (username) => {
      if (username) {
        socket.join(username)
      }
    })

    socket.on('sendNotification', async (entryId) => {
      const [result] = await entryModel.getUserFromEntryId(entryId)
      const userId = result.at(0).userId
      const username = await userModel.getUsername(userId)

      io.to(username).emit('newNotification')
    })
  })

  app.use(json())
  app.use(corsMiddleware())
  app.disable('x-powered-by')

  app.use('/entries', createEntriesRouter({ entryModel }))
  app.use('/events', createEventsRouter({ eventModel }))
  app.use('/familyGroups', createFamilyGroupsRouter({ familyGroupModel }))
  app.use('/users', createUsersRouter({ userModel }))
  app.use('/auth', createAuthRouter({ userModel }))

  const PORT = process.env.PORT ?? 3000

  server.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
  })
}
