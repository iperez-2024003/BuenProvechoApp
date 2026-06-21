import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useEffect } from 'react';
import { showWarning } from '../../shared/utils/toast';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuthStore();
  const unauthorized = Boolean(allowedRoles && !allowedRoles.includes(role));

  // Mostrar aviso solo como efecto secundario (evita setState durante render)
  useEffect(() => {
    if (unauthorized && role && role !== 'CLIENT_ROLE') {
      try { showWarning('No tienes permisos para acceder a esta sección'); } catch (e) { /* noop */ }
    }
  }, [unauthorized, role]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (unauthorized) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};
