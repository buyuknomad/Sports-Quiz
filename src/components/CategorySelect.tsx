// Enhanced category selection component with back button and animations
import React, { useEffect } from 'react';
import { Trophy, Target, Circle, Medal, Dumbbell, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOneVsOneStore } from '../store/oneVsOneStore';
import type { Category, GameMode } from '../types';

interface CategorySelectProps {
  onSelect: (category: Category) => void;
  onCategorySelected?: (category: Category) => void;
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
  onCategorySelected,
  mode,
  onBack 
}) => {
  const { hasJoinedGame, getCurrentPlayer } = useOneVsOneStore();
  const currentPlayer = getCurrentPlayer();
  const isHost = currentPlayer?.isHost;

  useEffect(() => {
    if (mode !== 'solo' && hasJoinedGame) {
      if (!isHost) {
        console.log('Non-host player in category selection, redirecting to lobby');
        onSelect('mixed');
        if (onCategorySelected) onCategorySelected('mixed');
      }
    }
  }, [mode, hasJoinedGame, isHost, onSelect, onCategorySelected]);

  if (mode !== 'solo' && hasJoinedGame && !isHost) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
    console.log(`Selected category: ${category} for mode: ${mode}`);
    
    if (mode !== 'solo' && hasJoinedGame && !isHost) {
      console.log('Non-host attempted to select category, redirecting');
      onSelect('mixed');
      if (onCategorySelected) onCategorySelected('mixed');
      return;
    }
    
    onSelect(category);
    if (onCategorySelected) onCategorySelected(category);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 
                   rounded-lg text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Modes</span>
      </motion.button>

      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            Choose Your Category
          </h1>
          <p className="text-gray-400 text-center mb-12">
            {mode === 'solo' ? 'Practice mode - Test your knowledge!' : 'Challenge a friend in this category!'}
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map(({ id, name, emoji, icon: Icon, color }) => (
            <motion.button
              key={id}
              variants={item}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategorySelect(id as Category)}
              className={`group relative bg-gray-800 rounded-2xl p-8 overflow-hidden`}
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />
              
              <div className="flex flex-col items-center gap-4 relative z-10">
                <motion.div
                  variants={iconAnimation}
                  whileHover="hover"
                  className={`w-16 h-16 flex items-center justify-center bg-gradient-to-br ${color} rounded-full`}
                >
                  <Icon size={32} className="text-white" />
                </motion.div>
                
                <div className="text-center">
                  <motion.h2 
                    className="text-2xl font-bold text-white flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>{name}</span>
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-3xl"
                    >
                      {emoji}
                    </motion.span>
                  </motion.h2>
                  <p className="mt-2 text-gray-400 text-sm">
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
  );
};