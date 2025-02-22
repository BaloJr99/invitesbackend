import { Router } from 'express'
import { UsersController } from '../controllers/users.js'
import {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
} from '../middleware/verifySignup.js'
import { isAdmin, isInvitesAdmin } from '../middleware/auth.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export const usersRouter = Router()

export const createUsersRouter = (mysqlDatabase: MysqlDatabase) => {
  const userController = new UsersController(mysqlDatabase)

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
  usersRouter.delete('/:id', [isAdmin], userController.deactivateUser)

  return usersRouter
}
