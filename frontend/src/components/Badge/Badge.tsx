import React, { ReactNode } from 'react';

interface BadgeProps {
  children?: ReactNode;
  text?: string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  text,
  color,
  className = '',
  style = {},
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'bg-transparent border border-gray-300 text-gray-700',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800'
  };

  // If color is provided, use it as background color
  const customStyle = color ? {
    ...style,
    backgroundColor: color,
    color: '#ffffff' // Use white text for colored backgrounds
  } : style;

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      style={customStyle}
    >
      {text || children}
    </span>
  );
};
