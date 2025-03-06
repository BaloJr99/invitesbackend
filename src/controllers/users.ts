import { UsersService } from '../services/users.js'
import { Request, RequestHandler, Response } from 'express'
import { ErrorHandler } from '../utils/error.handle.js'
import {
  validateUser,
  validateUserProfile,
  validateUserProfilePhoto
} from '../schemas/users.js'
import { IUserEventsInfo, IUserInfo } from '../global/types.js'
import { FileType } from '../global/enum.js'
import { UploadApiResponse } from 'cloudinary'
import { EnvConfig } from '../config/config.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { EventsRepository } from '../repositories/events-repository.js'
import { FilesRepository } from '../repositories/files-repository.js'
import { IFilesRepository } from '../interfaces/files-repository.js'
import { IEventsRepository } from '../interfaces/events-repository.js'

export class UsersController {
  private eventsRepository: IEventsRepository
  private errorHandler: ErrorHandler
  private filesRepository: IFilesRepository
  private usersService: UsersService

  constructor(mysqlDatabase: MysqlDatabase) {
    this.eventsRepository = new EventsRepository(mysqlDatabase)
    this.errorHandler = new ErrorHandler(mysqlDatabase)
    this.filesRepository = new FilesRepository(mysqlDatabase)
    this.usersService = new UsersService()
  }

  getUsers: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const users = (await this.usersService.getUsers()) as IUserInfo[]

      const usersId = users.map((u) => u._id.toString())

      const usersEventInfo: IUserEventsInfo[] = []

      for await (const userId of usersId) {
        const queryResult = await this.eventsRepository.getEventsInfo(userId)

        // Find the user
        const user = users.find((u) => u._id.toString() === userId) as IUserInfo

        // Create user event info model to insert
        const newUsersEventInfo: IUserEventsInfo = {
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
          const result = queryResult.at(0) as IUserEventsInfo
          newUsersEventInfo.numEntries = result.numEntries
          newUsersEventInfo.numEvents = result.numEvents
        }

        usersEventInfo.push(newUsersEventInfo)
      }

      res.json(usersEventInfo)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_ALL_USERS',
        e.message,
        req.userId
      )
    }
  }

  getUserById: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params
      const userFound = await this.usersService.getUserById(id)

      res.json(userFound)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_USER_BY_ID',
        e.message,
        req.userId
      )
    }
  }

  getUsersBasicInfo: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const users = await this.usersService.getUsersBasicInfo()
      res.json(users)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_ALL_USERS_BASIC_INFO',
        e.message,
        req.userId
      )
    }
  }

  createUser: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateUser(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const userId = await this.usersService.createUser({
        ...result.data,
        isActive: true,
        id: ''
      })

      res
        .status(201)
        .json({ id: userId, message: req.t('messages.USER_CREATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CREATE_USER',
        e.message,
        req.userId
      )
    }
  }

  updateUser: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateUser(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const { id } = req.params

      await this.usersService.updateUser({
        ...result.data,
        id
      })

      res.status(201).json({ message: req.t('messages.USER_UPDATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPDATE_USER',
        e.message,
        req.userId
      )
    }
  }

  deactivateUser: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params
      await this.usersService.deactivateUser(id)

      res.json({ message: req.t('messages.USER_DELETED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_DELETE_USER',
        e.message,
        req.userId
      )
    }
  }

  getUserProfile: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params
      const userFound = await this.usersService.getUserProfile(id)

      res.json(userFound)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_USER_PROFILE',
        e.message,
        req.userId
      )
    }
  }

  updateUserProfile: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateUserProfile(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      await this.usersService.updateUserProfile(result.data)

      res.status(201).json({ message: req.t('messages.PROFILE_UPDATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPDATE_USER_PROFILE',
        e.message,
        req.userId
      )
    }
  }

  checkUsername: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { username } = req.params
      const isDuplicated = await this.usersService.checkUsername(username)

      res.json(isDuplicated)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CHECK_USERNAME',
        e.message,
        req.userId
      )
    }
  }

  uploadProfilePhoto: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateUserProfilePhoto(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const searchLastPhoto = await this.usersService.getUserProfile(
        result.data.id
      )

      if (searchLastPhoto && searchLastPhoto.profilePhotoPublicId) {
        await this.filesRepository.deleteAsset(
          searchLastPhoto.profilePhotoPublicId,
          FileType.Image
        )
      }

      const folder =
        EnvConfig().node_env === 'development' ? 'test/users' : 'prod/users'

      const cloudResult = (await this.filesRepository.uploadAsset(
        result.data.profilePhotoSource,
        folder,
        FileType.Image
      )) as UploadApiResponse

      await this.usersService.updateUserProfilePhoto({
        id: result.data.id,
        profilePhoto: cloudResult.secure_url,
        profilePhotoPublicId: cloudResult.public_id
      })

      res.status(201).json({
        id: cloudResult.secure_url,
        message: req.t('messages.PROFILE_PHOTO_UPDATED')
      })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPDATE_PROFILE_PHOTO',
        e.message,
        req.userId
      )
    }
  }
}
