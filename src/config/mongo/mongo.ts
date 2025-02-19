import { connect } from 'mongoose'
import { EnvConfig } from '../config.js'

async function dbConnect(): Promise<void> {
  await connect(EnvConfig().mongo.uri, {
    dbName: EnvConfig().mongo.db
  })
}

export default dbConnect
