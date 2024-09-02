import { Request, Response } from 'express';
import { validateAuthUser, validatePassword, validateUsernameOrEmail } from '../schemas/users.js';
import { UsersService } from '../services/users.js';
import { MailService } from '../services/mail.js';
import { ErrorHandler } from '../utils/error.handle.js';
import { LoggerService } from '../services/logger.js';

export class AuthController {
  errorHandler: ErrorHandler;

  constructor (
    private userService: UsersService,
    private mailService: MailService,
    private loggerService: LoggerService) {
    this.userService = userService;
    this.mailService = mailService;
    this.errorHandler = new ErrorHandler(this.loggerService);
  }

  signIn = async (req: Request, res: Response) => {
    try {
      const result = validateAuthUser(req.body);

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      const signInResponse = await this.userService.signin(result.data);
      if (signInResponse.includes('ERROR')) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      if (signInResponse.includes('BLOCKED')) {
        return res.status(401).json({ error: 'Cuenta bloqueada, has excedido el numero de intentos' });
      } else if (signInResponse.includes('INACTIVE')) {
        return res.status(401).json({ error: 'Cuenta inactivada' });
      }

      res.status(200).json({ token: signInResponse });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_SIGN_IN', e.message, req.userId);
    }
  }

  forgotPassword = async (req: Request, res: Response) => {
    const result = validateUsernameOrEmail(req.body);

    if (!result.success) {
      return res.status(422).json({ error: JSON.parse(result.error.message) });
    }

    const userFounded = await this.userService.findUser(result.data.usernameOrEmail);
    if (!userFounded) {
      return res.status(401).json({ error: 'No se encontro el usuario' });
    }

    try {
      const info = await this.mailService.sendMail({
        from: 'InvitesMX',
        to: userFounded.email ?? '',
        html: this.getHtml(userFounded.username ?? '', userFounded._id.toString(), req.get('origin') ?? ''),
        subject: 'Password Reset',
      });

      await this.userService.updateResetPasword(userFounded._id.toString(), '', true);
      res.status(200).json({ info });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_SENDING_EMAIL', e.message, req.userId);
    }
  }

  isUserResettingPassword = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const resetting = await this.userService.isUserResettingPassword(id);
      return res.status(200).json(resetting);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_IS_RESETTING_PASSWORD', e.message, req.userId);
    }
  }

  resetPassword = async (req: Request, res: Response) => {
    try {
      const result = validatePassword(req.body);

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      const { id } = req.params;

      await this.userService.updateResetPasword(id, result.data.password, false);
      return res.status(200).json();
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_RESET_PASSWORD', e.message, req.userId);
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
                                            company name.
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
