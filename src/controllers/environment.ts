import { Request, Response } from 'express'
import { LoggerService } from '../services/logger.js'
import { ErrorHandler } from '../utils/error.handle.js'
import { EnvironmentService } from '../services/environment.js'
import { FilesService } from '../services/files.js'
import { FileType } from '../interfaces/enum.js'
import { UsersService } from '../services/users.js'
import { RolesService } from '../services/roles.js'

export class EnvironmentController {
  errorHandler: ErrorHandler
  constructor(
    private environmentService: EnvironmentService,
    private filesService: FilesService,
    private loggerService: LoggerService,
    private rolesService: RolesService,
    private userService: UsersService
  ) {
    this.environmentService = environmentService
    this.errorHandler = new ErrorHandler(this.loggerService)
  }

  cleanEnvironment = async (req: Request, res: Response) => {
    try {
      console.log('Cleaning environment')

      console.log('Getting files')
      const eventImages = await this.filesService.getAllImages()
      for (const image of eventImages) {
        await this.filesService.deleteAsset(image.publicId, FileType.Image)
      }
      console.log(`Deleted ${eventImages.length} images`)

      const eventAudios = await this.filesService.getAllAudios()
      for (const audio of eventAudios) {
        await this.filesService.deleteAsset(audio.publicId, FileType.Video)
      }
      console.log(`Deleted ${eventAudios.length} audios`)
      await this.environmentService.cleanEnvironment()

      // Delete all testing users
      console.log('Deleting testing users')
      await this.userService.deleteUserTestingData()

      // Delete all testing roles
      console.log('Deleting testing roles')
      await this.rolesService.deleteRoleTestingData()

      return res.json({ message: req.t('messages.ENVIRONMENT_CLEANED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CLEAN_ENVIRONMENT',
        e.message,
        req.userId
      )
    }
  }
}
