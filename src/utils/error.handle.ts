import { Request, Response } from 'express'
import { LoggerService } from '../services/logger.js'

export class ErrorHandler {
  constructor(private loggerService: LoggerService) {
    this.loggerService = loggerService
  }

  handleHttp = async (
    res: Response | null = null,
    req: Request | null,
    error: string,
    fullError: string,
    userId: string
  ) => {
    await this.loggerService.addLog({
      dateOfError: new Date(),
      customError: error,
      exceptionMessage: fullError,
      userId: userId
    })

    if (res && req) {
      res.status(500).send(req.t(`errors.${error}`))
    }
  }
}
