import { Router } from 'express'
import { AuthController } from '../controllers/auth.js'
import { UsersService } from '../services/users.js'
import { MailService } from '../services/mail.js'
import { LoggerService } from '../services/logger.js'
import { validateUuid } from '../middleware/validateUuid.js'

export const authRouter = Router()

export const createAuthRouter = (
  userService: UsersService,
  mailService: MailService,
  loggerService: LoggerService
) => {
  const authController = new AuthController(
    userService,
    mailService,
    loggerService
  )

  authRouter.post('/signin', authController.signIn)
  authRouter.post('/forgotPassword', authController.forgotPassword)
  authRouter.post('/forgotPasswordToUser', authController.forgotPasswordToUser)
  authRouter.get(
    '/forgotPassword/:id',
    [validateUuid],
    authController.isUserResettingPassword
  )
  authRouter.post(
    '/resetPassword/:id',
    [validateUuid],
    authController.resetPassword
  )

  return authRouter
}
