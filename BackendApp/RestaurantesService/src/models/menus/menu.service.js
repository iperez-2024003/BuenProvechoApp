'use strict';

import Menu from './menu.model.js';
import MenuItem from './menu-item.model.js';
import Restaurant from '../restaurantes/restaurant.model.js';
import { uploadImage, deleteImage } from '../../../helpers/cloudinary-service.js';
import crypto from 'crypto';
import path from 'path';

const toPlain = (document) => (typeof document?.toObject === 'function' ? document.toObject() : document);

export const serializeMenu = (menu) => {
  const data = toPlain(menu);
  if (!data) return null;

  return {
    id: data._id?.toString?.() || data._id,
    name: data.name,
    description: data.description,
    restaurant_id: data.restaurant_id,
    display_order: data.display_order,
    is_active: data.is_active,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const serializeMenuItem = (item) => {
  const data = toPlain(item);
  if (!data) return null;

  return {
    id: data._id?.toString?.() || data._id,
    name: data.name,
    description: data.description,
    price: data.price,
    menu_id: data.menu_id,
    restaurant_id: data.restaurant_id,
    image_url: data.image_url,
    ingredients: data.ingredients ?? [],
    allergens: data.allergens ?? [],
    is_available: data.is_available,
    stock_quantity: data.stock_quantity,
    preparation_time: data.preparation_time,
    calories: data.calories,
    is_vegetarian: data.is_vegetarian,
    is_vegan: data.is_vegan,
    is_gluten_free: data.is_gluten_free,
    spice_level: data.spice_level,
    portion_size: data.portion_size,
    is_active: data.is_active,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const normalizeMenuPayload = (payload = {}) => ({
  name: payload.name,
  description: payload.description,
  restaurant_id: payload.restaurant_id,
  display_order: payload.display_order !== undefined ? Number(payload.display_order) : 0,
  is_active: payload.is_active ?? true,
});

const normalizeMenuItemPayload = (payload = {}, fileUrl) => ({
  name: payload.name,
  description: payload.description,
  price: payload.price !== undefined ? Number(payload.price) : undefined,
  menu_id: payload.menu_id,
  restaurant_id: payload.restaurant_id,
  image_url: fileUrl ? fileUrl : (payload.image_url || payload.imageUrl),
  ingredients: payload.ingredients ?? [],
  allergens: payload.allergens ?? [],
  is_available: payload.is_available ?? true,
  stock_quantity: payload.stock_quantity !== undefined ? Number(payload.stock_quantity) : 0,
  preparation_time: payload.preparation_time !== undefined ? Number(payload.preparation_time) : undefined,
  calories: payload.calories !== undefined ? Number(payload.calories) : undefined,
  is_vegetarian: payload.is_vegetarian ?? false,
  is_vegan: payload.is_vegan ?? false,
  is_gluten_free: payload.is_gluten_free ?? false,
  spice_level: payload.spice_level ?? 'none',
  portion_size: payload.portion_size,
  is_active: payload.is_active ?? true,
});

export const fetchMenus = async ({ restaurant_id, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const filter = { is_active: true };

  if (restaurant_id) {
    filter.restaurant_id = restaurant_id;
  }

  const menus = await Menu.find(filter).sort({ display_order: 1, name: 1 }).skip(skip).limit(limit);
  const total = await Menu.countDocuments(filter);

  return {
    menus: menus.map(serializeMenu),
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const fetchMenuById = async (id) => {
  const menu = await Menu.findById(id);
  if (!menu) return null;

  const items = await MenuItem.find({ menu_id: id, is_active: true }).sort({ name: 1 });
  return { ...serializeMenu(menu), items: items.map(serializeMenuItem) };
};

export const createMenuRecord = async ({ menuData }) => {
  const restaurant = await Restaurant.findById(menuData.restaurant_id);
  if (!restaurant) throw new Error('Restaurante no encontrado');

  const existingMenu = await Menu.findOne({
    name: menuData.name,
    restaurant_id: menuData.restaurant_id,
    is_active: true,
  });

  if (existingMenu) {
    throw new Error('A menu category with this name already exists in this restaurant');
  }

  const menu = await Menu.create(normalizeMenuPayload(menuData));
  return serializeMenu(menu);
};

export const updateMenuRecord = async ({ id, updateData }) => {
  const currentMenu = await Menu.findById(id);
  if (!currentMenu) throw new Error('Menu No encontrado');

  const payload = normalizeMenuPayload(updateData);
  delete payload.restaurant_id;

  if (payload.name && payload.name !== currentMenu.name) {
    const existingMenu = await Menu.findOne({
      name: payload.name,
      restaurant_id: currentMenu.restaurant_id,
      is_active: true,
      _id: { $ne: id },
    });

    if (existingMenu) {
      throw new Error('A menu category with this name already exists');
    }
  }

  const updatedMenu = await Menu.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  return serializeMenu(updatedMenu);
};

export const deleteMenuRecord = async (id) => {
  const menu = await Menu.findById(id);
  if (!menu) throw new Error('Menu No encontrado');

  const items = await MenuItem.find({ menu_id: id });
  for (const item of items) {
    if (item.image_url && item.image_url.includes('cloudinary.com')) {
      await deleteImage(item.image_url);
    }
  }

  await MenuItem.deleteMany({ menu_id: id });
  await Menu.findByIdAndDelete(id);

  return serializeMenu(menu);
};

export const fetchMenuItems = async ({ menu_id, restaurant_id, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const filter = { is_active: true };

  if (menu_id) filter.menu_id = menu_id;
  if (restaurant_id) filter.restaurant_id = restaurant_id;

  const items = await MenuItem.find(filter).sort({ name: 1 }).skip(skip).limit(limit);
  const total = await MenuItem.countDocuments(filter);

  return {
    items: items.map(serializeMenuItem),
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const fetchMenuItemById = async (id) => {
  const item = await MenuItem.findById(id);
  return item ? serializeMenuItem(item) : null;
};

export const createMenuItemRecord = async ({ itemData, file }) => {
  const menu = await Menu.findById(itemData.menu_id);
  if (!menu) throw new Error('Menu No encontrado');

  const restaurant = await Restaurant.findById(itemData.restaurant_id);
  if (!restaurant) throw new Error('Restaurante no encontrado');

  let imageUrl = null;
  if (file) {
    let normalizedPath = file.path.replace(/\\/g, '/');
    if (!path.isAbsolute(normalizedPath)) {
      normalizedPath = path.resolve(normalizedPath).replace(/\\/g, '/');
    }
    const ext = path.extname(file.originalname);
    const randomHex = crypto.randomBytes(6).toString('hex');
    const cloudinaryFileName = `menuitem-${randomHex}${ext}`;
    imageUrl = await uploadImage(normalizedPath, cloudinaryFileName);
  }

  const item = await MenuItem.create(normalizeMenuItemPayload(itemData, imageUrl));
  return serializeMenuItem(item);
};

export const updateMenuItemRecord = async ({ id, updateData, file }) => {
  const currentItem = await MenuItem.findById(id);
  if (!currentItem) throw new Error('Menu item No encontrado');

  let imageUrl = null;
  if (file) {
    let normalizedPath = file.path.replace(/\\/g, '/');
    if (!path.isAbsolute(normalizedPath)) {
      normalizedPath = path.resolve(normalizedPath).replace(/\\/g, '/');
    }
    const ext = path.extname(file.originalname);
    const randomHex = crypto.randomBytes(6).toString('hex');
    const cloudinaryFileName = `menuitem-${randomHex}${ext}`;
    imageUrl = await uploadImage(normalizedPath, cloudinaryFileName);
  }

  const payload = normalizeMenuItemPayload(updateData, imageUrl);
  delete payload.menu_id;
  delete payload.restaurant_id;

  if (imageUrl && currentItem.image_url && currentItem.image_url.includes('cloudinary.com')) {
    await deleteImage(currentItem.image_url);
  }

  const updatedItem = await MenuItem.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  return serializeMenuItem(updatedItem);
};

export const deleteMenuItemRecord = async (id) => {
  const item = await MenuItem.findById(id);
  if (!item) throw new Error('Menu item No encontrado');

  // Borrar imagen de Cloudinary si existe
  if (item.image_url && item.image_url.includes('cloudinary.com')) {
    await deleteImage(item.image_url);
  }

  await MenuItem.findByIdAndDelete(id);
  return serializeMenuItem(item);
};

export const toggleMenuItemAvailabilityRecord = async (id) => {
  const item = await MenuItem.findById(id);
  if (!item) throw new Error('Menu item No encontrado');

  item.is_available = !item.is_available;
  await item.save();

  return serializeMenuItem(item);
};