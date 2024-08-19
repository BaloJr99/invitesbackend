import { Request, Response } from 'express';
import { validateAuthUser } from '../schemas/users.js';
import { UsersService } from '../services/users.js';

export class AuthController {
  constructor (private userService: UsersService) {
    this.userService = userService;
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
