import { Request, Response } from 'express';
import { validateAuthUser, validateUsernameOrEmail } from '../schemas/users.js';
import { UsersService } from '../services/users.js';
import { MailService } from '../services/mail.js';

export class AuthController {
  constructor (
    private userService: UsersService,
    private mailService: MailService) {
    this.userService = userService;
    this.mailService = mailService;
  }

  signIn = async (req: Request, res: Response) => {
    const result = validateAuthUser(req.body);

    if (!result.success) {
      return res.status(422).json({ error: JSON.parse(result.error.message) });
    }

    const token = await this.userService.signin(result.data);
    if (!token) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.status(200).json({ token });
  }

  resetPassword = async (req: Request, res: Response) => {
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
        html: 'test email body',
        subject: 'Password Reset',
      });
      res.status(200).json({ info });
    } catch (error) {
      return res.status(500).json({ error: 'Error al enviar el correo' });
    }
  }
}
