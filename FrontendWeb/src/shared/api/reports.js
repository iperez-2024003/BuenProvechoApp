import { pedidosApi as api } from './axios';

export const getDailySummaryReport = (restaurantId) => api.get(`/reports/daily-summary/${restaurantId}`);

// Archivo binario, se descarga por URL directa.
export const downloadDailyExcelUrl = (restaurantId) => `${api.defaults.baseURL}/reports/daily-excel/${restaurantId}`;
