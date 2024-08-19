import { UsersService } from '../services/users.js';
import { Request, Response } from 'express';
import { handleHttp } from '../utils/error.handle.js';
import { validateFullUser, validateUser } from '../schemas/users.js';
import { EventsService } from '../services/events.js';
import { EventsInfoModel, UserEventInfoModel, UserInfoModel } from '../interfaces/usersModel.js';

export class UsersController {
  constructor (
    private userService: UsersService,
    private eventsService: EventsService
  ) {
    this.userService = userService;
  }

  getUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getUsers();

      const usersId = users.map(u => u.id);
      const usersEventInfo: UserEventInfoModel[] = [];

      for await (const userId of usersId) {
        const queryResult = await this.eventsService.getEventsInfo(userId);

        // Find the user
        const user = users.find(u => u.id === userId) as UserInfoModel;

        // Create user event info model to insert
        const newUsersEventInfo: UserEventInfoModel = {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          numEntries: 0,
          numEvents: 0
        }

        // If there is any result from the server change the values
        if (queryResult.length > 0) {
          // Get the first row, since there's only one row
          const result = queryResult.at(0) as EventsInfoModel;
          newUsersEventInfo.numEntries = result.numEntries;
          newUsersEventInfo.numEvents = result.numEvents;
        }

        usersEventInfo.push(newUsersEventInfo);
      }

      return res.json(usersEventInfo);
    } catch (error) {
      handleHttp(res, 'ERROR_GET_ALL_USERS');
    }
  }

  getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userFound = await this.userService.getUserById(id);

      return res.json(userFound);
    } catch (error) {
      handleHttp(res, 'ERROR_GET_ALL_USERS');
    }
  }

  getUsersBasicInfo = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getUsersBasicInfo();
      return res.json(users);
    } catch (error) {
      handleHttp(res, 'ERROR_GET_ALL_USERS');
    }
  }

  createUser = async (req: Request, res: Response) => {
    try {
      const result = validateFullUser(req.body)

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      const userId = await this.userService.createUser(result.data);

      return res.status(201).json({ id: userId, message: 'Usuario creado' });
    } catch (error) {
      handleHttp(res, 'ERROR_CREATE_USER');
    }
  }

  updateUser = async (req: Request, res: Response) => {
    try {
      const result = validateUser(req.body);
  
      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
      }
  
      const { id } = req.params;

      await this.userService.updateUser(
        id,
        result.data
      );
  
      return res.status(201).json({ message: 'Usuario actualizado' });
    } catch (error) {
      handleHttp(res, 'ERROR_UPDATE_USER');
    }
  }

  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
  
      return res.json({ message: 'Usuario desactivado' });
    } catch (error) {
      handleHttp(res, 'ERROR_DELETE');
    }
  }
}
