import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.js';
import { Logger } from '../interfaces/loggerModel.js';
import { UsersService } from '../services/users.js';

export class LoggersController {
  constructor (
    private loggerService: LoggerService,
    private usersService: UsersService
  ) {
    this.loggerService = loggerService;
  }

  getLogs = async (req: Request, res: Response) => {
    const logs = await this.loggerService.getLogs() as Logger[];

    const userIds = [...new Set(logs.map(l => l.userId))];

    const usernames = await this.usersService.getUsersById(userIds);
    
    logs.forEach((log) => {
      log.userId = usernames.find(u => u.id === log.userId)?.username ?? '';
    })

    return res.status(200).json(logs);
  }
}