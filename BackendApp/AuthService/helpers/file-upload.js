import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../configs/config.js';
import fs from 'fs';

// Crear el directorio de uploads si no existe
const createUploadDir = () => {
  try {
    if (!fs.existsSync(config.upload.uploadPath)) {
      fs.mkdirSync(config.upload.uploadPath, { recursive: true });
    }
  } catch (err) {
    if (err.code === 'EACCES') {
      throw new Error('No se pudo crear el directorio de uploads. Verifica los permisos del servidor.');
    }
    throw err;
  }
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      createUploadDir();
      cb(null, config.upload.uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'
      ),
      false
    );
  }
};

// Configuración de multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxSize,
  },
  fileFilter: fileFilter,
});

/**
 * Middleware para manejar errores de upload
 */
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande',
        error: `El tamaño máximo permitido es ${config.upload.maxSize / (1024 * 1024)}MB`,
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado',
        error: error.message,
      });
    }
  }

  if (error.message && error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido',
      error: 'Solo se permiten imágenes (JPEG, JPG, PNG, GIF)',
    });
  }

  if (error.code === 'EACCES' || (error.message && error.message.includes('permisos'))) {
    return res.status(400).json({
      success: false,
      message: 'No se pudo procesar la imagen. El registro continua sin foto de perfil.',
      error: 'Error de permisos al guardar el archivo temporal. La imagen no se cargará.',
    });
  }

  next(error);
};

/**
 * Middleware que envuelve upload.single() para que, si falla la subida,
 * el registro/usuario pueda continuar sin foto de perfil.
 */
export const optionalUpload = (fieldName) => (req, res, next) => {
  const single = upload.single(fieldName);
  single(req, res, (err) => {
    if (err) {
      console.warn(`Upload opcional falló para ${fieldName}:`, err.message || err);
      // No bloquea — sigue sin archivo
      return next();
    }
    next();
  });
};

export const deleteFile = (filename) => {
  try {
    const filePath = path.join(config.upload.uploadPath, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const deleteFileByPath = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file by path:', error);
    return false;
  }
};
