import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  variant?: 'horizontal' | 'vertical';
  iconSize?: string;
  textSize?: string;
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'horizontal', 
  iconSize = 'w-10 h-10', 
  textSize = 'text-2xl',
  className,
  iconOnly = false
}) => {
  return (
    <div className={cn(
      "flex items-center gap-3",
      variant === 'vertical' && "flex-col text-center",
      className
    )}>
      <div className={cn(
        "bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20",
        iconSize
      )}>
        <MapPin className={cn(
          "text-white",
          iconSize.includes('w-16') ? "w-8 h-8" : 
          iconSize.includes('w-10') ? "w-5 h-5" : "w-4 h-4"
        )} />
      </div>
      {!iconOnly && (
        <span className={cn(
          "font-black tracking-wide uppercase bg-gradient-to-r from-[#1D4ED8] to-[#60A5FA] bg-clip-text text-transparent",
          textSize
        )}>
          FixMyCity
        </span>
      )}
    </div>
  );
};
