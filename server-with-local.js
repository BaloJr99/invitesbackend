import { createApp } from './app.js'
import { EntriesModel } from './databases/localhost/entries.js'
import { EventsModel } from './databases/localhost/events.js'
import { FamilyGroupModel } from './databases/localhost/familyGroups.js'
import { UserModel } from './databases/mongodb/users.js'

createApp({ entryModel: EntriesModel, userModel: UserModel, eventModel: EventsModel, familyGroupModel: FamilyGroupModel })
