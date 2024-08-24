import { Router } from 'express'
import { AuthController } from '../controllers/auth.js'
import { UsersService } from '../services/users.js'
import { MailService } from '../services/mail.js';

export const authRouter = Router();

export const createAuthRouter = (userService: UsersService, mailService: MailService) => {
  const authController = new AuthController(userService, mailService);

  authRouter.post('/signin', authController.signIn);
  authRouter.post('/resetPassword', authController.resetPassword);

  return authRouter
}
