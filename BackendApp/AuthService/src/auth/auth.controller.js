import {
  registerUserHelper,
  loginUserHelper,
  verifyEmailHelper,
  resendVerificationEmailHelper,
  forgotPasswordHelper,
  resetPasswordHelper,
} from '../../helpers/auth-operations.js';
import { findRefreshToken, revokeRefreshToken, createRefreshToken, revokeRefreshTokenFamily } from '../../helpers/refresh-token-db.js';
import { findUserById } from '../../helpers/user-db.js';
import { generateJWT } from '../../helpers/generate-jwt.js';
import { getUserProfileHelper } from '../../helpers/profile-operations.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { extractRefreshTokenFromRequest } from '../../middlewares/refresh-token.js';
import { config } from '../../configs/config.js';
import { User, UserProfile, UserEmail, UserPasswordReset } from '../users/user.model.js';
import { Role, UserRole } from '../auth/role.model.js';
import { uploadImage, deleteImage } from '../../helpers/cloudinary-service.js';
import { hashPassword, verifyPassword } from '../../utils/password-utils.js';
import crypto from 'crypto';
import path from 'path';
import Restaurant from '../restaurant/restaurant.model.js';

const buildRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/v1/auth',
  maxAge: (() => {
    const expiresIn = config.jwt.refreshExpiresIn || '7d';
    const value = parseInt(expiresIn, 10) || 7;
    if (expiresIn.endsWith('m')) return value * 60 * 1000;
    if (expiresIn.endsWith('h')) return value * 60 * 60 * 1000;
    if (expiresIn.endsWith('d')) return value * 24 * 60 * 60 * 1000;
    return 7 * 24 * 60 * 60 * 1000;
  })(),
});

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  try {
    const userData = {
      ...req.body,
      profilePicture: req.file ? req.file.path : null,
      role: 'CLIENT_ROLE', // Siempre CLIENT_ROLE en registro público, ignora intentos de asignar otro rol
    };

    const result = await registerUserHelper(userData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in register controller:', error);

    let statusCode = 400;
    if (
      error.message.includes('ya está registrado') ||
      error.message.includes('ya está en uso') ||
      error.message.includes('Ya existe un usuario')
    ) {
      statusCode = 409;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error en el registro',
      error: error.message,
    });
  }
});

// ─── CREATE MANAGER (SUPER_ADMIN ONLY) ────────────────────────────────────────
export const createManager = asyncHandler(async (req, res) => {
  try {
    // Solo SUPER_ADMIN puede crear managers
    const isSuperAdmin = req.userRoleNames?.includes('SUPER_ADMIN_ROLE');
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores globales pueden crear gerentes o personal administrativo.',
      });
    }

    const { email, username, password, name, surname, phone, role, restaurant_id, profilePicture } = req.body;

    // Validar que el rol sea permitido
    const allowedRoles = ['RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Rol inválido. Valores permitidos: ${allowedRoles.join(', ')}`,
      });
    }

    // Validar que sea un RESTAURANT_ADMIN_ROLE o STAFF_ROLE y tenga restaurant_id
    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del restaurante es requerido para crear gerentes o personal.',
      });
    }

    const userData = {
      email,
      username,
      password,
      name,
      surname,
      phone,
      role,
      restaurant_id,
      profilePicture: profilePicture || null,
    };

    const result = await registerUserHelper(userData);
    return res.status(201).json({
      ...result,
      message: `${role === 'RESTAURANT_ADMIN_ROLE' ? 'Gerente' : 'Personal'} creado exitosamente.`,
    });
  } catch (error) {
    console.error('Error in createManager controller:', error);

    let statusCode = 400;
    if (
      error.message.includes('ya está registrado') ||
      error.message.includes('ya está en uso') ||
      error.message.includes('Ya existe un usuario')
    ) {
      statusCode = 409;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al crear gerente',
      error: error.message,
    });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  try {
    // Aceptamos tanto emailOrUsername como simplemente email/username en minúsculas
    const { emailOrUsername, email, username, password } = req.body;
    const identifier = emailOrUsername || email || username;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Username y contraseña son requeridos'
      });
    }

    const result = await loginUserHelper(identifier, password);

    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, buildRefreshCookieOptions());
    }

    res.status(200).json({
      ...result,
      refreshToken: undefined,
      refreshTokenSet: true,
    });
  } catch (error) {
    console.error('Error in login controller:', error);

    let statusCode = 401;
    if (
      error.message.includes('bloqueada') ||
      error.message.includes('desactivada')
    ) {
      statusCode = 423;
    } else if (error.code === 'USER_NOT_FOUND') {
      statusCode = 404;
    } else if (error.code === 'INVALID_PASSWORD') {
      statusCode = 401;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error en el login',
      code: error.code,
      error: error.message,
    });
  }
});

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
export const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    const result = await verifyEmailHelper(token);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in verifyEmail controller:', error);

    let statusCode = 400;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (
      error.message.includes('inválido') ||
      error.message.includes('expirado')
    ) {
      statusCode = 401;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error en la verificación',
      error: error.message,
    });
  }
});

