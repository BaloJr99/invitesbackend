import { Router } from 'express'
import { AuthController } from '../controllers/auth.js'
import { UsersService } from '../services/users.js'
import { MailService } from '../services/mail.js';
import { LoggerService } from '../services/logger.js';

export const authRouter = Router();

export const createAuthRouter = (userService: UsersService, mailService: MailService, loggerService: LoggerService) => {
  const authController = new AuthController(userService, mailService, loggerService);

  authRouter.post('/signin', authController.signIn);
  authRouter.post('/forgotPassword', authController.forgotPassword);
  authRouter.get('/forgotPassword/:id', authController.isUserResettingPassword);
  authRouter.post('/resetPassword/:id', authController.resetPassword);

  return authRouter
}
