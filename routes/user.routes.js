import { Router } from 'express'
import { UsersController } from '../controllers/users.js'

export const usersRouter = Router()

export const createUsersRouter = ({ userModel }) => {
  const usersController = new UsersController({ userModel })

  usersRouter.get('/', usersController.getAll)

  return usersRouter
}