// ─── RESEND VERIFICATION ──────────────────────────────────────────────────────
export const resendVerification = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const result = await resendVerificationEmailHelper(email);

    if (!result.success) {
      if (result.message.includes('no encontrado')) {
        return res.status(404).json(result);
      }
      if (result.message.includes('ya ha sido verificado')) {
        return res.status(400).json(result);
      }
      return res.status(503).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in resendVerification controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordHelper(email);

    if (!result.success && result.data?.initiated === false) {
      return res.status(503).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in forgotPassword controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPasswordHelper(token, newPassword);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in resetPassword controller:', error);

    let statusCode = 400;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (
      error.message.includes('inválido') ||
      error.message.includes('expirado')
    ) {
      statusCode = 401;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al resetear contraseña',
      error: error.message,
    });
  }
});

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.userId; // Viene del middleware validateJWT
  const user = await getUserProfileHelper(userId);

  return res.status(200).json({
    success: true,
    message: 'Perfil obtenido exitosamente',
    data: user,
  });
});

// ─── GET PROFILE BY ID ────────────────────────────────────────────────────────
export const getProfileById = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'El userId es requerido',
    });
  }

  const user = await getUserProfileHelper(userId);

  return res.status(200).json({
    success: true,
    message: 'Perfil obtenido exitosamente',
    data: user,
  });
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
// PUT /api/v1/auth/profile
// Permite editar: name, surname, username, phone y foto de perfil (sube a Cloudinary)
export const updateProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const { name, surname, username, phone } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar que el nuevo username no esté en uso por otro usuario
    if (username && username !== user.Username) {
      const existingUser = await User.findOne({ where: { Username: username } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El nombre de usuario ya está en uso por otra cuenta',
        });
      }
    }

    // Actualizar campos del usuario
    await user.update({
      ...(name && { Name: name }),
      ...(surname && { Surname: surname }),
      ...(username && { Username: username }),
    });

    // Actualizar teléfono en UserProfile si viene
    if (phone) {
      const userProfile = await UserProfile.findOne({ where: { UserId: userId } });
      if (userProfile) {
        await userProfile.update({ Phone: phone });
      }
    }

    // Si viene imagen nueva, subirla a Cloudinary igual que registerUserHelper
    if (req.file) {
      try {
        let normalizedPath = req.file.path.replace(/\\/g, '/');
        if (!path.isAbsolute(normalizedPath)) {
          normalizedPath = path.resolve(normalizedPath).replace(/\\/g, '/');
        }

        const ext = path.extname(req.file.originalname);
        const randomHex = crypto.randomBytes(6).toString('hex');
        const cloudinaryFileName = `profile-${randomHex}${ext}`;

        // uploadImage retorna la secure_url completa de Cloudinary
        const newProfilePictureUrl = await uploadImage(normalizedPath, cloudinaryFileName);

        const userProfile = await UserProfile.findOne({ where: { UserId: userId } });
        if (userProfile) {
          // Eliminar imagen anterior de Cloudinary si no es el avatar por defecto
          const oldPicture = userProfile.ProfilePicture;
          if (oldPicture && oldPicture.includes('cloudinary.com')) {
            await deleteImage(oldPicture);
          }
          await userProfile.update({ ProfilePicture: newProfilePictureUrl });
        }
      } catch (uploadError) {
        console.error('Error uploading profile picture:', uploadError.message);
        return res.status(500).json({
          success: false,
          message: 'Error al subir la imagen de perfil a Cloudinary',
          error: uploadError.message,
        });
      }
    }

    const updatedUser = await getUserProfileHelper(userId);

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error in updateProfile controller:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el perfil',
      error: error.message,
    });
  }
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
// PUT /api/v1/auth/profile/change-password
// Requiere la contraseña actual (ingresar la anterior como pide el laboratorio)
export const changePassword = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña y la confirmación no coinciden',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe ser diferente a la contraseña actual',
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar contraseña actual con verifyPassword (igual que login)
    const isValidPassword = await verifyPassword(user.Password, currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta',
      });
    }

    // Hashear nueva contraseña con hashPassword (igual que register)
    const hashedPassword = await hashPassword(newPassword);
    await user.update({ Password: hashedPassword });

    // Enviar email de confirmación en background (igual que resetPassword)
    Promise.resolve()
      .then(async () => {
        const { sendPasswordChangedEmail } = await import('../../helpers/email-service.js');
        return sendPasswordChangedEmail(user.Email, user.Name);
      })
      .catch((err) => console.error('Error sending password changed email:', err));

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error in changePassword controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar la contraseña',
      error: error.message,
    });
  }
});

