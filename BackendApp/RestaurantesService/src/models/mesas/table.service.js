'use strict';

import Table from './table.model.js';
import Restaurant from '../restaurantes/restaurant.model.js';

const serializeTable = (table) => {
  if (!table) return null;
  const data = typeof table.toObject === 'function' ? table.toObject() : table;
  return {
    id: data._id?.toString?.() || data._id,
    table_number: data.table_number,
    capacity: data.capacity,
    location: data.location,
    floor: data.floor,
    status: data.status,
    restaurant_id: data.restaurant_id,
    is_active: data.is_active,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const normalizeTablePayload = (payload = {}) => ({
  table_number: payload.table_number !== undefined ? Number(payload.table_number) : undefined,
  capacity: payload.capacity !== undefined ? Number(payload.capacity) : undefined,
  location: payload.location,
  floor: payload.floor !== undefined ? Number(payload.floor) : 1,
  status: payload.status,
  restaurant_id: payload.restaurant_id,
  is_active: payload.is_active ?? true,
});

export const createTableRecord = async (payload) => {
  const restaurant = await Restaurant.findById(payload.restaurant_id);
  if (!restaurant || restaurant.isActive === false) {
    throw new Error('Restaurante no encontrado');
  }

  const existingTable = await Table.findOne({
    table_number: payload.table_number,
    restaurant_id: payload.restaurant_id,
    is_active: true,
  });

  if (existingTable) {
    throw new Error('Table number already exists in this restaurant');
  }

  const table = await Table.create(normalizeTablePayload(payload));
  return serializeTable(table);
};

export const fetchTables = async ({ restaurant_id, status, location, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const filter = { is_active: true };
  if (restaurant_id) filter.restaurant_id = restaurant_id;
  if (status) filter.status = status;
  if (location) filter.location = location;

  const tables = await Table.find(filter).sort({ table_number: 1 }).skip(skip).limit(limit);
  const total = await Table.countDocuments(filter);

  return {
    tables: tables.map(serializeTable),
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const fetchTableById = async (id) => {
  const table = await Table.findById(id);
  return table ? serializeTable(table) : null;
};

export const updateTableRecord = async ({ id, updateData }) => {
  const table = await Table.findById(id);
  if (!table) throw new Error('No encontrado');

  if (updateData.table_number && Number(updateData.table_number) !== table.table_number) {
    const existingTable = await Table.findOne({
      table_number: Number(updateData.table_number),
      restaurant_id: table.restaurant_id,
      is_active: true,
      _id: { $ne: id },
    });

    if (existingTable) {
      throw new Error('Table number already exists');
    }
  }

  const payload = normalizeTablePayload(updateData);
  delete payload.restaurant_id;

  const updatedTable = await Table.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  return serializeTable(updatedTable);
};

export const deleteTableRecord = async (id) => {
  const table = await Table.findByIdAndDelete(id);
  if (!table) throw new Error('No encontrado');
  return serializeTable(table);
};

export const updateTableStatusRecord = async ({ id, status }) => {
  const table = await Table.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!table) throw new Error('No encontrado');
  return serializeTable(table);
};

export const fetchAvailableTables = async ({ restaurant_id, capacity, location }) => {
  if (!restaurant_id) throw new Error('Restaurant ID is required');

  const filter = {
    restaurant_id,
    status: 'available',
    is_active: true,
  };

  if (capacity) filter.capacity = { $gte: Number(capacity) };
  if (location) filter.location = location;

  const tables = await Table.find(filter).sort({ table_number: 1 });

  return tables.map(serializeTable);
};