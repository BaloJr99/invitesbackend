import { UsersService } from '../services/users.js';
import { Request, Response } from 'express';
import { ErrorHandler } from '../utils/error.handle.js';
import { validateFullUser, validateUser, validateUserProfile, validateUserProfilePhoto } from '../schemas/users.js';
import { EventsService } from '../services/events.js';
import { EventsInfoModel, UserEventInfoModel, UserInfoModel } from '../interfaces/usersModel.js';
import { LoggerService } from '../services/logger.js';
import { ImagesService } from '../config/cloudinary/cloudinary.js';

export class UsersController {
  errorHandler: ErrorHandler;
  constructor (
    private userService: UsersService,
    private eventsService: EventsService,
    private loggerService: LoggerService,
    private imagesService: ImagesService
  ) {
    this.userService = userService;
    this.errorHandler = new ErrorHandler(this.loggerService);
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
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_GET_ALL_USERS', e.message, req.userId);
    }
  }

  getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userFound = await this.userService.getUserById(id);

      return res.json(userFound);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_GET_USER_BY_ID', e.message, req.userId);
    }
  }

  getUsersBasicInfo = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getUsersBasicInfo();
      return res.json(users);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_GET_ALL_USERS', e.message, req.userId);
    }
  }

  createUser = async (req: Request, res: Response) => {
    try {
      const result = validateFullUser(req.body)

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      const userId = await this.userService.createUser(result.data);

      return res.status(201).json({ id: userId, message: req.t('messages.USER_CREATED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_CREATE_USER', e.message, req.userId);
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
  
      return res.status(201).json({ message: req.t('messages.USER_UPDATED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_UPDATE_USER', e.message, req.userId);
    }
  }

  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
  
      return res.json({ message: req.t('messages.USER_DELETED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_DELETE_USER', e.message, req.userId);
    }
  }

  getUserProfile = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userFound = await this.userService.getUserProfile(id);

      return res.json(userFound);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_GET_USER_PROFILE', e.message, req.userId);
    }
  }

  updateUserProfile = async (req: Request, res: Response) => {
    try {
      const result = validateUserProfile(req.body);
  
      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
      }
  
      await this.userService.updateUserProfile(
        result.data
      );
  
      return res.status(201).json({ message: req.t('messages.PROFILE_UPDATED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_UPDATE_USER_PROFILE', e.message, req.userId);
    }
  }

  checkUsername = async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const isDuplicated = await this.userService.checkUsername(username);

      return res.json(isDuplicated);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_CHECK_USERNAME', e.message, req.userId);
    }
  }

  uploadProfilePhoto = async (req: Request, res: Response) => {
    try {
      const result = validateUserProfilePhoto(req.body);

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      const searchLastPhoto = await this.userService.getUserProfile(result.data.userId);

      if (searchLastPhoto && searchLastPhoto.profilePhotoPublicId) {
        await this.imagesService.deleteImage(searchLastPhoto.profilePhotoPublicId);
      }

      const cloudResult = await this.imagesService.uploadImage(result.data.profilePhotoSource);

      await this.userService.updateUserProfilePhoto(result.data.userId, { profilePhoto: cloudResult.secure_url, profilePhotoPublicId: cloudResult.public_id });

      return res.status(201).json({ id: cloudResult.secure_url, message: req.t('messages.PROFILE_PHOTO_UPDATED') });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, req, 'ERROR_UPDATE_PROFILE_PHOTO', e.message, req.userId);
    }
  }
}