// ─── SYNC RESTAURANT ──────────────────────────────────────────────────────────
// PUT /api/v1/auth/profile/sync-restaurant
// Auto-repara el restaurant_id del usuario si es inválido
export const syncRestaurant = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const { restaurantId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Verificar si el restaurante existe en MongoDB
    let validId = restaurantId;
    if (validId) {
      const exists = await Restaurant.findById(validId);
      if (!exists) validId = null;
    }

    // Si no se envió un ID o el enviado es inválido, buscar el primero disponible (como fallback)
    if (!validId) {
      const firstRest = await Restaurant.findOne({ isActive: true });
      if (firstRest) {
        validId = firstRest._id.toString();
      }
    }

    if (validId) {
      await user.update({ RestaurantId: validId });
    }

    const updatedUser = await getUserProfileHelper(userId);

    return res.status(200).json({
      success: true,
      message: 'Sincronización de restaurante completada',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error in syncRestaurant controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al sincronizar restaurante',
      error: error.message
    });
  }
});

// POST /auth/refresh
export const refreshToken = asyncHandler(async (req, res) => {
  // Preferir registro ya validado por middleware
  const incomingToken = extractRefreshTokenFromRequest(req);
  const rt = req.refreshTokenRecord || (await findRefreshToken(incomingToken));
  if (!rt) return res.status(401).json({ success: false, message: 'Refresh token inválido' });
  if (rt.Revoked) {
    await revokeRefreshTokenFamily(rt.UserId);
    return res.status(401).json({
      success: false,
      message: 'Refresh token reutilizado detectado. Todas las sesiones del usuario fueron revocadas.',
    });
  }
  if (new Date(rt.ExpiresAt) < new Date()) return res.status(401).json({ success: false, message: 'Refresh token expirado' });

  // Generar nuevo access token
  const user = await findUserById(rt.UserId);
  if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

  const role = user.UserRoles?.[0]?.Role?.Name || 'CLIENT_ROLE';
  const token = await generateJWT(user.Id.toString(), { role });

  // Rotación de refresh token: revocar el actual y emitir uno nuevo
  try {
    await revokeRefreshToken(rt.Token);
  } catch (err) {
    console.warn('No se pudo revocar refresh token viejo:', err);
  }

  const { token: newRefreshToken, expiresAt: refreshExpiresAt } = await createRefreshToken(user.Id.toString());
  res.cookie('refreshToken', newRefreshToken, buildRefreshCookieOptions());

  return res.status(200).json({
    success: true,
    token,
    refreshTokenSet: true,
    refreshExpiresAt,
  });
});

// POST /auth/revoke
export const revokeToken = asyncHandler(async (req, res) => {
  const refreshToken = extractRefreshTokenFromRequest(req);
  if (!refreshToken) return res.status(400).json({ success: false, message: 'refreshToken es requerido' });

  const ok = await revokeRefreshToken(refreshToken);
  if (!ok) return res.status(404).json({ success: false, message: 'Refresh token no encontrado' });

  res.clearCookie('refreshToken', { path: '/api/v1/auth' });

  return res.status(200).json({ success: true, message: 'Refresh token revocado' });
});

