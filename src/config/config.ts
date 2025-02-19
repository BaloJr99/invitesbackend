import dotenv from 'dotenv'
dotenv.config()

const {
  DATABASE_URL,
  MONGO_URI,
  MONGO_DB,
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  SECRET,
  REFRESH_SECRET,
  CLOUD_NAME,
  API_KEY,
  API_SECRET,
  NODE_ENV,
  MAIL_HOST,
  MAIL_USERNAME,
  MAIL_PASSWORD,
  PORT
} = process.env

export const EnvConfig = () => ({
  mysql: {
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    port: parseInt(MYSQL_PORT),
    database_url: DATABASE_URL
  },
  mongo: {
    uri: MONGO_URI,
    db: MONGO_DB
  },
  nodemailer: {
    service: MAIL_HOST,
    user: MAIL_USERNAME,
    pass: MAIL_PASSWORD
  },
  cloudinary: {
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
  },
  port: PORT,
  node_env: NODE_ENV,
  jwt: {
    secret: SECRET,
    refresh_secret: REFRESH_SECRET
  }
})
