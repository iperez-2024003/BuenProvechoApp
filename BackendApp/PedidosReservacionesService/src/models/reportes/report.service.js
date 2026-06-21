'use strict';

/**
 * Genera el HTML para una factura elegante
 */
export const generateInvoiceHTML = (order, restaurant, user) => {
    const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.menu_item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.unit_price).toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.subtotal).toFixed(2)}</td>
    </tr>
  `).join('');

    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; color: #333;">
      <div style="text-align: center; border-bottom: 2px solid #f8f9fa; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="margin: 0; color: #2c3e50;">${restaurant.name}</h1>
        <p style="margin: 5px 0; color: #7f8c8d;">${restaurant.address || 'Guate, ciudad'}</p>
        <p style="margin: 5px 0; color: #7f8c8d;">Tel: ${restaurant.phone || 'N/A'}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Factura: ${order.order_number}</h3>
        <p><strong>Cliente:</strong> ${order.customer_name || user.username}</p>
        <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString()}</p>
        <p><strong>Tipo:</strong> ${order.order_type.toUpperCase()}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left;">Producto</th>
            <th style="padding: 10px; text-align: center;">Cant.</th>
            <th style="padding: 10px; text-align: right;">Precio</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; line-height: 1.6;">
        <p style="margin: 0;">Subtotal: <strong>$${parseFloat(order.subtotal).toFixed(2)}</strong></p>
        <p style="margin: 0;">IVA (12%): <strong>$${parseFloat(order.tax).toFixed(2)}</strong></p>
        ${parseFloat(order.delivery_fee) > 0 ? `<p style="margin: 0;">Envío: <strong>$${parseFloat(order.delivery_fee).toFixed(2)}</strong></p>` : ''}
        <h2 style="color: #27ae60; margin-top: 10px;">Total a Pagar: $${parseFloat(order.total).toFixed(2)}</h2>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #95a5a6;">
        <p>¡Gracias por tu preferencia!</p>
        <p>Sistema de Gestión de Restaurantes - Facturación Electrónica</p>
      </div>
    </div>
  `;
};

/**
 * Genera el HTML para un reporte diario de ventas
 */
export const generateDailySummaryHTML = (restaurant, stats) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 25px; border-radius: 8px;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Reporte Diario de Ventas</h2>
      <p style="font-size: 16px;"><strong>Restaurante:</strong> ${restaurant.name}</p>
      <p><strong>Fecha del Reporte:</strong> ${new Date().toLocaleDateString()}</p>
      
      <div style="display: flex; justify-content: space-around; background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <div style="text-align: center;">
          <p style="margin: 0; color: #7f8c8d;">Total Órdenes</p>
          <h2 style="margin: 5px 0;">${stats.totalOrders}</h2>
        </div>
        <div style="text-align: center;">
          <p style="margin: 0; color: #7f8c8d;">Venta Total</p>
          <h2 style="margin: 5px 0; color: #2ecc71;">$${parseFloat(stats.totalSales).toFixed(2)}</h2>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <h3 style="color: #34495e;">Resumen por Tipo:</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">Dine-in: ${stats.dineInCount || 0}</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">Takeout: ${stats.takeoutCount || 0}</li>
          <li style="padding: 8px 0;">Delivery: ${stats.deliveryCount || 0}</li>
        </ul>
      </div>

      <p style="margin-top: 30px; font-style: italic; color: #7f8c8d; text-align: center;">
        Generado automáticamente por el módulo de reportes.
      </p>
    </div>
  `;
};
