import express, { Application, json } from 'express'
import { createEntriesRouter } from './routes/entries.routes.js';
import { EntriesService } from './services/entries.js';
import { ACCEPTED_ORIGINS, corsMiddleware } from './middleware/cors.js';
import { createEventsRouter } from './routes/events.routes.js';
import { createImagesRouter } from './routes/images.routes.js';
import { createFamilyGroupsRouter } from './routes/familyGroup.routes.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { EventsService } from './services/events.js';
import { InviteImagesService } from './services/inviteImages.js';
import { ImagesService } from './config/cloudinary/cloudinary.js';
import { FamilyGroupService } from './services/familyGroups.js';
import { UserService } from './services/users.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { UserFromEntry } from './interfaces/usersModel.js';

export class App {
  private app: Application;

  constructor (
    private entriesService: EntriesService,
    private eventsService: EventsService,
    private imagesService: ImagesService,
    private inviteImagesService: InviteImagesService,
    private familyGroupService: FamilyGroupService,
    private userService: UserService,
  ) {
    this.entriesService = entriesService;
    this.eventsService = eventsService;
    this.imagesService = imagesService;
    this.inviteImagesService = inviteImagesService;
    this.familyGroupService = familyGroupService;
    this.userService = userService;

    this.app = express();

    const server = createServer(this.app);

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

    this.app.use(json({ limit: '2mb' }));
    this.app.use(corsMiddleware())

    this.app.use('/entries', createEntriesRouter(this.entriesService));
    this.app.use('/events', createEventsRouter(this.eventsService));
    this.app.use('/images', createImagesRouter(this.imagesService, this.inviteImagesService));
    this.app.use('/familyGroups', createFamilyGroupsRouter(this.familyGroupService));
    this.app.use('/auth', createAuthRouter(this.userService));
  }
  
  listen() {
    this.app.listen(3000, () => console.log('Server on port 3000'));
  }
}