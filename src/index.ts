import { App } from './app.js';
import dotenv from 'dotenv';
import { connection } from './config/mysql/connection.js';
import dbConnect from './config/mongo/mongo.js';
import { createRoles } from './utils/createRoles.handle.js';
import { EntriesService } from './services/entries.js';
import { EventsService } from './services/events.js';
import { ImagesService } from './config/cloudinary/cloudinary.js';
import { InviteImagesService } from './services/inviteImages.js';
import { FamilyGroupsService } from './services/familyGroups.js';
import { UsersService } from './services/users.js';
import { EventSettingsService } from './services/settings.js';
import { RolesService } from './services/roles.js';
dotenv.config();

const main = () => {

  const mysqlConnection = connection();
  dbConnect().then(() => {
    createRoles();
    console.log("Mongo Connection Ready");
  });

  new App(
    new EntriesService(mysqlConnection),
    new EventsService(mysqlConnection),
    new ImagesService(),
    new InviteImagesService(mysqlConnection),
    new FamilyGroupsService(mysqlConnection),
    new UsersService(),
    new RolesService(),
    new EventSettingsService(mysqlConnection)
  );
}

main();