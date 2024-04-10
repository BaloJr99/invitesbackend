declare namespace NodeJS {
  interface ProcessEnv extends IProcessEnv { 
    DATABASE_URL: string,
    MONGO_USERNAME: string,
    MONGO_PASSWORD: string,
    MONGO_CLUSTER: string,
    SECRET: string,
    MYSQL_HOST: string,
    MYSQL_PORT: string,
    MYSQL_USER: string,
    MYSQL_PASSWORD: string,
    MYSQL_DATABASE: string,
    CLOUD_NAME: string,
    API_KEY: string,
    API_SECRET: string,
    NODE_ENV: string
  }
}

declare namespace Express {
  export interface Request {
    userId: string
  }
}