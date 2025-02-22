import { Router } from 'express'
import { RolesController } from '../controllers/roles.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export const rolesRouter = Router()

export const createRolesRouter = (
  mysqlDatabase: MysqlDatabase
) => {
  const rolesController = new RolesController(mysqlDatabase)

  rolesRouter.get('/', rolesController.getRoles)

  rolesRouter.get(
    '/profile/check-roleName/:roleName',
    rolesController.checkRoleName
  )

  rolesRouter.post('/', rolesController.createRole)
  rolesRouter.put('/:id', rolesController.updateRole)

  return rolesRouter
}
