import { User, UserProfile, UserEmail } from '../src/users/user.model.js';
import { Role, UserRole } from '../src/auth/role.model.js';
import { hashPassword } from '../utils/password-utils.js';
import { SUPER_ADMIN_ROLE, RESTAURANT_ADMIN_ROLE, STAFF_ROLE } from './role-constants.js';

/**
 * Asegura la existencia y contraseñas de los usuarios base (Admin, Gerente, Staff)
 */
export const seedAdminUser = async () => {
  try {
    const defaultPassword = 'Admin123!';
    const hashedPassword = await hashPassword(defaultPassword);

    // 1. Asegurar SUPER ADMIN
    const adminEmail = 'admin@restaurantes.com';
    let adminUser = await User.findOne({ where: { Email: adminEmail } });
    if (!adminUser) {
      const adminRole = await Role.findOne({ where: { Name: SUPER_ADMIN_ROLE } });
      adminUser = await User.create({
        Name: 'Administrador', Surname: 'Sistema', Username: 'admin', Email: adminEmail, Password: hashedPassword, Status: true,
      });
      await UserProfile.create({ UserId: adminUser.Id, Phone: '00000000' });
      await UserEmail.create({ UserId: adminUser.Id, EmailVerified: true });
      await UserRole.create({ UserId: adminUser.Id, RoleId: adminRole.Id });
      console.log('🎉 SUPER ADMIN creado.');
    } else {
      await adminUser.update({ Password: hashedPassword });
      console.log('✅ SUPER ADMIN sincronizado.');
    }

    // 2. Asegurar GERENTE
    const gerenteEmail = 'gerente@kinal.com';
    let gerenteUser = await User.findOne({ where: { Email: gerenteEmail } });
    if (!gerenteUser) {
      const gerenteRole = await Role.findOne({ where: { Name: RESTAURANT_ADMIN_ROLE } });
      gerenteUser = await User.create({
        Name: 'Gerente', Surname: 'Kinal', Username: 'gerente', Email: gerenteEmail, Password: hashedPassword, Status: true,
      });
      await UserProfile.create({ UserId: gerenteUser.Id, Phone: '88888888' });
      await UserEmail.create({ UserId: gerenteUser.Id, EmailVerified: true });
      await UserRole.create({ UserId: gerenteUser.Id, RoleId: gerenteRole.Id });
      console.log('👤 Gerente creado.');
    } else {
      await gerenteUser.update({ Password: hashedPassword });
      console.log('✅ Gerente sincronizado.');
    }

    // 3. Asegurar STAFF
    const staffEmail = 'staff@kinal.com';
    let staffUser = await User.findOne({ where: { Email: staffEmail } });
    if (!staffUser) {
      const staffRole = await Role.findOne({ where: { Name: STAFF_ROLE } });
      staffUser = await User.create({
        Name: 'Mesero', Surname: 'Kinal', Username: 'staff', Email: staffEmail, Password: hashedPassword, Status: true,
      });
      await UserProfile.create({ UserId: staffUser.Id, Phone: '77777777' });
      await UserEmail.create({ UserId: staffUser.Id, EmailVerified: true });
      await UserRole.create({ UserId: staffUser.Id, RoleId: staffRole.Id });
      console.log('👨‍🍳 Staff creado.');
    } else {
      await staffUser.update({ Password: hashedPassword });
      console.log('✅ Staff sincronizado.');
    }

  } catch (error) {
    console.error('❌ Error en el seeder de usuarios:', error.message);
  }
};