export const getImageUrl = (url) => {
  if (!url) return null;
  // Si ya es una URL completa (http/https) o base64, devolver tal cual
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  
  // Normalizar las barras invertidas de Windows a barras normales para la URL
  const normalizedUrl = url.replace(/\\/g, '/');
  
  // Usar la URL base de la API del entorno o por defecto localhost
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3005';
  
  // Asegurarnos de que no haya doble barra
  const cleanUrl = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
  
  return `${baseUrl}${cleanUrl}`;
};
