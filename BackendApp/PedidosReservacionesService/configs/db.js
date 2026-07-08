'use strict';

import mongoose from 'mongoose';

export const dbConnection = async () => {
  try {
    mongoose.connection.on('error', (err) => {
      console.log('MongoDB | Error:', err.message);
    });

    mongoose.connection.on('connecting', () => {
      console.log('MongoDB | Intentando conectar a MongoDB');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB | Conectado a MongoDB');
    });

    mongoose.connection.on('open', () => {
      console.log('MongoDB | Conexión abierta');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB | Reconectando a MongoDB');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB | Desconectando de MongoDB');
    });

    await mongoose.connect(process.env.URI_MONGO, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
  } catch (error) {
    console.log('MongoDB | Error al conectar:', error.message);
    console.log('MongoDB | El servicio continuará sin conexión a MongoDB');
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`MongoDB | Received ${signal}. Closing database connection...`);
  try {
    await mongoose.connection.close();
    console.log('MongoDB | Database connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB | Error during graceful shutdown:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
