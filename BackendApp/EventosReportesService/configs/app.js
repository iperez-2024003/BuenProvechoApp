'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';

import eventRoutes from '../src/models/eventos/event.routes.js';
import statisticsRoutes from '../src/models/estadisticas/statistics.routes.js';

const BASE_PATH = '/api/v1';
const SERVICE_NAME = 'EventosReportesService';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  app.use(`${BASE_PATH}/events`, eventRoutes);
  app.use(`${BASE_PATH}/statistics`, statisticsRoutes);

  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: SERVICE_NAME,
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado',
    });
  });
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3009;
  app.set('trust proxy', 1);

  try {
    await dbConnection();
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
