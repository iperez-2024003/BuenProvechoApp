import { useState } from 'react';

/**
 * Hook personalizado para manejar estado y validación de formularios
 * @param {Object} initialState Estado inicial del formulario
 * @param {Object} validationRules Reglas de validación por campo
 */
export const useFormValidation = (initialState, validationRules) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setValues((prev) => ({ ...prev, [name]: finalValue }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    for (const key in validationRules) {
      const rules = validationRules[key];
      const value = values[key];

      if (rules.required && (!value || value.toString().trim() === '')) {
        newErrors[key] = rules.message || 'Este campo es requerido';
        isValid = false;
        continue;
      }

      if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[key] = rules.message || 'Formato inválido';
        isValid = false;
      }

      if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[key] = rules.message || `Mínimo ${rules.minLength} caracteres`;
        isValid = false;
      }

      if (rules.match && value !== values[rules.match]) {
        newErrors[key] = rules.message || 'Los valores no coinciden';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setValues(initialState);
    setErrors({});
  };

  return { values, errors, handleChange, validate, resetForm, setValues, setErrors };
};
