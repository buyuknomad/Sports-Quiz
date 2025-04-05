import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface NavigationButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
  delay?: number;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  icon: IconComponent,
  label,
  onClick,
  disabled = false,
  tooltip,
  delay = 0
}) => {
  return (
    <div className="relative group">
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-colors
                   ${disabled 
                     ? 'bg-gray-800/50 cursor-not-allowed text-gray-500 opacity-70' 
                     : 'bg-gray-800/90 hover:bg-gray-700 text-white'}`}
      >
        <IconComponent className={`w-5 h-5 ${!disabled ? 'group-hover:-translate-x-1 transition-transform' : ''}`} />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{label.split(' ').pop()}</span>
      </motion.button>
      
      {tooltip && disabled && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded text-xs text-white
                      opacity-0 group-hover:opacity-100 transition-opacity w-48 z-50">
          {tooltip}
        </div>
      )}
    </div>
  );
};