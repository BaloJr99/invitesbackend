import { RolesService } from '../services/roles.js'
import { Request, RequestHandler, Response } from 'express'
import { ErrorHandler } from '../utils/error.handle.js'
import { validateFullRole } from '../schemas/roles.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export class RolesController {
  private errorHandler: ErrorHandler
  private rolesService: RolesService

  constructor(mysqlDatabase: MysqlDatabase) {
    this.rolesService = new RolesService()
    this.errorHandler = new ErrorHandler(mysqlDatabase)
  }

  getRoles: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const roles = await this.rolesService.getRoles()

      res.json(roles)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_GET_ALL_ROLES',
        e.message,
        req.userId
      )
    }
  }

  createRole: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateFullRole(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      await this.rolesService.createRole({
        ...result.data,
        id: ''
      })

      res.status(201).json({ message: req.t('messages.ROLE_CREATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CREATE_ROLE',
        e.message,
        req.userId
      )
    }
  }

  updateRole: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = validateFullRole(req.body)

      if (!result.success) {
        res.status(422).json(JSON.parse(result.error.message))
        return
      }

      const { id } = req.params

      await this.rolesService.updateRole({
        ...result.data,
        id
      })

      res.status(201).json({ message: req.t('messages.ROLE_UPDATED') })
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_UPDATE_ROLE',
        e.message,
        req.userId
      )
    }
  }

  checkRoleName: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { roleName } = req.params
      const isDuplicated = await this.rolesService.checkRoleName(roleName)

      res.json(isDuplicated)
    } catch (_e) {
      const e: Error = _e as Error
      this.errorHandler.handleHttp(
        res,
        req,
        'ERROR_CHECK_ROLE',
        e.message,
        req.userId
      )
    }
  }
}
