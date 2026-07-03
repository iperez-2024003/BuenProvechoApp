'use strict';

import Restaurant from './restaurant.model.js';
import Menu from '../menus/menu.model.js';
import MenuItem from '../menus/menu-item.model.js';
import Table from '../mesas/table.model.js';
import Order from '../pedidos/order.model.js';
import OrderItem from '../pedidos/order-item.model.js';
import Reservation from '../reservaciones/reservation.model.js';
import Event from '../eventos/event.model.js';
import EventParticipant from '../eventos/event-participant.model.js';
import Review from '../resenas/review.model.js';
import { uploadImage, deleteImage } from '../../../helpers/cloudinary-service.js';
import crypto from 'crypto';
import path from 'path';

const toPlainRestaurant = (restaurant) => {
  if (!restaurant) {
    return null;
  }

  return typeof restaurant.toObject === 'function' ? restaurant.toObject() : restaurant;
};

export const serializeRestaurant = (restaurant) => {
  const data = toPlainRestaurant(restaurant);

  if (!data) {
    return null;
  }

  return {
    id: data._id?.toString?.() || data._id,
    name: data.name,
    description: data.description,
    address: data.address,
    phone: data.phone,
    email: data.email,
    category: data.category,
    cuisine_type: data.cuisineType ?? data.cuisine_type,
    price_range: data.priceRange ?? data.price_range,
    average_price: data.averagePrice ?? data.average_price,
    capacity: data.capacity,
    opening_time: data.openingTime ?? data.opening_time,
    closing_time: data.closingTime ?? data.closing_time,
    operating_days: data.operatingDays ?? data.operating_days,
    accepts_reservations: data.acceptsReservations ?? data.accepts_reservations,
    accepts_takeout: data.acceptsTakeout ?? data.accepts_takeout,
    accepts_delivery: data.acceptsDelivery ?? data.accepts_delivery,
    parking_available: data.parkingAvailable ?? data.parking_available,
    wifi_available: data.wifiAvailable ?? data.wifi_available,
    outdoor_seating: data.outdoorSeating ?? data.outdoor_seating,
    pet_friendly: data.petFriendly ?? data.pet_friendly,
    wheelchair_accessible: data.wheelchairAccessible ?? data.wheelchair_accessible,
    latitude: data.latitude,
    longitude: data.longitude,
    website_url: data.websiteUrl ?? data.website_url,
    social_media: data.socialMedia ?? data.social_media,
    payment_methods: data.paymentMethods ?? data.payment_methods,
    special_features: data.specialFeatures ?? data.special_features,
    admin_id: data.adminId ?? data.admin_id,
    parent_restaurant_id: data.parentRestaurantId ?? data.parent_restaurant_id,
    logo_url: data.logoUrl ?? data.logo_url,
    cover_image_url: data.coverImageUrl ?? data.cover_image_url,
    rating: data.rating,
    total_reviews: data.totalReviews ?? data.total_reviews,
    is_verified: data.isVerified ?? data.is_verified,
    verification_date: data.verificationDate ?? data.verification_date,
    is_active: data.isActive ?? data.is_active,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const normalizeRestaurantPayload = (payload = {}, fileUrl) => ({
  name: payload.name,
  description: payload.description,
  address: payload.address,
  phone: payload.phone,
  email: payload.email,
  category: payload.category,
  cuisineType: payload.cuisineType ?? payload.cuisine_type,
  priceRange: payload.priceRange ?? payload.price_range,
  averagePrice: payload.averagePrice ?? payload.average_price,
  capacity: payload.capacity !== undefined ? Number(payload.capacity) : undefined,
  openingTime: payload.openingTime ?? payload.opening_time,
  closingTime: payload.closingTime ?? payload.closing_time,
  operatingDays: payload.operatingDays ?? payload.operating_days,
  acceptsReservations: payload.acceptsReservations ?? payload.accepts_reservations,
  acceptsTakeout: payload.acceptsTakeout ?? payload.accepts_takeout,
  acceptsDelivery: payload.acceptsDelivery ?? payload.accepts_delivery,
  parkingAvailable: payload.parkingAvailable ?? payload.parking_available,
  wifiAvailable: payload.wifiAvailable ?? payload.wifi_available,
  outdoorSeating: payload.outdoorSeating ?? payload.outdoor_seating,
  petFriendly: payload.petFriendly ?? payload.pet_friendly,
  wheelchairAccessible: payload.wheelchairAccessible ?? payload.wheelchair_accessible,
  latitude: payload.latitude,
  longitude: payload.longitude,
  websiteUrl: payload.websiteUrl ?? payload.website_url,
  socialMedia: payload.socialMedia ?? payload.social_media,
  paymentMethods: payload.paymentMethods ?? payload.payment_methods,
  specialFeatures: payload.specialFeatures ?? payload.special_features,
  adminId: payload.adminId ?? payload.admin_id,
  parentRestaurantId: payload.parentRestaurantId ?? payload.parent_restaurant_id,
  logoUrl: fileUrl ? fileUrl : (payload.logoUrl ?? payload.logo_url),
  coverImageUrl: payload.coverImageUrl ?? payload.cover_image_url,
  rating: payload.rating,
  totalReviews: payload.totalReviews ?? payload.total_reviews,
  isVerified: payload.isVerified ?? payload.is_verified,
  verificationDate: payload.verificationDate ?? payload.verification_date,
  isActive: payload.isActive ?? payload.is_active,
});

/**
 * Obtener todos los restaurantes con paginación
 * @param {Object} options - { page, limit, isActive }
 * @returns {Promise} { restaurants, pagination }
 */
export const fetchRestaurants = async ({
  page = 1,
  limit = 10,
  isActive = true,
}) => {
  try {
    const skip = (page - 1) * limit;

    const restaurants = await Restaurant.find({ isActive })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Restaurant.countDocuments({ isActive });

    return {
      restaurants: restaurants.map(serializeRestaurant),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error fetching restaurants: ${error.message}`);
  }
};

/**
 * Obtener un restaurante por ID
 */
export const fetchRestaurantById = async (id) => {
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }
    return serializeRestaurant(restaurant);
  } catch (error) {
    throw new Error(`Error fetching restaurant: ${error.message}`);
  }
};

/**
 * Crear nuevo restaurante
 * @param {Object} restaurantData - Datos del restaurante
 * @param {Object} file - Archivo cargado (logo)
 */
export const createRestaurantRecord = async ({ restaurantData, file }) => {
  try {
    let logoUrl = null;
    if (file) {
      let normalizedPath = file.path.replace(/\\/g, '/');
      if (!path.isAbsolute(normalizedPath)) {
        normalizedPath = path.resolve(normalizedPath).replace(/\\/g, '/');
      }
      const ext = path.extname(file.originalname);
      const randomHex = crypto.randomBytes(6).toString('hex');
      const cloudinaryFileName = `restaurant-${randomHex}${ext}`;
      logoUrl = await uploadImage(normalizedPath, cloudinaryFileName);
    }

    const data = normalizeRestaurantPayload(restaurantData, logoUrl);

    const newRestaurant = await Restaurant.create({
      ...data,
    });

    return serializeRestaurant(newRestaurant);
  } catch (error) {
    throw new Error(`Error creating restaurant: ${error.message}`);
  }
};

/**
 * Actualizar restaurante
 */
export const updateRestaurantRecord = async ({ id, updateData, file }) => {
  try {
    let logoUrl = null;
    if (file) {
      let normalizedPath = file.path.replace(/\\/g, '/');
      if (!path.isAbsolute(normalizedPath)) {
        normalizedPath = path.resolve(normalizedPath).replace(/\\/g, '/');
      }
      const ext = path.extname(file.originalname);
      const randomHex = crypto.randomBytes(6).toString('hex');
      const cloudinaryFileName = `restaurant-${randomHex}${ext}`;
      logoUrl = await uploadImage(normalizedPath, cloudinaryFileName);
    }

    const data = normalizeRestaurantPayload(updateData, logoUrl);

    if (logoUrl) {
      const currentRestaurant = await Restaurant.findById(id);
      if (currentRestaurant && currentRestaurant.logoUrl && currentRestaurant.logoUrl.includes('cloudinary.com')) {
        await deleteImage(currentRestaurant.logoUrl);
      }
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedRestaurant) {
      throw new Error('Restaurant not found');
    }

    return serializeRestaurant(updatedRestaurant);
  } catch (error) {
    throw new Error(`Error updating restaurant: ${error.message}`);
  }
};

/**
 * Cambiar estado del restaurante
 */
export const changeRestaurantStatus = async (id, isActive) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    return serializeRestaurant(restaurant);
  } catch (error) {
    throw new Error(`Error changing restaurant status: ${error.message}`);
  }
};

/**
 * Eliminar restaurante (Hard delete con cascada)
 */
export const deleteRestaurant = async (id) => {
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // 1. Limpiar imágenes del restaurante en Cloudinary
    if (restaurant.logoUrl && restaurant.logoUrl.includes('cloudinary.com')) {
      await deleteImage(restaurant.logoUrl);
    }
    if (restaurant.coverImageUrl && restaurant.coverImageUrl.includes('cloudinary.com')) {
      await deleteImage(restaurant.coverImageUrl);
    }

    // 2. Limpiar Platillos (y sus fotos en Cloudinary)
    const menuItems = await MenuItem.find({ restaurant_id: id });
    for (const item of menuItems) {
      if (item.image_url && item.image_url.includes('cloudinary.com')) {
        await deleteImage(item.image_url);
      }
    }
    await MenuItem.deleteMany({ restaurant_id: id });

    // 3. Borrar Menús
    await Menu.deleteMany({ restaurant_id: id });

    // 4. Borrar Mesas
    await Table.deleteMany({ restaurant_id: id });

    // 5. Borrar Órdenes y sus ítems
    const orders = await Order.find({ restaurant_id: id });
    const orderIds = orders.map(o => o._id);
    await OrderItem.deleteMany({ order_id: { $in: orderIds } });
    await Order.deleteMany({ restaurant_id: id });

    // 6. Borrar Reservaciones
    await Reservation.deleteMany({ restaurant_id: id });

    // 7. Borrar Eventos y sus participantes
    const events = await Event.find({ restaurantId: id });
    const eventIds = events.map(e => e._id);
    await EventParticipant.deleteMany({ eventId: { $in: eventIds } });
    await Event.deleteMany({ restaurantId: id });

    // 8. Borrar Reseñas
    await Review.deleteMany({ restaurantId: id });

    // 9. Finalmente, borrar el restaurante
    await Restaurant.findByIdAndDelete(id);

    return serializeRestaurant(restaurant);
  } catch (error) {
    throw new Error(`Error deleting restaurant with cascade: ${error.message}`);
  }
};

/**
 * Buscar restaurantes por nombre o categoría
 */
export const searchRestaurants = async ({ keyword, category, page = 1, limit = 10 }) => {
  try {
    const skip = (page - 1) * limit;
    const filter = { isActive: true };

    if (keyword) {
      filter.$text = { $search: keyword };
    }

    if (category) {
      filter.category = category;
    }

    const restaurants = await Restaurant.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Restaurant.countDocuments(filter);

    return {
      restaurants: restaurants.map(serializeRestaurant),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error searching restaurants: ${error.message}`);
  }
};

/**
 * Obtener restaurantes por admin ID
 */
export const fetchRestaurantsByAdmin = async ({ adminId, page = 1, limit = 10 }) => {
  try {
    const skip = (page - 1) * limit;

    const restaurants = await Restaurant.find({ adminId, isActive: true })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Restaurant.countDocuments({ adminId, isActive: true });

    return {
      restaurants: restaurants.map(serializeRestaurant),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error fetching admin restaurants: ${error.message}`);
  }
};
