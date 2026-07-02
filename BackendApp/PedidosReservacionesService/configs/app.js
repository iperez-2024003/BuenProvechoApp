'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { initSocket } from '../src/socket/socket.config.js';

import orderRoutes from '../src/models/pedidos/order.routes.js';
import reservationRoutes from '../src/models/reservaciones/reservation.routes.js';
import reportRoutes from '../src/models/reportes/report.routes.js';

const BASE_PATH = '/api/v1';
const SERVICE_NAME = 'PedidosReservacionesService';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  app.use(`${BASE_PATH}/orders`, orderRoutes);
  app.use(`${BASE_PATH}/reservations`, reservationRoutes);
  app.use(`${BASE_PATH}/reports`, reportRoutes);

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
  const PORT = process.env.PORT || 3008;
  app.set('trust proxy', 1);

  // Root health endpoint — before all middleware for fast response (Render uses GET /health)
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      service: 'pedidos-service',
      timestamp: new Date(),
    });
  });

  try {
    await dbConnection();
    middlewares(app);
    routes(app);

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`${SERVICE_NAME} running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error(`Error starting ${SERVICE_NAME}: ${err.message}`);
    process.exit(1);
  }
};
