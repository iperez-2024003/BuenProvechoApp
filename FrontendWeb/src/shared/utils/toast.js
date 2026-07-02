import { toast } from 'react-hot-toast';

const baseStyle = {
  borderRadius: '10px',
  fontWeight: 600,
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  padding: '14px 20px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
};

export const showSuccess = (message) =>
  toast.success(message || 'Operación exitosa', {
    style: {
      ...baseStyle,
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      color: '#fff',
    },
    iconTheme: { primary: '#fff', secondary: '#22c55e' },
    duration: 3500,
  });

export const showError = (message) =>
  toast.error(message || 'Ocurrió un error', {
    style: {
      ...baseStyle,
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff',
    },
    iconTheme: { primary: '#fff', secondary: '#ef4444' },
    duration: 4500,
  });

export const showInfo = (message) =>
  toast(message || 'Información', {
    style: {
      ...baseStyle,
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      color: '#fff',
    },
    icon: 'ℹ️',
    duration: 3500,
  });

export const showWarning = (message) =>
  toast(message || 'Atención', {
    style: {
      ...baseStyle,
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#fff',
    },
    icon: '⚠️',
    duration: 4000,
  });
