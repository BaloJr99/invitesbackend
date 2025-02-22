import { Router } from 'express'
import { AuthController } from '../controllers/auth.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { Transporter } from 'nodemailer'

export const authRouter = Router()

export const createAuthRouter = (
  mysqlDatabase: MysqlDatabase,
  nodemailerConnection: Transporter
) => {
  const authController = new AuthController(mysqlDatabase, nodemailerConnection)

  authRouter.post('/signin', authController.signIn)
  authRouter.post('/forgotPassword', authController.forgotPassword)
  authRouter.post('/forgotPasswordToUser', authController.forgotPasswordToUser)
  authRouter.get('/refreshToken', authController.refreshToken)

  authRouter.get(
    '/forgotPassword/:user',
    [validateUuid],
    authController.isUserResettingPassword
  )

  authRouter.post(
    '/resetPassword/:user',
    [validateUuid],
    authController.resetPassword
  )

  return authRouter
}
