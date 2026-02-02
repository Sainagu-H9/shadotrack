
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', variant = 'light' }) => {
  return (
    <div className={`
      ${variant === 'light' ? 'glass' : 'glass-dark'} 
      rounded-3xl p-6 transition-all duration-300 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default GlassCard;
