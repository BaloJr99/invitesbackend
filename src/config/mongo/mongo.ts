import { connect } from 'mongoose'

async function dbConnect(): Promise<void> {
  const DB_URI = process.env.MONGO_URI
  await connect(DB_URI, {
    dbName: process.env.MONGO_DB
  })
}

export default dbConnect
