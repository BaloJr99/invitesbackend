import { createApp } from './app.js'
import { EntriesModel } from './databases/mysql/entries.js'
import { EventsModel } from './databases/localhost/events.js'
import { UserModel } from './databases/mongodb/users.js'

createApp({ entryModel: EntriesModel, userModel: UserModel, eventModel: EventsModel })
