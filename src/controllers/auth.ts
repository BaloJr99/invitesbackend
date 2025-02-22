import { Request, Response } from 'express'
import {
  validateAuthUser,
  validatePassword,
  validateUserId,
  validateUsernameOrEmail
} from '../schemas/users.js'
import { ErrorHandler } from '../utils/error.handle.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { UsersService } from '../services/users.js'
import { MailService } from '../services/mail.js'
import { Transporter } from 'nodemailer'

export class AuthController {
  private errorHandler: ErrorHandler
  private usersService: UsersService
  private mailService: MailService

  constructor(myslDatabase: MysqlDatabase, nodemailerConnection: Transporter) {
    this.errorHandler = new ErrorHandler(myslDatabase)
    this.mailService = new MailService(nodemailerConnection)
    this.usersService = new UsersService()
  }

  signIn = async (req: Request, res: Response) => {
    try {
      const result = validateAuthUser(req.body)

      if (!result.success) {
        return res.status(422).json(JSON.parse(result.error.message))
      }

      const signInResponse = await this.usersService.signin(result.data)
      if (signInResponse.includes('ERROR')) {
        return res
          .status(401)
          .json({ error: req.t('messages.WRONG_CREDENTIALS') })
      }

      if (signInResponse.includes('BLOCKED')) {
        return res.status(401).json({ error: req.t('messages.BLOCKED_USER') })
      } else if (signInResponse.includes('INACTIVE')) {
        return res
          .status(401)
          .json({ error: req.t('messages.INACTIVE_ACCOUNT') })
      }

      const tokens = JSON.parse(signInResponse)
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'none'
      })

