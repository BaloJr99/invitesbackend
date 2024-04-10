import { Request, Response } from 'express';
import { validateAuthUser, validateUser } from '../schemas/user.js';
import { UserService } from '../services/users.js';
import { handleHttp } from '../utils/error.handle.js';

export class AuthController {
  constructor (private userService: UserService) {
    this.userService = userService;
  }

  signUp = async (req: Request, res: Response) => {
    try {
      const result = validateUser(req.body)

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      const token = await this.userService.signup(result.data);

      res.status(201).json({ token })
    } catch (error) {
      handleHttp(res, 'ERROR_SIGN_UP');
    }
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
}
