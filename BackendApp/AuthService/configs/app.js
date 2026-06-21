'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { dbConnection } from './db.js';
import '../src/users/user.model.js';
import '../src/auth/role.model.js';
import { seedRoles } from '../helpers/role-seed.js';
import { seedAdminUser } from '../helpers/admin-seed.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { errorHandler, notFound } from '../middlewares/server-genericError-handler.js';

import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user.routes.js';
import staffRoutes from '../src/users/staff.routes.js';

const BASE_PATH = '/api/v1';
const SERVICE_NAME = 'AuthService';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use('/uploads', express.static('uploads'));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(requestLimit);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  app.use(`${BASE_PATH}/auth`, authRoutes);
  app.use(`${BASE_PATH}/users`, userRoutes);
  app.use(`${BASE_PATH}/restaurants`, staffRoutes);

  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: SERVICE_NAME,
    });
  });

  app.use(notFound);
  app.use(errorHandler);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3006;
  app.set('trust proxy', 1);

  try {
    await dbConnection();
    await seedRoles();
    await seedAdminUser();

    middlewares(app);
    routes(app);

    app.listen(PORT, () => {
      console.log(`${SERVICE_NAME} running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`Error starting ${SERVICE_NAME}: ${err.message}`);
    process.exit(1);
  }
};
