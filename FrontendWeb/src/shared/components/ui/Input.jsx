import React from 'react';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';

export const Input = ({ label, icon: Icon, error, className = '', inputClassName = '', simple: manualSimple, ...props }) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const { role } = useAuthStore();
  
  // Automáticamente simple si es un rol administrativo, a menos que se pase manualSimple
  const isSimple = manualSimple !== undefined ? manualSimple : (role && role !== 'CLIENT_ROLE');

  return (
    <div className={`flex flex-col ${isSimple ? 'gap-1.5' : 'gap-2'} ${className}`}>
      {label && (
        <label className={`${isSimple ? 'text-[9px]' : 'text-[11px]'} font-black uppercase ${isSimple ? 'tracking-widest' : 'tracking-[0.3em]'} text-[#1c1712] ml-1`}>
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 ${isSimple ? 'w-4 h-4' : 'w-5 h-5'} text-[#1c1712] group-focus-within:text-[#b98c52] transition-colors z-10`} />
        )}
        <input
          className={`
            w-full ${Icon ? (isSimple ? 'pl-10' : 'pl-12') : 'px-5'} ${isSimple ? 'py-2.5' : 'py-4'} rounded-xl
            bg-white ${isSimple ? 'border-2' : 'border-4'} border-[#1c1712] text-[#1c1712] ${isSimple ? 'text-xs' : 'text-sm'} font-black
            placeholder:text-zinc-400 placeholder:font-bold
            focus:outline-none focus:shadow-[${isSimple ? '4px_4px' : '6px_6px'}_0px_#b98c52]
            transition-all duration-200
            ${errorMessage ? 'border-red-600 bg-red-50' : ''}
            ${inputClassName}
          `}
          {...props}
        />
      </div>
      {errorMessage && <span className="text-[9px] font-black uppercase tracking-widest text-red-600 ml-1 mt-1">{errorMessage}</span>}
    </div>
  );
};
