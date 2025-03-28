// Enhanced welcome screen component with Framer Motion animations and Swords icon
import React from 'react';
import { Trophy, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GameMode } from '../types';

interface WelcomeScreenProps {
  onStart: (username: string, mode: GameMode) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
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

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const username = localStorage.getItem('username') || '';
  
  const handleModeSelect = (mode: GameMode) => {
    if (!username) {
      console.error('Username not found');
      return;
    }
    onStart(username, mode);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 sm:mb-12"
      >
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          Select Game Mode
        </motion.h1>
        <motion.div
          animate={{ 
            y: [0, -5, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-2xl sm:text-3xl"
        >
          ⚽ 🎾
        </motion.div>
      </motion.div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
      >
        <motion.button
          variants={item}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleModeSelect('solo')}
          className="group relative bg-gray-800 rounded-2xl p-6 sm:p-8 overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          />
          
          <div className="flex flex-col items-center gap-3 sm:gap-4 relative z-10">
            <motion.div
              variants={iconAnimation}
              whileHover="hover"
              className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-gradient-to-br from-green-600 to-green-400 rounded-full"
            >
              <Trophy size={24} className="text-white sm:hidden" />
              <Trophy size={32} className="text-white hidden sm:block" />
            </motion.div>
            
            <div className="text-center">
              <motion.h2 
                className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                Solo Play
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl sm:text-3xl"
                >
                  🏀
                </motion.span>
              </motion.h2>
              <p className="mt-2 text-gray-400 text-xs sm:text-sm">
                Practice mode with no time pressure
              </p>
            </div>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-600 to-green-400"
          />
        </motion.button>

        <motion.button
          variants={item}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleModeSelect('1v1')}
          className="group relative bg-gray-800 rounded-2xl p-6 sm:p-8 overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          />
          
          <div className="flex flex-col items-center gap-3 sm:gap-4 relative z-10">
            <motion.div
              variants={iconAnimation}
              whileHover="hover"
              className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400 rounded-full"
            >
              <Swords size={24} className="text-white sm:hidden" />
              <Swords size={32} className="text-white hidden sm:block" />
            </motion.div>
            
            <div className="text-center">
              <motion.h2 
                className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                1v1 Mode
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl sm:text-3xl"
                >
                  ⚔️
                </motion.span>
              </motion.h2>
              <p className="mt-2 text-gray-400 text-xs sm:text-sm">
                Challenge a friend in real-time
              </p>
            </div>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400"
          />
        </motion.button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 sm:mt-8 text-center"
      >
        <p className="text-gray-400 text-sm sm:text-base">
          Playing as: {' '}
          <motion.span 
            className="text-green-400 font-semibold"
            whileHover={{ scale: 1.1 }}
          >
            {username}
          </motion.span>
        </p>
      </motion.div>
    </div>
  );
};