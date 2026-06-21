'use strict';

import {
  createTableRecord,
  fetchTables,
  fetchTableById,
  updateTableRecord,
  deleteTableRecord,
  updateTableStatusRecord,
  fetchAvailableTables,
} from './table.service.js';

export const createTable = async (req, res) => {
  try {
    const table = await createTableRecord(req.body);
    return res.status(201).json({ success: true, message: 'Creado exitosamente', data: table });
  } catch (error) {
    return res.status(error.message === 'Restaurante no encontrado' ? 404 : 409).json({ success: false, message: error.message });
  }
};

export const getAllTables = async (req, res) => {
  try {
    const { restaurant_id, status, location, page = 1, limit = 20 } = req.query;
    const { tables, pagination } = await fetchTables({ restaurant_id, status, location, page, limit });
    return res.status(200).json({ success: true, message: 'Datos obtenidos exitosamente', pagination, data: tables });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getTableById = async (req, res) => {
  try {
    const table = await fetchTableById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'No encontrado' });
    return res.status(200).json({ success: true, message: 'Datos obtenidos exitosamente', data: table });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const updateTable = async (req, res) => {
  try {
    const table = await updateTableRecord({ id: req.params.id, updateData: req.body });
    return res.status(200).json({ success: true, message: 'Mesa actualizada exitosamente', data: table });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 409).json({ success: false, message: error.message });
  }
};

export const deleteTable = async (req, res) => {
  try {
    await deleteTableRecord(req.params.id);
    return res.status(200).json({ success: true, message: 'Mesa eliminada permanentemente' });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const updateTableStatus = async (req, res) => {
  try {
    const table = await updateTableStatusRecord({ id: req.params.id, status: req.body.status });
    return res.status(200).json({ success: true, message: `Estado de la mesa actualizado a ${req.body.status}`, data: table });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const getAvailableTables = async (req, res) => {
  try {
    const tables = await fetchAvailableTables(req.query);
    return res.status(200).json({ success: true, message: 'Available Datos obtenidos exitosamente', count: tables.length, data: tables });
  } catch (error) {
    return res.status(error.message === 'Restaurant ID is required' ? 400 : 500).json({ success: false, message: error.message });
  }
};