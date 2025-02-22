import { Request, Response } from 'express'
import { UsersService } from '../services/users.js'
import { MysqlDatabase } from '../services/mysql-database.js'
import { LogsRepository } from '../repositories/logs-repository.js'

export class LoggersController {
  private logsRepository: LogsRepository
  private usersService: UsersService

  constructor(mysqlDatabase: MysqlDatabase) {
    this.logsRepository = new LogsRepository(mysqlDatabase)
    this.usersService = new UsersService()
  }

  getLogs = async (req: Request, res: Response) => {
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

    return res.json(logs)
  }
}
