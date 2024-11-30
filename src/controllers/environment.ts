import { Request, Response } from 'express'
import { LoggerService } from '../services/logger.js'
import { ErrorHandler } from '../utils/error.handle.js'
import { EnvironmentService } from '../services/environment.js'

export class EnvironmentController {
  errorHandler: ErrorHandler
  constructor(
    private environmentService: EnvironmentService,
    private loggerService: LoggerService
  ) {
    this.environmentService = environmentService
    this.errorHandler = new ErrorHandler(this.loggerService)
  }

  cleanEnvironment = async (req: Request, res: Response) => {
    try {
      console.log('Cleaning environment')
      await this.environmentService.cleanEnvironment()

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
