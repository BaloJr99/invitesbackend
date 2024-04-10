import "dotenv/config";
import { connect } from "mongoose";

async function dbConnect(): Promise<void> {
  const DB_URI = <string>process.env.MONGO_URI;
  await connect(DB_URI);
}

export default dbConnect;