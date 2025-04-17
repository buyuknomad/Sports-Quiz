// Enhanced category selection component with nav bar, back button, animations and footer
import React, { useEffect, useState } from 'react';
import { Trophy, Target, Circle, Medal, Dumbbell, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOneVsOneStore } from '../store/oneVsOneStore';
import type { Category, GameMode } from '../types';
import { NavigationButton } from './navigation';
import { NAVIGATION_LABELS } from '../constants/navigation';
import EnhancedNavBar from './layout/EnhancedNavBar';
// Import Footer component
import Footer from './layout/Footer';

interface CategorySelectProps {
  onSelect: (category: Category) => void;
  mode: GameMode;
  onBack?: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const iconAnimation = {
  hover: {
    scale: 1.2,
    rotate: 360,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

export const CategorySelect: React.FC<CategorySelectProps> = ({ 
  onSelect, 
  mode,
  onBack 
}) => {
  const { hasJoinedGame, getCurrentPlayer } = useOneVsOneStore();
  const currentPlayer = getCurrentPlayer();
  const isHost = currentPlayer?.isHost;
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (mode !== 'solo' && hasJoinedGame) {
      if (!isHost) {
        console.log('Non-host player in category selection, redirecting to lobby');
        onSelect('mixed');
      }
    }
  }, [mode, hasJoinedGame, isHost, onSelect]);

  if (mode !== 'solo' && hasJoinedGame && !isHost) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0c1220] to-[#1a1a2e]">
        {/* Added EnhancedNavBar */}
        <EnhancedNavBar variant="minimal" position="float" />
        
        <div className="flex-grow flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-gray-800 rounded-2xl p-8 text-center"
          >
            <h1 className="text-2xl font-bold text-white mb-4">
              Joining game...
            </h1>
            <p className="text-gray-400 mb-6">
              You'll be redirected to the lobby shortly
            </p>
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 bg-green-600 rounded-full"
            />
          </motion.div>
        </div>
        
        <Footer />
      </div>
    );
  }

  const categories = [
    { id: 'football', name: 'Football', emoji: '⚽', icon: Trophy, color: 'from-yellow-600 to-yellow-400' },
    { id: 'basketball', name: 'Basketball', emoji: '🏀', icon: Target, color: 'from-orange-600 to-orange-400' },
    { id: 'tennis', name: 'Tennis', emoji: '🎾', icon: Circle, color: 'from-green-600 to-green-400' },
    { id: 'olympics', name: 'Olympics', emoji: '🏅', icon: Medal, color: 'from-blue-600 to-blue-400' },
    { id: 'mixed', name: 'Mixed Sports', emoji: '🎯', icon: Dumbbell, color: 'from-purple-600 to-purple-400' },
  ] as const;

  const handleCategorySelect = (category: Category) => {
    // Prevent multiple selections
    if (isSelecting) {
      console.log('Selection already in progress, ignoring');
      return;
    }
    
    setIsSelecting(true);
    console.log(`Selected category: ${category} for mode: ${mode}`);
    
    if (mode !== 'solo' && hasJoinedGame && !isHost) {
      console.log('Non-host attempted to select category, redirecting');
      onSelect(category);
      
      // Reset selection state after a delay
      setTimeout(() => {
        setIsSelecting(false);
      }, 1000);
      
      return;
    }
    
    // Call only onSelect
    onSelect(category);
    
    // Reset selection state after a delay
    setTimeout(() => {
      setIsSelecting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0c1220] to-[#1a1a2e]">
      {/* Add EnhancedNavBar */}
      <EnhancedNavBar variant="minimal" position="top-right" />

      {/* Back button to mode selection */}
      {onBack && (
        <div className="fixed bottom-6 left-6 z-10">
          <NavigationButton
            icon={ArrowLeft}
            label={NAVIGATION_LABELS.MODES}
            onClick={onBack}
          />
        </div>
      )}
      
      <div className="flex-grow flex flex-col items-center justify-center p-4 pb-20">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-2 sm:mb-4">
              Choose Your Category
            </h1>
            <p className="text-gray-400 text-center text-sm sm:text-base mb-6 sm:mb-12">
              {mode === 'solo' ? 'Practice mode - Test your knowledge!' : 'Challenge a friend in this category!'}
            </p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {categories.map(({ id, name, emoji, icon: Icon, color }) => (
              <motion.button
                key={id}
                variants={item}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategorySelect(id as Category)}
                disabled={isSelecting}
                className={`group relative bg-gray-800 rounded-2xl p-6 sm:p-8 overflow-hidden ${isSelecting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                
                <div className="flex flex-col items-center gap-3 sm:gap-4 relative z-10">
                  <motion.div
                    variants={iconAnimation}
                    whileHover="hover"
                    className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-gradient-to-br ${color} rounded-full`}
                  >
                    <Icon size={24} className="text-white sm:hidden" />
                    <Icon size={32} className="text-white hidden sm:block" />
                  </motion.div>
                  
                  <div className="text-center">
                    <motion.h2 
                      className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span>{name}</span>
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-2xl sm:text-3xl"
                      >
                        {emoji}
                      </motion.span>
                    </motion.h2>
                    <p className="mt-2 text-gray-400 text-xs sm:text-sm">
                      Test your {name.toLowerCase()} knowledge
                    </p>
                  </div>
                </div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${color}`}
                />
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Add Footer component */}
      <Footer />
      
      {/* Background animated sport icons - similar to welcome page */}
      {['⚽', '🏀', '🎾', '🏈', '⚾', '🏆', '🥇', '🏅'].map((icon, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl opacity-5 pointer-events-none"
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: -100 
          }}
          animate={{ 
            y: window.innerHeight + 100,
            rotate: [0, 180, 360], 
            x: `calc(${Math.random() * 100}vw)`
          }}
          transition={{ 
            duration: 20 + Math.random() * 15, 
            repeat: Infinity, 
            delay: Math.random() * 5,
            ease: "linear"
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>
  );
};

export default CategorySelect;
