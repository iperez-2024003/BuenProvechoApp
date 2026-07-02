'use strict';

import PDFDocument from 'pdfkit';
import {
  createOrderRecord,
  fetchOrders,
  fetchOrderById,
  updateOrderStatusRecord,
  cancelOrderRecord,
  addItemToOrderRecord,
  removeItemFromOrderRecord,
  fetchKitchenOrders,
} from './order.service.js';
import Restaurant from '../restaurantes/restaurant.model.js';
import { getIo } from '../../socket/socket.config.js';

export const createOrder = async (req, res) => {
  try {
    const order = await createOrderRecord(req.body);
    
    // Emitir socket para tiempo real
    const io = getIo();
    io.to(`restaurant_${order.restaurant_id}`).emit('new_order', order);
    
    return res.status(201).json({ success: true, message: 'Orden creada exitosamente', data: order });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { restaurant_id, user_id, status, order_type, payment_status, page = 1, limit = 20 } = req.query;
    const { orders, pagination } = await fetchOrders({ restaurant_id, user_id, status, order_type, payment_status, page, limit });
    return res.status(200).json({ success: true, message: 'Órdenes obtenidas exitosamente', pagination, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await fetchOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    return res.status(200).json({ success: true, message: 'Orden obtenida exitosamente', data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await updateOrderStatusRecord({ id: req.params.id, status: req.body.status });
    
    // Emitir socket para tiempo real
    const io = getIo();
    io.to(`restaurant_${order.restaurant_id}`).emit('order_status_updated', {
      orderId: order.id,
      status: order.status,
      orderNumber: order.order_number
    });
    
    return res.status(200).json({ success: true, message: `Order status updated to ${req.body.status}`, data: order });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    await cancelOrderRecord(req.params.id);
    return res.status(200).json({ success: true, message: 'Orden cancelada exitosamente' });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const addItemToOrder = async (req, res) => {
  try {
    const orderItem = await addItemToOrderRecord({ orderId: req.params.id, ...req.body });
    return res.status(201).json({ success: true, message: 'Item added to order successfully', data: orderItem });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const removeItemFromOrder = async (req, res) => {
  try {
    await removeItemFromOrderRecord({ orderId: req.params.id, itemId: req.params.itemId });
    return res.status(200).json({ success: true, message: 'Item removed from order successfully' });
  } catch (error) {
    return res.status(error.message === 'Orden no encontrada' || error.message === 'Order No encontrado' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const generateOrderPDF = async (req, res) => {
  try {
    const order = await fetchOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

    const restaurant = await Restaurant.findById(order.restaurant_id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Ticket_${order.order_number}.pdf`);

    // Ticket format (300pt width is roughly 105mm, good for a narrow ticket look)
    const doc = new PDFDocument({ 
      margin: 30, 
      size: [300, 841] // Custom height, will auto-adjust or be long enough
    });
    doc.pipe(res);

    const formatMoney = (value) => `Q${Number(value || 0).toFixed(2)}`;
    const orderNumber = order.order_number?.split('-').pop() || order.order_number || '0000';
    
    const logoSource = restaurant?.logoUrl || restaurant?.logo_url;
    const pageWidth = doc.page.width;
    const leftMargin = 30;
    const contentWidth = pageWidth - leftMargin * 2;

    const colors = {
      primary: '#1c1712',
      secondary: '#4b5563',
      accent: '#b98c52',
      border: '#1c1712'
    };

    // 1. HEADER (Logo & Restaurant Info Centered)
    let currentY = 30;

    if (logoSource) {
      try {
        const response = await fetch(logoSource);
        const buffer = Buffer.from(await response.arrayBuffer());
        doc.image(buffer, (pageWidth - 60) / 2, currentY, { fit: [60, 60] });
        currentY += 70;
      } catch (err) {
        console.error('Error loading logo for PDF:', err.message);
      }
    }

    doc.fillColor(colors.primary).fontSize(16).font('Helvetica-Bold').text(restaurant?.name?.toUpperCase() || 'BUENPROVECHO', leftMargin, currentY, { width: contentWidth, align: 'center' });
    currentY += 20;
    
    doc.fillColor(colors.secondary).fontSize(8).font('Helvetica').text(restaurant?.address || 'Ciudad de Guatemala', leftMargin, currentY, { width: contentWidth, align: 'center' });
    currentY += 12;
    doc.text(`Tel: ${restaurant?.phone || 'N/A'}`, leftMargin, currentY, { width: contentWidth, align: 'center' });
    currentY += 25;

    // Order Meta
    doc.fillColor(colors.primary).fontSize(8).font('Helvetica-Bold').text(`FECHA: ${new Date(order.createdAt).toLocaleDateString('es-GT')}`, leftMargin, currentY);
    doc.text(`HORA: ${new Date(order.createdAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - leftMargin - 80, currentY, { align: 'right' });
    currentY += 12;
    doc.text(`TICKET: #${orderNumber}`, leftMargin, currentY);
    currentY += 20;

    // Divider
    doc.moveTo(leftMargin, currentY).lineTo(pageWidth - leftMargin, currentY).strokeColor(colors.border).lineWidth(1.5).stroke();
    currentY += 15;

    // 2. TABLE HEADERS
    doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.primary);
    doc.text('CANT', leftMargin, currentY);
    doc.text('DESCRIPCIÓN', leftMargin + 40, currentY);
    doc.text('PRECIO', pageWidth - leftMargin - 60, currentY, { width: 60, align: 'right' });
    currentY += 15;

    // 3. ITEMS
    doc.font('Helvetica').fontSize(9);
    order.items.forEach((item) => {
      const itemY = currentY;
      doc.text(String(item.quantity), leftMargin, itemY);
      doc.text(item.MenuItem?.name || 'Artículo', leftMargin + 40, itemY, { width: 140 });
      doc.text(formatMoney(item.subtotal), pageWidth - leftMargin - 60, itemY, { width: 60, align: 'right' });
      
      const lines = doc.heightOfString(item.MenuItem?.name || 'Artículo', { width: 140 });
      currentY += Math.max(lines + 5, 15);
    });

    currentY += 10;
    doc.moveTo(leftMargin, currentY).lineTo(pageWidth - leftMargin, currentY).strokeColor(colors.border).dash(2, { space: 2 }).stroke();
    doc.undash();
    currentY += 20;

    // 4. TOTALS
    doc.fontSize(8).font('Helvetica').fillColor(colors.secondary);
    doc.text('SUBTOTAL:', leftMargin, currentY);
    doc.text(formatMoney(order.subtotal), pageWidth - leftMargin - 100, currentY, { width: 100, align: 'right' });
    currentY += 12;

    doc.text('IVA (12%):', leftMargin, currentY);
    doc.text(formatMoney(order.tax), pageWidth - leftMargin - 100, currentY, { width: 100, align: 'right' });
    currentY += 12;

    if (order.delivery_fee > 0) {
      doc.text('ENVÍO:', leftMargin, currentY);
      doc.text(formatMoney(order.delivery_fee), pageWidth - leftMargin - 100, currentY, { width: 100, align: 'right' });
      currentY += 12;
    }

    currentY += 10;
    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primary);
    doc.text('TOTAL:', leftMargin, currentY);
    doc.fontSize(14).text(formatMoney(order.total), pageWidth - leftMargin - 100, currentY - 4, { width: 100, align: 'right' });
    currentY += 40;

    // 5. FOOTER
    doc.fontSize(8).font('Helvetica-Bold').text('¡GRACIAS POR TU COMPRA!', leftMargin, currentY, { width: contentWidth, align: 'center' });
    currentY += 12;
    doc.font('Helvetica').text('BuenProvecho Premium Experience', leftMargin, currentY, { width: contentWidth, align: 'center' });

    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getKitchenOrders = async (req, res) => {
  try {
    const orders = await fetchKitchenOrders(req.params.restaurantId);
    return res.status(200).json({ success: true, message: 'Órdenes obtenidas exitosamente', data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};