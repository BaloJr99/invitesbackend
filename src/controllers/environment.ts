import { Request, Response } from 'express'
import { FileType } from '../global/enum.js'
import { UsersService } from '../services/users.js'
import { RolesService } from '../services/roles.js'
import { EnvironmentsRepository } from '../repositories/environments-repository.js'
import { FilesRepository } from '../repositories/files-repository.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { ErrorHandler } from '../utils/error.handle.js'

export class EnvironmentController {
  private errorHandler: ErrorHandler
  private environmentsRepository: EnvironmentsRepository
  private usersService: UsersService
  private rolesService: RolesService
  private filesRepository: FilesRepository

  constructor(mysqlDatabase: MysqlDatabase) {
    this.errorHandler = new ErrorHandler(mysqlDatabase)
    this.environmentsRepository = new EnvironmentsRepository(mysqlDatabase)
    this.filesRepository = new FilesRepository(mysqlDatabase)
    this.rolesService = new RolesService()
    this.usersService = new UsersService()
  }

  cleanEnvironment = async (req: Request, res: Response) => {
    try {
      console.log('Cleaning environment')

      console.log('Getting files')
      const eventImages = await this.filesRepository.getAllImages()
      for (const image of eventImages) {
        await this.filesRepository.deleteAsset(image.publicId, FileType.Image)
      }
      console.log(`Deleted ${eventImages.length} images`)

      const eventAudios = await this.filesRepository.getAllAudios()
      for (const audio of eventAudios) {
        await this.filesRepository.deleteAsset(audio.publicId, FileType.Video)
      }
      console.log(`Deleted ${eventAudios.length} audios`)
      await this.environmentsRepository.cleanEnvironment()

      // Delete all testing users
      console.log('Deleting testing users')
      await this.usersService.deleteUserTestingData()

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
