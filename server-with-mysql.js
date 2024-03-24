import { createApp } from './app.js'
import { ImagesModel } from './databases/cloudinary/images.js'
import { EntriesModel } from './databases/mysql/entries.js'
import { EventsModel } from './databases/mysql/events.js'
import { FamilyGroupModel } from './databases/mysql/familyGroups.js'
import { InviteImagesModel } from './databases/localhost/inviteImages.js'
import { UserModel } from './databases/mongodb/users.js'

createApp({
  entryModel: EntriesModel,
  userModel: UserModel,
  eventModel: EventsModel,
  familyGroupModel: FamilyGroupModel,
  imagesModel: ImagesModel,
  inviteImagesModel: InviteImagesModel
})
