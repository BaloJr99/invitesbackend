import cors from 'cors';

export const ACCEPTED_ORIGINS = [
  'http://localhost:4200',
  'https://invites.brauliojr.dev'
]

export const corsMiddleware = () => cors({
  origin: (origin, callback) => {
    if (origin && ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
})
