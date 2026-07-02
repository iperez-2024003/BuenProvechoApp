'use strict';

import { User, UserProfile, UserEmail } from '../users/user.model.js';
import { Role, UserRole } from '../auth/role.model.js';
import { STAFF_ROLE, RESTAURANT_ADMIN_ROLE } from '../../helpers/role-constants.js';
import { hashPassword } from '../../utils/password-utils.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { sequelize } from '../../configs/db.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { Op } from 'sequelize';

const ALLOWED_STAFF_ROLES = [STAFF_ROLE, RESTAURANT_ADMIN_ROLE];

const ensureRestaurantScope = (req, restaurantId) => {
  const isSuperAdmin = req.userRoleNames?.includes('SUPER_ADMIN_ROLE');
  if (isSuperAdmin) return null;

  const isRestaurantAdmin = req.userRoleNames?.includes(RESTAURANT_ADMIN_ROLE);
  if (!isRestaurantAdmin) {
    return 'No tienes permisos para gestionar personal';
  }

  const requesterRestaurantId = req.user?.RestaurantId || req.user?.restaurant_id;
  if (!requesterRestaurantId || requesterRestaurantId !== restaurantId) {
    return 'No puedes gestionar personal de otra sede';
  }

  return null;
};

/**
 * Crea un nuevo empleado para un restaurante específico.
 * Solo accesible por SUPER_ADMIN_ROLE o RESTAURANT_ADMIN_ROLE (validado en route).
 */
export const createStaff = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id: restaurantId } = req.params;
    const { name, surname, username, email, password, phone, role } = req.body;
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    const scopeError = ensureRestaurantScope(req, restaurantId);
    if (scopeError) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: scopeError });
    }

    // Validar que el restaurante existe
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { Email: normalizedEmail },
          { Username: normalizedUsername },
        ],
      },
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: existingUser.Email === normalizedEmail
          ? 'Ese correo ya está registrado'
          : 'Ese nombre de usuario ya está en uso',
      });
    }

    // Validar el rol solicitado: solo se permite STAFF_ROLE o RESTAURANT_ADMIN_ROLE
    const roleToAssign = ALLOWED_STAFF_ROLES.includes(role) ? role : STAFF_ROLE;

    // Hash de contraseña
    const hashedPassword = await hashPassword(password);

    // 1. Crear Usuario — activo automáticamente (creado por admin)
    const user = await User.create({
      Name: name,
      Surname: surname,
      Username: normalizedUsername,
      Email: normalizedEmail,
      Password: hashedPassword,
      Status: true,
      RestaurantId: restaurantId,
    }, { transaction });

    // 2. Crear Perfil y email verificado
    await UserProfile.create({
      UserId: user.Id,
      Phone: phone || '00000000',
    }, { transaction });

    await UserEmail.create({
      UserId: user.Id,
      EmailVerified: true,
    }, { transaction });

    // 3. Asignar el rol validado
    const roleObj = await Role.findOne({ where: { Name: roleToAssign } });
    if (!roleObj) throw new Error(`Rol ${roleToAssign} no configurado en la base de datos`);

    await UserRole.create({
      UserId: user.Id,
      RoleId: roleObj.Id
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Empleado creado exitosamente',
      staff: {
        id: user.Id,
        name: user.Name,
        email: user.Email,
        role: roleToAssign
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating staff:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error al crear el empleado'
    });
  }
});

/**
 * Obtiene todos los empleados de un restaurante.
 */
export const getRestaurantStaff = asyncHandler(async (req, res) => {
  const { id: restaurantId } = req.params;

  const scopeError = ensureRestaurantScope(req, restaurantId);
  if (scopeError) {
    return res.status(403).json({ success: false, message: scopeError });
  }

  const staff = await User.findAll({
    where: { RestaurantId: restaurantId },
    include: [
      {
        model: UserProfile,
        as: 'UserProfile',
        required: false,
      },
      {
        model: UserRole,
        as: 'UserRoles',
        required: true,
        include: [{
          model: Role,
          as: 'Role',
          where: { Name: ALLOWED_STAFF_ROLES }
        }]
      }
    ]
  });

  return res.json({
    success: true,
    staff: staff.map(u => ({
      id: u.Id,
      name: u.Name,
      surname: u.Surname,
      email: u.Email,
      username: u.Username,
      status: u.Status,
      profilePicture: u.UserProfile?.ProfilePicture || '',
      role: u.UserRoles?.[0]?.Role?.Name || STAFF_ROLE
    }))
  });
});

/**
 * Actualiza el rol de un empleado entre STAFF_ROLE y RESTAURANT_ADMIN_ROLE.
 * Solo accesible por SUPER_ADMIN_ROLE o RESTAURANT_ADMIN_ROLE (validado en route).
 */
export const updateStaffRole = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id: restaurantId, staff_id } = req.params;
    const { newRole } = req.body;

    const scopeError = ensureRestaurantScope(req, restaurantId);
    if (scopeError) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: scopeError });
    }

    const targetUser = await User.findByPk(staff_id);
    if (!targetUser) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    if (targetUser.RestaurantId !== restaurantId) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: 'No puedes modificar personal de otra sede' });
    }

    if (!ALLOWED_STAFF_ROLES.includes(newRole)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Rol no permitido. Solo se puede cambiar entre Staff y Admin de Restaurante.' });
    }

    const roleObj = await Role.findOne({ where: { Name: newRole } });
    if (!roleObj) throw new Error(`Rol ${newRole} no encontrado`);

    // Eliminar roles de staff previos para este usuario
    const rolesToRemove = await Role.findAll({ where: { Name: ALLOWED_STAFF_ROLES } });
    await UserRole.destroy({
      where: { UserId: staff_id, RoleId: rolesToRemove.map(r => r.Id) },
      transaction
    });

    // Asignar el nuevo rol
    await UserRole.create({ UserId: staff_id, RoleId: roleObj.Id }, { transaction });

    await transaction.commit();

    return res.json({ success: true, message: `Rol actualizado exitosamente a ${newRole}` });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating staff role:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar el rol' });
  }
});
