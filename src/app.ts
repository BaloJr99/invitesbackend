import express, { json } from 'express';
import { EntriesService } from './services/entries.js';
import { ACCEPTED_ORIGINS, corsMiddleware } from './middleware/cors.js';
import { EventsService } from './services/events.js';
import { InviteImagesService } from './services/inviteImages.js';
import { ImagesService } from './config/cloudinary/cloudinary.js';
import { FamilyGroupService } from './services/familyGroups.js';
import { UserService } from './services/users.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { UserFromEntry } from './interfaces/usersModel.js';
import { createApiRouter } from './routes/api.routes.js';
import { EventSettingsService } from './services/settings.js';

export class App {

  constructor (
    private entriesService: EntriesService,
    private eventsService: EventsService,
    private imagesService: ImagesService,
    private inviteImagesService: InviteImagesService,
    private familyGroupService: FamilyGroupService,
    private userService: UserService,
    private eventSettingsService: EventSettingsService
  ) {
    this.entriesService = entriesService;
    this.eventsService = eventsService;
    this.imagesService = imagesService;
    this.inviteImagesService = inviteImagesService;
    this.familyGroupService = familyGroupService;
    this.userService = userService;
    this.eventSettingsService = eventSettingsService;

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
  
      socket.on('sendNotification', async (entryId) => {
        const result = await this.entriesService.getUserFromEntryId(entryId) as UserFromEntry[];
        if (result.length > 0) {
          const userId = result.at(0)?.userId ?? "";

          const username = await this.userService.getUsername(userId);
  
          if(username) {
            io.to(username).emit('newNotification');
          }
        }
      })
    })

    app.use(json({ limit: '2mb' }));
    app.use(corsMiddleware())

    app.use('/api', createApiRouter(
      this.entriesService,
      this.eventsService,
      this.imagesService,
      this.inviteImagesService,
      this.familyGroupService,
      this.userService,
      this.eventSettingsService
    ));

    const PORT = process.env.PORT ?? 3000;

    server.listen(PORT, () => console.log(`Server on port ${PORT}`));
  }
}