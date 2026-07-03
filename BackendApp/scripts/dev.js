const { spawn } = require('node:child_process');
const path = require('node:path');

const services = [
  {
    name: 'AuthService',
    path: 'Backend-Restaurante/AuthService',
    port: 3006,
    color: '\x1b[31m',
    healthUrl: 'http://localhost:3006/api/v1/health',
  },
  {
    name: 'RestaurantesService',
    path: 'Backend-Restaurante/RestaurantesService',
    port: 3007,
    color: '\x1b[34m',
    healthUrl: 'http://localhost:3007/api/v1/health',
  },
  {
    name: 'PedidosReservacionesService',
    path: 'Backend-Restaurante/PedidosReservacionesService',
    port: 3008,
    color: '\x1b[32m',
    healthUrl: 'http://localhost:3008/api/v1/health',
  },
  {
    name: 'EventosReportesService',
    path: 'Backend-Restaurante/EventosReportesService',
    port: 3009,
    color: '\x1b[33m',
    healthUrl: 'http://localhost:3009/api/v1/health',
  },
];

const reset = '\x1b[0m';
const children = [];

const log = (color, title, message) => {
  console.log(`${color}[${title}]${reset} ${message}`);
};

console.log('\n🚀 Levantando microservicios Gestion-Restaurantes...\n');

services.forEach((service) => {
  const servicePath = path.join(__dirname, '..', '..', service.path);

  const child = spawn('pnpm', ['run', 'dev'], {
    cwd: servicePath,
    stdio: 'inherit',
    shell: true,
  });

  children.push(child);
  log(service.color, service.name, `Iniciando en puerto ${service.port}...`);

  child.on('error', (err) => {
    log(service.color, service.name, `Error: ${err.message}`);
  });

  child.on('close', (code) => {
    log(service.color, service.name, `Cerrado con código ${code}`);
  });
});

console.log('\n📋 Resumen de servicios:\n');
services.forEach((service) => {
  console.log(`  ${service.color}${service.name}${reset} → http://localhost:${service.port}`);
  console.log(`    Health: ${service.healthUrl}\n`);
});

console.log('Presiona CTRL+C para detener todos los servicios\n');

process.on('SIGINT', () => {
  console.log('\n\nDeteniendo todos los servicios...\n');
  children.forEach((child) => child.kill());
  setTimeout(() => {
    console.log('Todos los servicios han sido detenidos');
    process.exit(0);
  }, 1000);
});