// ─── GET MANAGERS (SUPER_ADMIN ONLY) ──────────────────────────────────────────
export const getManagers = asyncHandler(async (req, res) => {
  try {
    const isSuperAdmin = req.userRoleNames?.includes('SUPER_ADMIN_ROLE');
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores globales pueden ver gerentes',
      });
    }

    const managers = await User.findAll({
      include: [
        {
          model: UserRole,
          as: 'UserRoles',
          required: true,
          include: [
            {
              model: Role,
              as: 'Role',
              where: { Name: 'RESTAURANT_ADMIN_ROLE' },
            },
          ],
        },
        {
          model: UserProfile,
          as: 'UserProfile',
          required: false,
        },
      ],
      order: [['CreatedAt', 'DESC']],
    });

    const managersWithRestaurant = await Promise.all(
      managers.map(async (manager) => {
        let restaurantName = 'Sin sede';
        if (manager.RestaurantId) {
          const restaurant = await Restaurant.findById(manager.RestaurantId).select('name').lean();
          restaurantName = restaurant?.name || 'Sede Desconocida';
        }

        return {
          id: manager.Id,
          name: manager.Name,
          surname: manager.Surname,
          email: manager.Email,
          phone: manager.UserProfile?.Phone || '',
          restaurant_id: manager.RestaurantId || '',
          restaurantName,
          createdAt: manager.CreatedAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: managersWithRestaurant,
      message: 'Gerentes obtenidos exitosamente',
    });
  } catch (error) {
    console.error('Error in getManagers controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener gerentes',
      error: error.message,
    });
  }
});

// ─── UPDATE MANAGER RESTAURANT (SUPER_ADMIN ONLY) ──────────────────────────────
export const updateManagerRestaurant = asyncHandler(async (req, res) => {
  try {
    const isSuperAdmin = req.userRoleNames?.includes('SUPER_ADMIN_ROLE');
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores globales pueden cambiar sedes de gerentes',
      });
    }

    const { managerId } = req.params;
    const { restaurant_id } = req.body;

    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la sede es requerido',
      });
    }

    // Verificar que el gerente existe
    const manager = await User.findByPk(managerId);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Gerente no encontrado',
      });
    }

    const managerRoles = await UserRole.findAll({
      where: { UserId: manager.Id },
      include: [
        {
          model: Role,
          as: 'Role',
          where: { Name: 'RESTAURANT_ADMIN_ROLE' },
        },
      ],
    });

    if (!managerRoles.length) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no es un gerente de sede',
      });
    }

    // Verificar que la sede existe
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Sede no encontrada',
      });
    }

    // Actualizar la sede del gerente
    manager.RestaurantId = restaurant_id;
    await manager.save();

    return res.status(200).json({
      success: true,
      message: `Gerente ${manager.name} ${manager.surname} asignado a ${restaurant.name}`,
      data: {
        id: manager.id,
        name: manager.name,
        surname: manager.surname,
        restaurant_id: manager.restaurant_id,
        restaurantName: restaurant.name,
      },
    });
  } catch (error) {
    console.error('Error in updateManagerRestaurant controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar la sede del gerente',
      error: error.message,
    });
  }
});

// ─── DELETE MANAGER (SUPER_ADMIN ONLY) ─────────────────────────────────────────
export const deleteManager = asyncHandler(async (req, res) => {
  try {
    const isSuperAdmin = req.userRoleNames?.includes('SUPER_ADMIN_ROLE');
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores globales pueden eliminar gerentes',
      });
    }

    const { managerId } = req.params;

    // Verificar que el usuario existe
    const manager = await User.findByPk(managerId, {
      include: [
        { model: UserProfile, as: 'UserProfile' },
        { model: UserRole, as: 'UserRoles', include: [{ model: Role, as: 'Role' }] }
      ]
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar que sea un gerente o staff (no un super admin)
    const isManagerOrStaff = manager.UserRoles?.some(ur => 
      ['RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE'].includes(ur.Role.Name)
    );

    if (!isManagerOrStaff) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden eliminar usuarios con rol de Gerente o Staff desde este apartado',
      });
    }

    // Si tiene foto en Cloudinary, eliminarla
    if (manager.UserProfile?.ProfilePicture && manager.UserProfile.ProfilePicture.includes('cloudinary.com')) {
      try {
        await deleteImage(manager.UserProfile.ProfilePicture);
      } catch (err) {
        console.warn('Error al eliminar imagen de Cloudinary:', err);
      }
    }

    // Eliminar registros relacionados manualmente (o dejar que la DB lo haga si hay CASCADE)
    // En este caso, lo haremos por seguridad
    await UserRole.destroy({ where: { user_id: manager.Id } });
    await UserProfile.destroy({ where: { user_id: manager.Id } });
    await UserEmail.destroy({ where: { user_id: manager.Id } });
    await UserPasswordReset.destroy({ where: { user_id: manager.Id } });
    
    // Finalmente eliminar al usuario
    await manager.destroy();

    return res.status(200).json({
      success: true,
      message: `El usuario ${manager.Username} ha sido eliminado permanentemente`,
    });
  } catch (error) {
    console.error('Error in deleteManager controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el usuario',
      error: error.message,
    });
  }
});