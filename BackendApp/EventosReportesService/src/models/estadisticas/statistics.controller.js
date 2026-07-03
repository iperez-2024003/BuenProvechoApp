'use strict';

import ExcelJS from 'exceljs';
import Restaurant from '../restaurantes/restaurant.model.js';
import Order from '../pedidos/order.model.js';
import OrderItem from '../pedidos/order-item.model.js';
import Reservation from '../reservaciones/reservation.model.js';
import Event from '../eventos/event.model.js';
import MenuItem from '../menus/menu-item.model.js';
import { User } from '../../helpers/auth-user.helper.js';

const roundMoney = (value) => Number.parseFloat(Number(value || 0).toFixed(2));

const getDateRange = (period) => {
  const dateFilter = new Date();

  if (period === 'week') {
    dateFilter.setDate(dateFilter.getDate() - 7);
  } else if (period === 'month') {
    dateFilter.setMonth(dateFilter.getMonth() - 1);
  } else if (period === 'year') {
    dateFilter.setFullYear(dateFilter.getFullYear() - 1);
  }

  return dateFilter;
};

const getTodayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getRestaurantOverview = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id).lean();

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }

    const { start, end } = getTodayBounds();

    const [
      todayOrders, 
      todayRevenueAgg, 
      todayReservations, 
      totalOrders, 
      totalRevenueAgg,
      activeOrdersCount,
      staffCount,
      recentStaff
    ] = await Promise.all([
      Order.countDocuments({ 
        restaurant_id: id, 
        status: { $ne: 'cancelled' },
        createdAt: { $gte: start, $lte: end } 
      }),
      Order.aggregate([
        { 
          $match: { 
            restaurant_id: id, 
            status: { $in: ['confirmed', 'preparing', 'ready', 'served', 'paid'] },
            createdAt: { $gte: start, $lte: end } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Reservation.countDocuments({ restaurant_id: id, createdAt: { $gte: start, $lte: end } }),
      Order.countDocuments({ restaurant_id: id, status: { $ne: 'cancelled' } }),
      Order.aggregate([
        { 
          $match: { 
            restaurant_id: id, 
            status: { $in: ['confirmed', 'preparing', 'ready', 'served', 'paid'] }
          } 
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ 
        restaurant_id: id, 
        status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] } 
      }),
      User.countByRestaurant(id),
      User.findByRestaurant(id, 5)
    ]);

    const todayRevenue = todayRevenueAgg[0]?.total || 0;
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    return res.status(200).json({
      success: true,
      message: 'Datos del restaurante obtenidos exitosamente',
      data: {
        basic_info: {
          id: restaurant._id,
          name: restaurant.name,
          rating: restaurant.rating,
          category: restaurant.category,
        },
        summary: {
          tables: todayReservations,
          dishes: 0,
          staff: staffCount,
          today_revenue: roundMoney(todayRevenue),
          today_orders: todayOrders,
          active_orders: activeOrdersCount
        },
        today: {
          orders: activeOrdersCount, 
          total_today: todayOrders,
          revenue: roundMoney(todayRevenue),
          reservations: todayReservations,
        },
        all_time: {
          total_orders: totalOrders,
          total_revenue: roundMoney(totalRevenue),
        },
        recentStaff: staffCount > 0 ? recentStaff : []
      },
    });
  } catch (error) {
    console.error('Error in getRestaurantOverview:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getOrdersStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'month' } = req.query;
    const dateFilter = getDateRange(period);

    const data = await Order.aggregate([
      { $match: { restaurant_id: id, createdAt: { $gte: dateFilter } } },
      {
        $project: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $toDouble: '$total' },
        },
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Estadísticas de órdenes obtenidas exitosamente',
      data: {
        period,
        stats: data,
      },
    });
  } catch (error) {
    console.error('Error in getOrdersStats:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getPopularDishes = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const popularDishes = await OrderItem.aggregate([
      {
        $lookup: {
          from: 'order',
          localField: 'order_id',
          foreignField: '_id',
          as: 'order',
        },
      },
      { $unwind: '$order' },
      { $match: { 'order.restaurant_id': id } },
      {
        $lookup: {
          from: 'menu_item',
          localField: 'menu_item_id',
          foreignField: '_id',
          as: 'menu_item',
        },
      },
      { $unwind: '$menu_item' },
      {
        $group: {
          _id: '$menu_item_id',
          name: { $first: '$menu_item.name' },
          description: { $first: '$menu_item.description' },
          price: { $first: '$menu_item.price' },
          order_count: { $sum: 1 },
          total_quantity: { $sum: '$quantity' },
          total_revenue: { $sum: '$subtotal' },
        },
      },
      { $sort: { total_quantity: -1, order_count: -1 } },
      { $limit: Number.parseInt(limit, 10) },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Platos populares obtenidos exitosamente',
      data: popularDishes,
    });
  } catch (error) {
    console.error('Error in getPopularDishes:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getPlatformSummary = async (req, res) => {
  try {
    const [totalRestaurants, totalOrders, totalRevenueAgg, totalReservations, totalEvents, topRestaurants] = await Promise.all([
      Restaurant.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { payment_status: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Reservation.countDocuments(),
      Event.countDocuments({ isActive: true }),
      Restaurant.find({ isActive: true }).sort({ rating: -1 }).limit(5).select('_id name rating category totalReviews').lean(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Resumen de plataforma obtenido exitosamente',
      data: {
        total_restaurants: totalRestaurants,
        total_orders: totalOrders,
        total_revenue: roundMoney(totalRevenueAgg[0]?.total),
        total_reservations: totalReservations,
        total_events: totalEvents,
        top_restaurants: topRestaurants.map((restaurant) => ({
          id: restaurant._id,
          name: restaurant.name,
          rating: restaurant.rating,
          category: restaurant.category,
          total_reviews: restaurant.totalReviews,
        })),
      },
    });
  } catch (error) {
    console.error('Error in getPlatformSummary:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getGlobalStats = async (req, res) => {
  try {
    const [totalRestaurants, totalUsers, totalOrdersAgg, totalRevenueAgg, topRestaurantsAgg] = await Promise.all([
      Restaurant.countDocuments(),
      User.count().catch(() => 0), // Fallback if Postgres is down
      Order.countDocuments(),
      Order.aggregate([{ $match: { payment_status: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { payment_status: 'paid' } },
        {
          $group: {
            _id: '$restaurant_id',
            revenue: { $sum: '$total' },
            orders_count: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Populate restaurant details for topRestaurants
    const topRestaurants = await Promise.all(
      topRestaurantsAgg.map(async (stat) => {
        const restaurant = await Restaurant.findById(stat._id).lean();
        return {
          Restaurant: {
            id: restaurant ? restaurant._id.toString() : 'Desconocido',
            name: restaurant ? restaurant.name : 'Sede Desconocida',
          },
          revenue: roundMoney(stat.revenue),
          orders_count: stat.orders_count,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Estadísticas globales obtenidas exitosamente',
      data: {
        totalRestaurants,
        totalUsers,
        totalOrders: totalOrdersAgg,
        totalRevenue: roundMoney(totalRevenueAgg[0]?.total),
        topRestaurants,
      },
    });
  } catch (error) {
    console.error('Error in getGlobalStats:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
export const getPeakHours = async (req, res) => {
  try {
    const { id } = req.params;

    const peakHours = await Order.aggregate([
      { $match: { restaurant_id: id } },
      {
        $project: {
          hour: { $hour: '$createdAt' },
        },
      },
      {
        $group: {
          _id: '$hour',
          order_count: { $sum: 1 },
        },
      },
      { $sort: { order_count: -1, _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Horas pico obtenidas exitosamente',
      data: peakHours.map((entry) => ({ hour: entry._id, order_count: entry.order_count })),
    });
  } catch (error) {
    console.error('Error in getPeakHours:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getFrequentCustomers = async (req, res) => {
  try {
    const { id } = req.params;

    const customers = await Order.aggregate([
      { $match: { restaurant_id: id, status: { $ne: 'cancelled' }, user_id: { $ne: null } } },
      {
        $group: {
          _id: '$user_id',
          total_orders: { $sum: 1 },
          total_spent: { $sum: '$total' },
        },
      },
      { $sort: { total_orders: -1, total_spent: -1 } },
      { $limit: 10 },
    ]);

    const enrichedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const user = await User.findByPk(customer._id);
        return {
          id: customer._id,
          total_orders: customer.total_orders,
          total_spent: roundMoney(customer.total_spent),
          user: user
            ? {
                id: user.id,
                username: user.username,
                email: user.email,
              }
            : null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Clientes frecuentes obtenidos exitosamente',
      data: enrichedCustomers,
    });
  } catch (error) {
    console.error('Error in getFrequentCustomers:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const exportOrdersToExcel = async (req, res) => {
  try {
    const { id } = req.params;

    const orders = await Order.find({ restaurant_id: id }).sort({ createdAt: -1 }).limit(1000).lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ventas');

    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 20 },
      { header: 'Número de Orden', key: 'orderNumber', width: 25 },
      { header: 'Cliente', key: 'customer', width: 25 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Subtotal (Q)', key: 'subtotal', width: 15 },
      { header: 'Total (Q)', key: 'total', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6B8' },
    };

    for (const order of orders) {
      let customerName = order.customer_name || 'N/A';

      if (order.user_id) {
        const user = await User.findByPk(order.user_id);
        customerName = order.customer_name || user?.username || user?.email || 'N/A';
      }

      worksheet.addRow({
        date: new Date(order.createdAt).toLocaleString(),
        orderNumber: order.order_number,
        customer: customerName,
        type: order.order_type,
        status: order.status,
        subtotal: roundMoney(order.subtotal),
        total: roundMoney(order.total),
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=ventas_${id}.xlsx`);

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    console.error('Error in exportOrdersToExcel:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getGlobalVipClients = async (req, res) => {
  try {
    const vipClients = await Order.aggregate([
      { $match: { user_id: { $ne: null }, status: { $ne: 'cancelled' }, payment_status: 'paid' } },
      {
        $group: {
          _id: '$user_id',
          total_orders: { $sum: 1 },
          total_spent: { $sum: '$total' },
        },
      },
      { $sort: { total_spent: -1, total_orders: -1 } },
      { $limit: 10 },
    ]);

    const enrichedVipClients = await Promise.all(
      vipClients.map(async (client) => {
        const user = await User.findByPk(client._id);
        return {
          id: client._id,
          total_orders: client.total_orders,
          total_spent: roundMoney(client.total_spent),
          user: user
            ? {
                id: user.id,
                username: user.username,
                email: user.email,
              }
            : null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Clientes VIP globales obtenidos exitosamente',
      data: enrichedVipClients,
    });
  } catch (error) {
    console.error('Error in getGlobalVipClients:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
