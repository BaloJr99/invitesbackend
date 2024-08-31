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
import { SettingsService } from './services/settings.js';
import { RolesService } from './services/roles.js';
import { MailService } from './services/mail.js';
import { InvitesService } from './services/invites.js';
import { LoggerService } from './services/logger.js';

export class App {

  constructor (
    private eventsService: EventsService,
    private familyGroupsService: FamilyGroupsService,
    private imagesService: ImagesService,
    private inviteImagesService: InviteImagesService,
    private invitesService: InvitesService,
    private loggerService: LoggerService,
    private mailService: MailService,
    private rolesService: RolesService,
    private settingsService: SettingsService,
    private usersService: UsersService
  ) {
    this.eventsService = eventsService;
    this.familyGroupsService = familyGroupsService;
    this.imagesService = imagesService;
    this.inviteImagesService = inviteImagesService;
    this.invitesService = invitesService;
    this.loggerService = loggerService;
    this.mailService = mailService;
    this.rolesService = rolesService;
    this.settingsService = settingsService;
    this.usersService = usersService;

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
      this.eventsService,
      this.familyGroupsService,
      this.imagesService,
      this.inviteImagesService,
      this.invitesService,
      this.loggerService,
      this.mailService,
      this.rolesService,
      this.settingsService,
      this.usersService,
    ));

    const PORT = process.env.PORT ?? 3000;

    server.listen(PORT, () => console.log(`Server on port ${PORT}`));
  }
}