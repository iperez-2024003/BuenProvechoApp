const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const services = [
  'Backend-Restaurante/AuthService',
  'Backend-Restaurante/RestaurantesService',
  'Backend-Restaurante/PedidosReservacionesService',
  'Backend-Restaurante/EventosReportesService',
  'Frontend-Restaurante'
];

console.log('\n📦 Instalando dependencias de todos los servicios...\n');

services.forEach((service) => {
  const servicePath = path.join(__dirname, '..', '..', service);
  const packageJsonPath = path.join(servicePath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  ${service}: package.json no encontrado, saltando...`);
    return;
  }

  console.log(`📥 Instalando ${service}...`);
  try {
    execSync('pnpm install', { cwd: servicePath, stdio: 'inherit' });
    console.log(`✅ ${service}: Dependencias instaladas\n`);
  } catch (error) {
    console.error(`❌ ${service}: Error instalando dependencias: ${error.message}\n`);
  }
});

console.log('\n✅ Todas las dependencias han sido instaladas\n');
