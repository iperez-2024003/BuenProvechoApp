import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, DownloadCloud } from 'lucide-react';
import { exportOrdersExcelUrl } from '../../../shared/api/statistics';
import { downloadDailyExcelUrl, getDailySummaryReport } from '../../../shared/api/reports';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { showError, showSuccess } from '../../../shared/utils/toast';

const ExportAnalytics = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const handleExport = async () => {
    if (!restaurantId) {
      showError('Ingresa un ID de restaurante');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(exportOrdersExcelUrl(restaurantId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo generar el Excel');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Export_Orders_${restaurantId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showSuccess('Exportado correctamente');
    } catch (err) {
      console.error(err);
      showError('Error exportando Excel');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDaily = async () => {
    if (!restaurantId) {
      showError('Ingresa un ID de restaurante');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(downloadDailyExcelUrl(restaurantId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo descargar el Excel diario');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Daily_Report_${restaurantId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showSuccess('Descargado correctamente');
    } catch (err) {
      console.error(err);
      showError('Error descargando Excel diario');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSummary = async () => {
    if (!restaurantId) {
      showError('Ingresa un ID de restaurante');
      return;
    }
    try {
      setLoading(true);
      const res = await getDailySummaryReport(restaurantId);
      showSuccess(res?.data?.message || 'Resumen enviado');
    } catch (err) {
      console.error(err);
      showError('Error enviando resumen diario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto bg-white/80 p-8 rounded-3xl border border-[#dcc7a5]/10">
        <h2 className="text-2xl font-black mb-4">Exportar Estadísticas (Excel)</h2>
        <p className="text-sm text-zinc-600 mb-4">Introduce el ID de la sede y utiliza las opciones para generar o descargar reportes Excel.</p>
        <div className="flex gap-3 mb-4">
          <input value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} placeholder="restaurant id" className="flex-1 px-4 py-3 border rounded-lg" />
          <button onClick={() => navigate('/dashboard')} className="px-4 py-3 border rounded-lg">Volver</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={handleExport} disabled={loading} className="px-4 py-3 bg-[#f3e4ca] rounded-2xl font-black"> <DownloadCloud className="inline-block mr-2"/> Exportar Auditoría</button>
          <button onClick={handleSendSummary} disabled={loading} className="px-4 py-3 bg-[#eaf4f1] rounded-2xl font-black"> <FileSpreadsheet className="inline-block mr-2"/> Enviar Resumen</button>
          <button onClick={handleDownloadDaily} disabled={loading} className="px-4 py-3 bg-[#f4eefc] rounded-2xl font-black"> <FileSpreadsheet className="inline-block mr-2"/> Descargar Excel Diario</button>
        </div>
      </div>
    </div>
  );
};

export default ExportAnalytics;
