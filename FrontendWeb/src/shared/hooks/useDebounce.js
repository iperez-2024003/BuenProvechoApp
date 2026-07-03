import { useState, useEffect } from 'react';

/**
 * Hook personalizado para retrasar la actualización de un valor (ej. búsqueda)
 * y evitar renders o llamadas a la API innecesarias.
 * @param {any} value Valor a retrasar
 * @param {number} delay Tiempo de retraso en milisegundos
 * @returns {any} Valor retrasado
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
