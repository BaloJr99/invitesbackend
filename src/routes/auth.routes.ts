import { Router } from 'express'
import { AuthController } from '../controllers/auth.js'
import { UserService } from '../services/users.js'
import { checkDuplicateUsernameOrEmail, checkRolesExisted } from '../middleware/verifySignup.js'

export const authRouter = Router();

export const createAuthRouter = (userService: UserService) => {
  const authController = new AuthController(userService);

  authRouter.post('/signup', [checkDuplicateUsernameOrEmail, checkRolesExisted], authController.signUp);
  authRouter.post('/signin', authController.signIn);

  return authRouter
}
