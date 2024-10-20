import { Router } from 'express'
import { UsersController } from '../controllers/users.js'
import { UsersService } from '../services/users.js'
import {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
} from '../middleware/verifySignup.js'
import { EventsService } from '../services/events.js'
import { LoggerService } from '../services/logger.js'
import { isAdmin, isInvitesAdmin } from '../middleware/auth.js'
import { FilesService } from '../services/files.js'

export const usersRouter = Router()

export const createUsersRouter = (
  userService: UsersService,
  eventsService: EventsService,
  loggerService: LoggerService,
  filesService: FilesService
) => {
  const userController = new UsersController(
    userService,
    eventsService,
    loggerService,
    filesService
  )

  usersRouter.get('/', [isAdmin], userController.getUsers)
  usersRouter.get('/basic', [isInvitesAdmin], userController.getUsersBasicInfo)
  usersRouter.get('/:id', [isAdmin], userController.getUserById)

  usersRouter.post(
    '/',
    [checkDuplicateUsernameOrEmail, checkRolesExisted, isAdmin],
    userController.createUser
  )

  usersRouter.put(
    '/profile',
    [isInvitesAdmin],
    userController.updateUserProfile
  )

  usersRouter.put(
    '/profile/photo',
    [isInvitesAdmin],
    userController.uploadProfilePhoto
  )

  usersRouter.get(
    '/profile/check-username/:username',
    [isInvitesAdmin],
    userController.checkUsername
  )

  usersRouter.get(
    '/profile/:id',
    [isInvitesAdmin],
    userController.getUserProfile
  )

  usersRouter.put('/:id', [isAdmin], userController.updateUser)
  usersRouter.delete('/:id', [isAdmin], userController.deleteUser)

  return usersRouter
}
