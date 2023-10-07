import { createApp } from './app.js'
import { EntriesModel } from './models/mysql/entries.js'

createApp({ entryModel: EntriesModel })
