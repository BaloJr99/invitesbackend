import { Request, Response } from 'express'
import { getUTCDate } from './tools.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { LogsRepository } from '../repositories/logs-repository.js'

export class ErrorHandler {
  private logsRepository: LogsRepository
  constructor(mysqlDatabase: MysqlDatabase) {
    this.logsRepository = new LogsRepository(mysqlDatabase)
  }

  handleHttp = async (
    res: Response | null = null,
    req: Request | null,
    error: string,
    fullError: string,
    userId: string
  ) => {
    await this.logsRepository.addLog({
      dateOfError: getUTCDate(),
      customError: error,
      exceptionMessage: fullError,
      userId: userId
    })

    if (res && req) {
      res.status(500).send(req.t(`errors.${error}`))
    }
  }
}
