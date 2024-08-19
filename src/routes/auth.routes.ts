import { Router } from 'express'
import { AuthController } from '../controllers/auth.js'
import { UsersService } from '../services/users.js'

export const authRouter = Router();

export const createAuthRouter = (userService: UsersService) => {
  const authController = new AuthController(userService);

  authRouter.post('/signin', authController.signIn);

  return authRouter
}
