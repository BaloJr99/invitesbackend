declare namespace NodeJS {
  interface ProcessEnv extends IProcessEnv {
    DATABASE_URL: string
    MONGO_URI: string
    MYSQL_HOST: string
    MYSQL_PORT: string
    MYSQL_USER: string
    MYSQL_PASSWORD: string
    MYSQL_DATABASE: string
    SECRET: string
    REFRESH_SECRET: string
    CLOUD_NAME: string
    API_KEY: string
    API_SECRET: string
    NODE_ENV: string
    MAIL_HOST: string
    MAIL_USERNAME: string
    MAIL_PASSWORD: string
  }
}

declare namespace Express {
  export interface Request {
    userId: string
  }
}
