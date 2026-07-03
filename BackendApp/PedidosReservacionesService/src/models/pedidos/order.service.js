'use strict';

import PDFDocument from 'pdfkit';
import Order from './order.model.js';
import OrderItem from './order-item.model.js';
import Restaurant from '../restaurantes/restaurant.model.js';
import MenuItem from '../menus/menu-item.model.js';

const TAX_RATE = 0.12;

const serializeOrder = (order, items = []) => {
  if (!order) return null;
  const data = typeof order.toObject === 'function' ? order.toObject() : order;
  return {
    id: data._id?.toString?.() || data._id,
    order_number: data.order_number,
    restaurant_id: data.restaurant_id,
    user_id: data.user_id,
    customer_name: data.customer_name,
    status: data.status,
    order_type: data.order_type,
    subtotal: data.subtotal,
    tax: data.tax,
    discount: data.discount,
    tip: data.tip,
    total: data.total,
    payment_method: data.payment_method,
    payment_status: data.payment_status,
    notes: data.notes,
    delivery_address: data.delivery_address,
    delivery_fee: data.delivery_fee,
    completed_at: data.completed_at,
    items,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const serializeOrderItem = (item) => {
  if (!item) return null;
  const data = typeof item.toObject === 'function' ? item.toObject() : item;
  return {
    id: data._id?.toString?.() || data._id,
    order_id: data.order_id,
    menu_item_id: data.menu_item_id,
    quantity: data.quantity,
    unit_price: data.unit_price,
    subtotal: data.subtotal,
    special_instructions: data.special_instructions,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const calculateTotals = (subtotal, discount = 0, deliveryFee = 0, tip = 0) => {
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax + deliveryFee + tip;
  return { tax: Number(tax.toFixed(2)), total: Number(total.toFixed(2)) };
};

const generateOrderNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${dateStr}-`;
  const lastOrder = await Order.findOne({ order_number: new RegExp(`^${prefix}`) }).sort({ createdAt: -1 });
  const sequence = lastOrder?.order_number ? Number(lastOrder.order_number.split('-')[2]) + 1 : 1;
  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

const loadOrderWithItems = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return null;
  const items = await OrderItem.find({ order_id: orderId });
  const enrichedItems = await Promise.all(items.map(async (item) => {
    const menuItem = await MenuItem.findById(item.menu_item_id).lean();
    return {
      ...serializeOrderItem(item),
      MenuItem: menuItem ? {
        id: menuItem._id.toString(),
        name: menuItem.name,
        price: menuItem.price
      } : null
    };
  }));
  return serializeOrder(order, enrichedItems);
};

export const createOrderRecord = async (payload) => {
  const restaurant = await Restaurant.findById(payload.restaurant_id);
  if (!restaurant || restaurant.isActive === false) {
    throw new Error('Restaurante no encontrado');
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('La orden debe contener al menos un artículo');
  }

  if (payload.order_type === 'delivery' && restaurant.acceptsDelivery === false) {
    throw new Error('Este restaurante no ofrece servicio a domicilio');
  }

  if (payload.order_type === 'takeout' && restaurant.acceptsTakeout === false) {
    throw new Error('Este restaurante no ofrece para llevar');
  }

  let subtotal = 0;
  const orderItems = [];
  // Usar operaciones atómicas para decrementar stock y evitar condiciones de carrera.
  const decremented = [];
  for (const item of payload.items) {
    // Intentar decrementar atómicamente
    const updatedMenuItem = await MenuItem.findOneAndUpdate(
      {
        _id: item.menu_item_id,
        restaurant_id: payload.restaurant_id,
        is_active: true,
        is_available: true,
        stock_quantity: { $gte: Number(item.quantity) },
      },
      { $inc: { stock_quantity: -Number(item.quantity) } },
      { new: true }
    ).lean();

    if (!updatedMenuItem) {
      // Rollback de decrementos previos
      for (const d of decremented) {
        try {
          await MenuItem.findByIdAndUpdate(d.menu_item_id, { $inc: { stock_quantity: d.quantity } });
        } catch (err) {
          console.error('Rollback stock failed for', d.menu_item_id, err.message);
        }
      }
      throw new Error(`Inventario insuficiente o platillo no disponible para id ${item.menu_item_id}`);
    }

    decremented.push({ menu_item_id: String(item.menu_item_id), quantity: Number(item.quantity) });

    const itemSubtotal = Number(updatedMenuItem.price) * Number(item.quantity);
    subtotal += itemSubtotal;

    orderItems.push({
      menu_item_id: String(item.menu_item_id),
      quantity: Number(item.quantity),
      unit_price: Number(updatedMenuItem.price),
      subtotal: Number(itemSubtotal.toFixed(2)),
      special_instructions: item.special_instructions || null,
    });
  }

  const { tax, total } = calculateTotals(subtotal, 0, payload.delivery_fee || 0, 0);

  const order = await Order.create({
    order_number: await generateOrderNumber(),
    restaurant_id: payload.restaurant_id,
    user_id: payload.user_id,
    customer_name: payload.customer_name,
    status: 'pending',
    order_type: payload.order_type || 'dine_in',
    subtotal: Number(subtotal.toFixed(2)),
    tax,
    discount: 0,
    tip: 0,
    total,
    payment_method: 'pending',
    payment_status: 'pending',
    notes: payload.notes,
    delivery_address: payload.order_type === 'delivery' ? payload.delivery_address : null,
    delivery_fee: payload.order_type === 'delivery' ? Number(payload.delivery_fee || 0) : 0,
  });

  const createdItems = await OrderItem.insertMany(orderItems.map((item) => ({ ...item, order_id: String(order._id) })));
  
  // Enriquecer los items con detalles del MenuItem para el retorno inmediato
  const enrichedItems = await Promise.all(createdItems.map(async (item) => {
    const menuItem = await MenuItem.findById(item.menu_item_id).lean();
    return {
      ...serializeOrderItem(item),
      MenuItem: menuItem ? {
        id: menuItem._id.toString(),
        name: menuItem.name,
        price: menuItem.price,
        image_url: menuItem.image_url
      } : null
    };
  }));

  return serializeOrder(order, enrichedItems);
};

export const fetchOrders = async ({ restaurant_id, user_id, status, order_type, payment_status, page = 1, limit = 20 }) => {
  const filter = {};
  if (restaurant_id) filter.restaurant_id = restaurant_id;
  if (user_id) filter.user_id = user_id;
  if (status) filter.status = status;
  if (order_type) filter.order_type = order_type;
  if (payment_status) filter.payment_status = payment_status;

  const skip = (page - 1) * limit;
  const orders = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Order.countDocuments(filter);
  const withItems = await Promise.all(orders.map(async (order) => {
    const items = await OrderItem.find({ order_id: String(order._id) });
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const menuItem = await MenuItem.findById(item.menu_item_id).lean();
      return {
        ...serializeOrderItem(item),
        MenuItem: menuItem ? {
          id: menuItem._id.toString(),
          name: menuItem.name,
          price: menuItem.price,
          image_url: menuItem.image_url
        } : null
      };
    }));
    return serializeOrder(order, enrichedItems);
  }));

  return {
    orders: withItems,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const fetchOrderById = async (id) => loadOrderWithItems(id);

export const updateOrderStatusRecord = async ({ id, status }) => {
  const order = await Order.findById(id);
  if (!order) throw new Error('Orden no encontrada');

  const validTransitions = {
    pending: ['confirmed', 'preparing', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['served', 'cancelled'],
    served: ['paid'],
    paid: [],
    cancelled: [],
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw new Error(`Cannot transition from ${order.status} to ${status}`);
  }

  const updateData = { status };
  if (status === 'paid') {
    updateData.completed_at = new Date();
    updateData.payment_status = 'paid';
  }

  const updated = await Order.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  return serializeOrder(updated, (await OrderItem.find({ order_id: String(updated._id) })).map(serializeOrderItem));
};

export const cancelOrderRecord = async (id) => {
  const order = await Order.findById(id);
  if (!order) throw new Error('Orden no encontrada');

  if (['paid', 'cancelled'].includes(order.status)) {
    throw new Error(`No se puede cancelar orden con estado: ${order.status}`);
  }

  const items = await OrderItem.find({ order_id: String(order._id) });
  for (const item of items) {
    // Restaurar stock de forma atómica
    await MenuItem.findByIdAndUpdate(item.menu_item_id, { $inc: { stock_quantity: Number(item.quantity) } });
  }

  const updated = await Order.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true, runValidators: true });
  return serializeOrder(updated, items.map(serializeOrderItem));
};

export const addItemToOrderRecord = async ({ orderId, menu_item_id, quantity, special_instructions }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Orden no encontrada');
  if (!['pending', 'confirmed'].includes(order.status)) throw new Error('Cannot add items to order in current status');

  // Decremento atómico del stock para evitar race conditions
  const updatedMenuItem = await MenuItem.findOneAndUpdate(
    { _id: menu_item_id, restaurant_id: order.restaurant_id, is_active: true, is_available: true, stock_quantity: { $gte: Number(quantity) } },
    { $inc: { stock_quantity: -Number(quantity) } },
    { new: true }
  ).lean();

  if (!updatedMenuItem) throw new Error('Inventario insuficiente o platillo no disponible');

  const itemSubtotal = Number(updatedMenuItem.price) * Number(quantity);
  const orderItem = await OrderItem.create({
    order_id: String(order._id),
    menu_item_id,
    quantity: Number(quantity),
    unit_price: Number(updatedMenuItem.price),
    subtotal: Number(itemSubtotal.toFixed(2)),
    special_instructions,
  });

  const newSubtotal = Number(order.subtotal) + itemSubtotal;
  const { tax, total } = calculateTotals(newSubtotal, Number(order.discount), Number(order.delivery_fee), Number(order.tip));
  await Order.findByIdAndUpdate(orderId, { subtotal: newSubtotal, tax, total }, { new: true });

  return serializeOrderItem(orderItem);
};

export const removeItemFromOrderRecord = async ({ orderId, itemId }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Orden no encontrada');
  if (!['pending', 'confirmed'].includes(order.status)) throw new Error('Cannot remove items from order in current status');

  const orderItem = await OrderItem.findOne({ _id: itemId, order_id: String(order._id) });
  if (!orderItem) throw new Error('Order No encontrado');

  // Restaurar stock atómicamente
  await MenuItem.findByIdAndUpdate(orderItem.menu_item_id, { $inc: { stock_quantity: Number(orderItem.quantity) } });

  await OrderItem.findByIdAndDelete(itemId);
  const newSubtotal = Math.max(0, Number(order.subtotal) - Number(orderItem.subtotal));
  const { tax, total } = calculateTotals(newSubtotal, Number(order.discount), Number(order.delivery_fee), Number(order.tip));
  await Order.findByIdAndUpdate(orderId, { subtotal: newSubtotal, tax, total }, { new: true });
  return true;
};

export const fetchKitchenOrders = async (restaurantId) => {
  const orders = await Order.find({ 
    restaurant_id: restaurantId, 
    status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] } 
  }).sort({ createdAt: 1 });

  const withItems = await Promise.all(orders.map(async (order) => {
    const items = await OrderItem.find({ order_id: String(order._id) });
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const menuItem = await MenuItem.findById(item.menu_item_id).lean();
      return {
        ...serializeOrderItem(item),
        MenuItem: menuItem ? {
          id: menuItem._id.toString(),
          name: menuItem.name,
          price: menuItem.price
        } : null
      };
    }));
    return serializeOrder(order, enrichedItems);
  }));
  return withItems;
};

export const buildOrderPdf = async (orderId) => {
  const order = await fetchOrderById(orderId);
  if (!order) throw new Error('Orden no encontrada');

  const restaurant = await Restaurant.findById(order.restaurant_id);
  const doc = new PDFDocument({ margin: 50 });

  return { doc, order, restaurant: restaurant ? (restaurant.toObject ? restaurant.toObject() : restaurant) : null };
};