      res.json({
        access_token: tokens.accessToken
      })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_SIGN_IN',
        e.message,
        req.userId
      )
    }
  }

  forgotPassword = async (req: Request, res: Response) => {
    const result = validateUsernameOrEmail(req.body)

    if (!result.success) {
      return res.status(422).json(JSON.parse(result.error.message))
    }

    const userFounded = await this.usersService.findUser(
      result.data.usernameOrEmail
    )

    if (!userFounded) {
      return res.status(401).json({ error: req.t('messages.USER_NOT_FOUND') })
    }

    try {
      await this.mailService.sendMail({
        from: 'InvitesMX',
        to: userFounded.email ?? '',
        html: this.getHtml(
          userFounded.username ?? '',
          userFounded._id.toString(),
          req.get('origin') ?? ''
        ),
        subject: 'Password Reset'
      })

      await this.usersService.updateResetPasword(
        userFounded._id.toString(),
        '',
        true
      )
      res.json()
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_SENDING_EMAIL',
        e.message,
        req.userId
      )
    }
  }

  forgotPasswordToUser = async (req: Request, res: Response) => {
    const result = validateUserId(req.body)

    if (!result.success) {
      return res.status(422).json(JSON.parse(result.error.message))
    }

    const userFounded = await this.usersService.findUserById(result.data.id)

    if (!userFounded) {
      return res.status(401).json({ error: req.t('messages.USER_NOT_FOUND') })
    }

    try {
      await this.mailService.sendMail({
        from: 'InvitesMX',
        to: userFounded.email ?? '',
        html: this.getHtml(
          userFounded.username ?? '',
          userFounded._id.toString(),
          req.get('origin') ?? ''
        ),
        subject: 'Password Reset'
      })

      await this.usersService.updateResetPasword(
        userFounded._id.toString(),
        '',
        true
      )
      res.json({ message: req.t('messages.USER_PASSWORD_RESET') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_SENDING_EMAIL',
        e.message,
        req.userId
      )
    }
  }

  isUserResettingPassword = async (req: Request, res: Response) => {
    try {
      const { user } = req.params

      const resetting = await this.usersService.isUserResettingPassword(user)
      return res.json(resetting)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_IS_RESETTING_PASSWORD',
        e.message,
        req.userId
      )
    }
  }

  resetPassword = async (req: Request, res: Response) => {
    try {
      const result = validatePassword(req.body)

      if (!result.success) {
        return res.status(422).json(JSON.parse(result.error.message))
      }

      const { user } = req.params

      await this.usersService.updateResetPasword(
        user,
        result.data.password,
        false
      )
      return res.json({ message: req.t('messages.PASSWORD_RESET') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_RESET_PASSWORD',
        e.message,
        req.userId
      )
    }
  }

  refreshToken = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies['refreshToken']

      if (!refreshToken) {
        return res.status(401).json({ error: req.t('messages.INVALID_AUTH') })
      }

      const access_token = await this.usersService.refreshToken(refreshToken)
      if (access_token.includes('ERROR')) {
        return res.status(401).json({ error: req.t('messages.INVALID_AUTH') })
      }

      res.json({
        access_token
      })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_REFRESH_TOKEN',
        e.message,
        req.userId
      )
    }
  }

  getHtml = (userFound: string, userId: string, url: string): string => {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <!--[if gte mso 9]>
            <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG />
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          <![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="x-apple-disable-message-reformatting" />
          <!--[if !mso]><!-->
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <!--<![endif]-->
          <title></title>

          <style type="text/css">
            @media only screen and (min-width: 620px) {
              .u-row {
                width: 600px !important;
              }
              .u-row .u-col {
                vertical-align: top;
              }

              .u-row .u-col-50 {
                width: 300px !important;
              }

              .u-row .u-col-100 {
                width: 600px !important;
              }
            }

            @media (max-width: 620px) {
              .u-row-container {
                max-width: 100% !important;
                padding-left: 0px !important;
                padding-right: 0px !important;
              }
              .u-row .u-col {
                min-width: 320px !important;
                max-width: 100% !important;
                display: block !important;
              }
              .u-row {
                width: 100% !important;
              }
              .u-col {
                width: 100% !important;
              }
              .u-col > div {
                margin: 0 auto;
              }
            }

            body {
              margin: 0;
              padding: 0;
            }

            table,
            tr,
            td {
              vertical-align: top;
              border-collapse: collapse;
            }

            p {
              margin: 0;
            }

            .ie-container table,
            .mso-container table {
              table-layout: fixed;
            }

            * {
              line-height: inherit;
            }

            a[x-apple-data-detectors='true'] {
              color: inherit !important;
              text-decoration: none !important;
            }

            table,
            td {
              color: #000000;
            }

            #u_body a {
              color: #161a39;
              text-decoration: underline;
            }
          </style>

          <!--[if !mso]><!-->
          <link href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" rel="stylesheet" type="text/css" />
          <link href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" rel="stylesheet" type="text/css" />
          <!--<![endif]-->
        </head>

        <body class="clean-body u_body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #f9f9f9; color: #000000;">
          <!--[if IE]>
          <div class="ie-container">
          <![endif]-->
          <!--[if mso]>
          <div class="mso-container">
          <![endif]-->
          <table id="u_body" style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; min-width: 320px; margin: 0 auto; background-color: #f9f9f9; width: 100%;" cellpadding="0" cellspacing="0">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top;">
                  <!--[if (mso)|(IE)]>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="background-color: #f9f9f9;">
                  <![endif]-->
                  <div class="u-row-container" style="padding: 0px; background-color: #f9f9f9">
                    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #f9f9f9;">
                      <div style="border-collapse: collapse; display: table; width: 100%; height: 100%; background-color: transparent;">
                        <!--[if (mso)|(IE)]>
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 0px;background-color: #f9f9f9;" align="center">
                                <table cellpadding="0" cellspacing="0" border="0" style="width:600px;">
                                  <tr style="background-color: #f9f9f9;">
                                    <td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top">
                        <![endif]-->
                        <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
                          <div style="height: 100%; width: 100% !important">
                            <!--[if (!mso)&(!IE)]><!-->
                            <div style="box-sizing: border-box; height: 100%; padding: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent;">
                              <!--<![endif]-->
                              <table style="font-family: 'Lato', sans-serif" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap: break-word; word-break: break-word; padding: 15px; font-family: 'Lato', sans-serif;" align="left">
                                      <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; border-top: 1px solid #f9f9f9; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
                                        <tbody>
                                          <tr style="vertical-align: top">
                                            <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
                                              <span>&#160;</span>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <!--[if (!mso)&(!IE)]><!-->
                            </div>
                            <!--<![endif]-->
                          </div>
                        </div>
                        <!--[if (mso)|(IE)]></td><![endif]-->
                        <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                      </div>
                    </div>
                  </div>

                  <div class="u-row-container" style="padding: 0px; background-color: transparent">
                    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
                      <div style="border-collapse: collapse; display: table; width: 100%; height: 100%; background-color: transparent;">
                        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
                        <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                        <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
                          <div style="height: 100%; width: 100% !important">
                            <!--[if (!mso)&(!IE)]><!-->
                            <div style="box-sizing: border-box; height: 100%; padding: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent;">
                            <!--<![endif]-->
                              <table style="font-family: 'Lato', sans-serif" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap: break-word; word-break: break-word; padding: 25px 10px; font-family: 'Lato', sans-serif;" align="left">
                                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td style="padding-right: 0px; padding-left: 0px;" align="center">
                                            <img align="center" border="0" src="https://res.cloudinary.com/dc9vc8b7b/image/upload/v1713628276/180970929_padded_logo_wll61u.png" alt="Image" title="Image" style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 29%; max-width: 168.2px;" width="168.2"/>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <!--[if (!mso)&(!IE)]><!-->
                            </div>
                            <!--<![endif]-->
                          </div>
                        </div>
                        <!--[if (mso)|(IE)]></td><![endif]-->
                        <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                      </div>
                    </div>
                  </div>

                  <div class="u-row-container" style="padding: 0px; background-color: transparent">
                    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
                      <div style="border-collapse: collapse; display: table; width: 100%; height: 100%; background-color: transparent;">
                        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
                        <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                        <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
                          <div style="height: 100%; width: 100% !important">
                            <!--[if (!mso)&(!IE)]><!-->
                            <div style="box-sizing: border-box; height: 100%; padding: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent;">
                              <!--<![endif]-->
                              <table style="font-family: 'Lato', sans-serif" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap: break-word; word-break: break-word; padding: 40px 40px 30px; font-family: 'Lato', sans-serif;" align="left">
                                      <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;">
                                        <p style="font-size: 14px; line-height: 140%">
                                          <span style="font-size: 18px; line-height: 25.2px; color: #666666;">Hello ${userFound},</span>
                                        </p>
                                        <p style="font-size: 14px; line-height: 140%">
                                          &nbsp;
                                        </p>
                                        <p style="font-size: 14px; line-height: 140%">
                                          <span style="font-size: 18px; line-height: 25.2px; color: #666666;">
                                            We have sent you this email in response
                                            to your request to reset your password on
                                            invitesMX.
                                          </span>
                                        </p>
                                        <p style="font-size: 14px; line-height: 140%">
                                          &nbsp;
                                        </p>
                                        <p style="font-size: 14px; line-height: 140%">
                                          <span style="font-size: 18px; line-height: 25.2px; color: #666666;">To reset your password, please follow the
                                            link below:
                                          </span>
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                              <table style="font-family: 'Lato', sans-serif" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap: break-word; word-break: break-word; padding: 0px 40px; font-family: 'Lato', sans-serif;" align="left">
                                      <!--[if mso]>
                                      <style>
                                        .v-button {
                                          background: transparent !important;
                                        }
                                      </style><!
                                      [endif]-->
                                      <div align="left">
                                        <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:51px; v-text-anchor:middle; width:205px;" arcsize="2%"  stroke="f" fillcolor="#18163a"><w:anchorlock/><center style="color:#FFFFFF;"><![endif]-->
                                        <a href='${url}/auth/forgotPassword/${userId}' target="_blank" class="v-button" style="box-sizing: border-box; display: inline-block; text-decoration: none; -webkit-text-size-adjust: none; text-align: center; color: #ffffff; background-color: #18163a; border-radius: 1px; -webkit-border-radius: 1px; -moz-border-radius: 1px; width: auto; max-width: 100%; overflow-wrap: break-word; word-break: break-word; word-wrap: break-word; mso-border-alt: none; font-size: 14px;">
                                          <span style="display: block; padding: 15px 40px; line-height: 120%;">
                                            <span style="font-size: 18px; line-height: 21.6px;">Reset Password</span>
                                          </span>
                                        </a>
                                        <!--[if mso]></center></v:roundrect><![endif]-->
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                              <table style="font-family: 'Lato', sans-serif" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap: break-word; word-break: break-word; padding: 40px 40px 30px; font-family: 'Lato', sans-serif;" align="left">
                                      <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;">
                                        <p style="font-size: 14px; line-height: 140%">
                                          <span style="color: #888888; font-size: 14px; line-height: 19.6px;">
                                            <em>
                                              <span style="font-size: 16px; line-height: 22.4px;">
                                                Please ignore this email if you did
                                                not request a password change.
                                              </span>
                                            </em>
                                          </span>
                                          <br />
                                          <span style="color: #888888; font-size: 14px; line-height: 19.6px;">
                                            <em>
                                              <span style="font-size: 16px; line-height: 22.4px;">&nbsp;</span>
                                            </em>
                                          </span>
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <!--[if (!mso)&(!IE)]><!-->
                            </div>
                            <!--<![endif]-->
                          </div>
                        </div>
                        <!--[if (mso)|(IE)]></td><![endif]-->
                        <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                      </div>
                    </div>
                  </div>

                  <div class="u-row-container" style="padding: 0px; background-color: #f9f9f9">
                    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #1c103b;">
                      <div style="border-collapse: collapse; display: table; width: 100%; height: 100%; background-color: transparent;">
                        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: #f9f9f9;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #1c103b;"><![endif]-->

                        <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                        <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
                          <div style="height: 100%; width: 100% !important">
                            <!--[if (!mso)&(!IE)]><!-->
                            <div style="box-sizing: border-box; height: 100%; padding: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent;">
                              <!--<![endif]-->
                              <table style="font-family: 'Lato', sans-serif" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap: break-word; word-break: break-word; padding: 15px; font-family: 'Lato', sans-serif;" align="left">
                                      <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; border-top: 1px solid #1c103b; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
                                        <tbody>
                                          <tr style="vertical-align: top">
                                            <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
                                              <span>&#160;</span>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <!--[if (!mso)&(!IE)]><!-->
                            </div>
                            <!--<![endif]-->
                          </div>
                        </div>
                        <!--[if (mso)|(IE)]></td><![endif]-->
                        <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                      </div>
                    </div>
                  </div>

                  <div class="u-row-container" style="padding: 0px; background-color: transparent">
                    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #f9f9f9;">
                      <div style="border-collapse: collapse; display: table; width: 100%; height: 100%; background-color: transparent;">
                        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #f9f9f9;"><![endif]-->
                        <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                        <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
                          <div style="height: 100%; width: 100% !important">
                            <!--[if (!mso)&(!IE)]><!-->
                            <div style="box-sizing: border-box; height: 100%; padding: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent;">
                              <!--<![endif]-->
                              <table style="font-family: 'Lato', sans-serif" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap: break-word; word-break: break-word; padding: 0px 40px 30px 20px; font-family: 'Lato', sans-serif;" align="left">
                                      <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;"></div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <!--[if (!mso)&(!IE)]><!-->
                            </div>
                            <!--<![endif]-->
                          </div>
                        </div>
                        <!--[if (mso)|(IE)]></td><![endif]-->
                        <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                      </div>
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
          <!--[if mso]></div><![endif]-->
          <!--[if IE]></div><![endif]-->
        </body>
      </html>
      `
  }
}
