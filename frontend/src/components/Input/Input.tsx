import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, fullWidth = false, type = 'text', ...props }, ref) => {
    const baseStyles = 'rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
    const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
    const widthStyles = fullWidth ? 'w-full' : '';
    
   
    const colorStyles = type === 'color' ? 'h-10 p-1 cursor-pointer' : '';
    
    return (
      <input
        ref={ref}
        type={type}
        className={`${baseStyles} ${errorStyles} ${widthStyles} ${colorStyles} ${className}`}
        {...props}
      />
    );
  }
);
