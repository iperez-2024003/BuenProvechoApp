'use strict';

import {
  fetchMenus,
  fetchMenuById,
  createMenuRecord,
  updateMenuRecord,
  deleteMenuRecord,
  fetchMenuItems,
  fetchMenuItemById,
  createMenuItemRecord,
  updateMenuItemRecord,
  deleteMenuItemRecord,
  toggleMenuItemAvailabilityRecord,
} from './menu.service.js';

export const createMenu = async (req, res) => {
  try {
    const menu = await createMenuRecord({ menuData: req.body });
    return res.status(201).json({ success: true, message: 'Menu Creado exitosamente', data: menu });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllMenus = async (req, res) => {
  try {
    const { restaurant_id, page = 1, limit = 20 } = req.query;
    const { menus, pagination } = await fetchMenus({ restaurant_id, page, limit });
    return res.status(200).json({ success: true, message: 'Menu Datos obtenidos exitosamente', pagination, data: menus });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getMenuById = async (req, res) => {
  try {
    const menu = await fetchMenuById(req.params.id);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu No encontrado' });
    }

    return res.status(200).json({ success: true, message: 'Menu Datos obtenidos exitosamente', data: menu });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const menu = await updateMenuRecord({ id: req.params.id, updateData: req.body });
    return res.status(200).json({ success: true, message: 'Menu Actualizado exitosamente', data: menu });
  } catch (error) {
    return res.status(error.message === 'Menu No encontrado' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    await deleteMenuRecord(req.params.id);
    return res.status(200).json({ success: true, message: 'Categoría de menú eliminada permanentemente' });
  } catch (error) {
    return res.status(error.message === 'Menu No encontrado' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const item = await createMenuItemRecord({ itemData: req.body, file: req.file });
    return res.status(201).json({ success: true, message: 'Menu item creado exitosamente', data: item });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllMenuItems = async (req, res) => {
  try {
    const { menu_id, restaurant_id, page = 1, limit = 20 } = req.query;
    const { items, pagination } = await fetchMenuItems({ menu_id, restaurant_id, page, limit });
    return res.status(200).json({ success: true, message: 'Menu items obtenidos exitosamente', pagination, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getMenuItemById = async (req, res) => {
  try {
    const item = await fetchMenuItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item No encontrado' });
    }

    return res.status(200).json({ success: true, message: 'Menu item obtenido exitosamente', data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const item = await updateMenuItemRecord({ id: req.params.id, updateData: req.body, file: req.file });
    return res.status(200).json({ success: true, message: 'Menu item actualizado exitosamente', data: item });
  } catch (error) {
    return res.status(error.message === 'Menu item No encontrado' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    await deleteMenuItemRecord(req.params.id);
    return res.status(200).json({ success: true, message: 'Menu item eliminado permanentemente' });
  } catch (error) {
    return res.status(error.message === 'Menu item No encontrado' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const toggleMenuItemAvailability = async (req, res) => {
  try {
    const item = await toggleMenuItemAvailabilityRecord(req.params.id);
    return res.status(200).json({ success: true, message: 'Disponibilidad actualizada', data: item });
  } catch (error) {
    return res.status(error.message === 'Menu item No encontrado' ? 404 : 500).json({ success: false, message: error.message });
  }
};