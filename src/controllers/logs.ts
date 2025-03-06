import { Request, RequestHandler, Response } from 'express'
import { UsersService } from '../services/users.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { LogsRepository } from '../repositories/logs-repository.js'
import { ILogsRepository } from '../interfaces/logs-repository.js'

export class LoggersController {
  private logsRepository: ILogsRepository
  private usersService: UsersService

  constructor(mysqlDatabase: MysqlDatabase) {
    this.logsRepository = new LogsRepository(mysqlDatabase)
    this.usersService = new UsersService()
  }

  getLogs: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const logs = await this.logsRepository.getLogs()

    let userIds = [...new Set(logs.map((l) => l.userId))]

    userIds = userIds.filter(
      (u) =>
        u !==
        '\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
    )

    const usernames = await this.usersService.getUsersById(userIds)

    logs.forEach((log) => {
      log.userId = usernames.find((u) => u.id === log.userId)?.username ?? ''
    })

    res.json(logs)
  }
}
