import cors from 'cors';

// Localhost
// Production
// Preview

export const ACCEPTED_ORIGINS = [
  'http://localhost:4200',
  'https://invites.brauliojr.dev',
  'https://invites-card-fkvf-git-playing-with-i18n-balojr99s-projects.vercel.app'
]

export const corsMiddleware = () => cors({
  origin: (origin, callback) => {
    if (origin && ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
})
