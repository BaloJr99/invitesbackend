import { Router } from 'express'
import { UsersController } from '../controllers/users.js'
import { UsersService } from '../services/users.js'
import { isEntriesAdmin } from '../middleware/auth.js'
import { checkJwt } from '../middleware/session.js'
import { checkDuplicateUsernameOrEmail, checkRolesExisted } from '../middleware/verifySignup.js'
import { EventsService } from '../services/events.js'

export const usersRouter = Router()

export const createUsersRouter = (userService: UsersService, eventsService: EventsService) => {
  const userController = new UsersController(userService, eventsService);

  usersRouter.get('/', [checkJwt, isEntriesAdmin], userController.getUsers);
  usersRouter.get('/basic', [checkJwt, isEntriesAdmin], userController.getUsersBasicInfo);
  usersRouter.get('/:id', userController.getUserById);
  usersRouter.post('/', [checkJwt, isEntriesAdmin, checkDuplicateUsernameOrEmail, checkRolesExisted], userController.createUser);

  usersRouter.put('/:id', [checkJwt, isEntriesAdmin], userController.updateUser);
  usersRouter.delete('/:id', [checkJwt, isEntriesAdmin], userController.deleteUser);

  return usersRouter;
}
