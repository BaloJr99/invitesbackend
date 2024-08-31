import { Router } from 'express'
import { UsersController } from '../controllers/users.js'
import { UsersService } from '../services/users.js'
import { checkDuplicateUsernameOrEmail, checkRolesExisted } from '../middleware/verifySignup.js'
import { EventsService } from '../services/events.js'
import { LoggerService } from '../services/logger.js'
import { validateUuid } from '../middleware/validateUuid.js'
import { isAdmin, isInvitesAdmin } from '../middleware/auth.js'

export const usersRouter = Router()

export const createUsersRouter = (userService: UsersService, eventsService: EventsService, loggerService: LoggerService) => {
  const userController = new UsersController(userService, eventsService, loggerService);

  usersRouter.get('/', [isAdmin], userController.getUsers);
  usersRouter.get('/basic', [isInvitesAdmin], userController.getUsersBasicInfo);
  usersRouter.get('/:id', [validateUuid, isAdmin], userController.getUserById);
  usersRouter.post('/', [checkDuplicateUsernameOrEmail, checkRolesExisted, isAdmin], userController.createUser);

  usersRouter.put('/:id', [validateUuid, isAdmin], userController.updateUser);
  usersRouter.delete('/:id', [validateUuid, isAdmin], userController.deleteUser);

  return usersRouter;
}
