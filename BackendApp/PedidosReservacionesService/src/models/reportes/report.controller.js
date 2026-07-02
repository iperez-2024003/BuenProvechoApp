 'use strict';

import Order from '../pedidos/order.model.js';
import OrderItem from '../pedidos/order-item.model.js';
import MenuItem from '../menus/menu-item.model.js';
import Restaurant from '../restaurantes/restaurant.model.js';
import { User } from '../../helpers/auth-user.helper.js';
import { generateInvoiceHTML, generateDailySummaryHTML } from './report.service.js';
import { sendHtmlEmail } from '../../../helpers/email-service.js';
import { asyncHandler } from '../../../middlewares/server-genericError-handler.js';
import ExcelJS from 'exceljs';

/**
 * Envía la factura de una orden al correo del cliente
 */
export const sendOrderInvoice = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

    const items = await OrderItem.find({ order_id: orderId }).lean();
    // attach menu items
    const itemsWithMenu = await Promise.all(items.map(async (it) => {
        const menu = await MenuItem.findById(it.menu_item_id).lean();
        return { ...it, menu_item: menu };
    }));

    const restaurant = await Restaurant.findById(order.restaurant_id).lean();
    const user = order.user_id ? await User.findByPk(order.user_id) : null;
    const html = generateInvoiceHTML({ ...order, items: itemsWithMenu }, restaurant, user);
    const emailToSend = (user && (user.Email || user.email)) || order.customer_email;

    if (emailToSend) {
        await sendHtmlEmail(emailToSend, `Factura de tu pedido ${order.order_number} - ${restaurant ? restaurant.name : ''}`, html);
    }

    return res.status(200).json({ success: true, message: `Factura enviada exitosamente a ${emailToSend || 'N/A'}` });
});

/**
 * Genera un reporte de ventas diario y lo envía al administrador
 */
export const getDailyReport = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });

    const orders = await Order.find({ restaurant_id: restaurantId, createdAt: { $gte: today }, status: { $ne: 'cancelled' } }).lean();

    const stats = {
        totalOrders: orders.length,
        totalSales: orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0),
        dineInCount: orders.filter(o => o.order_type === 'dine_in').length,
        takeoutCount: orders.filter(o => o.order_type === 'takeout').length,
        deliveryCount: orders.filter(o => o.order_type === 'delivery').length
    };

    const html = generateDailySummaryHTML(restaurant, stats);
    const user = await User.findByPk(req.userId);
    const userEmail = user && (user.Email || user.email);
    if (userEmail) await sendHtmlEmail(userEmail, `Reporte Diario de Ventas - ${restaurant.name}`, html);

    return res.status(200).json({ success: true, message: 'Reporte generado y enviado exitosamente', data: stats });
});

/**
 * Descarga de reporte Excel
 */
export const downloadDailyExcelReport = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });

    const orders = await Order.find({ restaurant_id: restaurantId, createdAt: { $gte: today }, status: { $ne: 'cancelled' } }).lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Diario');

    worksheet.columns = [
        { header: 'No. Orden', key: 'order_number', width: 25 },
        { header: 'Cliente', key: 'customer', width: 30 },
        { header: 'Tipo', key: 'type', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Subtotal', key: 'subtotal', width: 15 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Fecha', key: 'date', width: 25 }
    ];

    for (const o of orders) {
        const user = o.user_id ? await User.findByPk(o.user_id) : null;
        worksheet.addRow({
            order_number: o.order_number,
            customer: o.customer_name || (user ? (user.Username || user.username) : 'N/A'),
            type: o.order_type,
            status: o.status,
            subtotal: o.subtotal,
            total: o.total,
            date: new Date(o.createdAt || o.created_at).toLocaleString()
        });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Reporte_${restaurant.name}_${new Date().toISOString().slice(0, 10)}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
});
