'use strict';

import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// ─── PostgreSQL (Auth & Users) ──────────────────────────────────────────────
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  logging: process.env.DB_SQL_LOGGING === 'true' ? console.log : false,
  define: {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// ─── MongoDB (para validar restaurantes) ────────────────────────────────────
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
    });
    console.log('MongoDB | Conectado (AuthService - read-only para restaurantes)');
  } catch (error) {
    console.warn('MongoDB | No se pudo conectar (login sin validación de restaurante):', error.message);
  }
};

export const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL | Conectado a PostgreSQL');

    if (process.env.NODE_ENV === 'development') {
      const syncLogging = process.env.DB_SQL_LOGGING === 'true' ? console.log : false;
      await sequelize.sync({ force: false, logging: syncLogging });
      console.log('PostgreSQL | Esquema sincronizado en desarrollo');
    }
  } catch (error) {
    console.error(`Error al conectar PostgreSQL: ${error}`);
    process.exit(1);
  }

  await connectMongo();
};

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Closing database connections...`);
  try {
    await sequelize.close();
    await mongoose.connection.close();
    console.log('Database connections closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
