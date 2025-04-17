// src/components/layout/EnhancedNavBar.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthNavBar from '../auth/AuthNavBar';

interface EnhancedNavBarProps {
  variant?: 'default' | 'compact' | 'minimal';
  position?: 'top-right' | 'top' | 'float';
  showOnScroll?: boolean;
}

export const EnhancedNavBar: React.FC<EnhancedNavBarProps> = ({
  variant = 'default',
  position = 'top-right',
  showOnScroll = false
}) => {
  const [visible, setVisible] = useState(!showOnScroll);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll behavior if showOnScroll is enabled
  useEffect(() => {
    if (!showOnScroll) {
      setVisible(true);
      return;
    }

    const handleScroll = () => {
      // Show navbar when scrolling up, hide when scrolling down
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setVisible(true);
      } else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showOnScroll, lastScrollY]);

  // Position classes based on props
  const positionClasses = {
    'top-right': 'fixed top-4 right-4',
    'top': 'fixed top-0 left-0 right-0 py-2 px-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/50',
    'float': 'fixed top-4 right-4 opacity-70 hover:opacity-100 transition-opacity duration-300'
  };

  return (
    <motion.div 
      className={`z-50 ${positionClasses[position]}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ 
        y: visible ? 0 : -20, 
        opacity: visible ? 1 : 0,
        transition: { duration: 0.3 }
      }}
    >
      <AuthNavBar variant={variant} />
    </motion.div>
  );
};

export default EnhancedNavBar;
