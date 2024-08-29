import express, { json } from 'express';
import { ACCEPTED_ORIGINS, corsMiddleware } from './middleware/cors.js';
import { EventsService } from './services/events.js';
import { InviteImagesService } from './services/inviteImages.js';
import { ImagesService } from './config/cloudinary/cloudinary.js';
import { FamilyGroupsService } from './services/familyGroups.js';
import { UsersService } from './services/users.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { UserFromInvite } from './interfaces/usersModel.js';
import { createApiRouter } from './routes/api.routes.js';
import { EventSettingsService } from './services/settings.js';
import { RolesService } from './services/roles.js';
import { MailService } from './services/mail.js';
import { InvitesService } from './services/invites.js';
import { LoggerService } from './services/logger.js';

export class App {

  constructor (
    private invitesService: InvitesService,
    private eventsService: EventsService,
    private imagesService: ImagesService,
    private inviteImagesService: InviteImagesService,
    private familyGroupsService: FamilyGroupsService,
    private usersService: UsersService,
    private rolesService: RolesService,
    private eventSettingsService: EventSettingsService,
    private mailService: MailService,
    private loggerService: LoggerService
  ) {
    this.invitesService = invitesService;
    this.eventsService = eventsService;
    this.imagesService = imagesService;
    this.inviteImagesService = inviteImagesService;
    this.familyGroupsService = familyGroupsService;
    this.usersService = usersService;
    this.eventSettingsService = eventSettingsService;
    this.rolesService = rolesService;
    this.mailService = mailService;
    this.loggerService = loggerService;

    const app = express();

    const server = createServer(app);

    const io = new Server(server, {
      connectionStateRecovery: {},
      cors: {
        origin: ACCEPTED_ORIGINS,
        credentials: true
      }
    });
  
    io.on('connection', async (socket) => {
      socket.on('joinRoom', (username) => {
        if (username) {
          socket.join(username)
        }
      })
  
      socket.on('sendNotification', async (inviteId) => {
        const result = await this.invitesService.getUserFromInviteId(inviteId) as UserFromInvite[];
        if (result.length > 0) {
          const userId = result.at(0)?.userId ?? "";

          const username = await this.usersService.getUsername(userId);
  
          if(username) {
            io.to(username).emit('newNotification');
          }
        }
      })
    })

    app.use(json({ limit: '2mb' }));
    app.use(corsMiddleware())

    app.use('/api', createApiRouter(
      this.invitesService,
      this.eventsService,
      this.imagesService,
      this.inviteImagesService,
      this.familyGroupsService,
      this.usersService,
      this.eventSettingsService,
      this.rolesService,
      this.mailService,
      this.loggerService
    ));

    const PORT = process.env.PORT ?? 3000;

    server.listen(PORT, () => console.log(`Server on port ${PORT}`));
  }
}