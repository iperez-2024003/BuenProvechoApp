import { config } from './config.js';

const allowedOrigins = config.cors.allowedOrigins.length > 0
  ? config.cors.allowedOrigins
  : ['http://localhost:5173', 'http://localhost:3000', 'https://buen-provecho-app.vercel.app'];

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} no permitido`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-token', 'Accept', 'Origin'],
};
