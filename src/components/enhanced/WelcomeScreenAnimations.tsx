// src/components/enhanced/WelcomeScreenAnimations.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Swords, UserPlus } from 'lucide-react';
import { 
  StaggerContainer, 
  StaggerItem, 
  FadeSlide 
} from '../transitions/PageTransition';

// Enhanced game mode card with animations
export const GameModeCard = ({ 
  mode, 
  title, 
  icon: Icon, 
  emoji, 
  description, 
  onClick, 
  isSelected, 
  primaryColor,
  secondaryColor,
  delay = 0 
}) => {
  return (
    <StaggerItem>
      <motion.div
        className={`relative bg-gray-800 rounded-xl p-6 pb-14 overflow-hidden
                  ${isSelected ? `ring-2 ring-${primaryColor}-400` : ''}`}
        whileHover={{ 
          y: -5,
          boxShadow: `0 10px 25px -5px rgba(${primaryColor === 'blue' ? '59, 130, 246' : primaryColor === 'green' ? '34, 197, 94' : '168, 85, 247'}, 0.25)`
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background gradient hover effect */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br from-${primaryColor}-600 to-${secondaryColor}-400 opacity-0`}
          whileHover={{ opacity: 0.1 }}
          initial={false}
          animate={{ opacity: isSelected ? 0.15 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Card content */}
        <motion.div
          onClick={() => onClick(mode)}
          className="flex flex-col items-center gap-3 relative z-10 cursor-pointer"
        >
          <motion.div
            className={`w-16 h-16 flex items-center justify-center bg-gradient-to-br from-${primaryColor}-600 to-${secondaryColor}-400 rounded-full mb-2`}
            whileHover={{ 
              rotate: 360,
              transition: { duration: 0.8, type: "spring" }
            }}
            animate={isSelected ? { 
              scale: [1, 1.2, 1],
              transition: { duration: 0.5 }
            } : {}}
          >
            <Icon size={32} className="text-white" />
          </motion.div>
          
          <motion.h2 
            className="text-xl font-bold text-white flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            {title}
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: 0.2 * delay
              }}
              className="text-2xl"
            >
              {emoji}
            </motion.span>
          </motion.h2>
          
          <p className="text-gray-400 text-sm mb-2 text-center">
            {description}
          </p>
        </motion.div>
        
        {/* Bottom highlight bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          animate={{ scaleX: isSelected ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-${primaryColor}-400 to-${secondaryColor}-500`}
        />
      </motion.div>
    </StaggerItem>
  );
};

// Animated logo with bouncing effects
export const AnimatedLogo = () => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className="flex items-center justify-center gap-2 mb-6"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, 0, -10, 0],
          scale: [1, 1.1, 1, 1.1, 1]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="text-5xl"
      >
        🏆
      </motion.div>
      
      <motion.h1 
        className="text-5xl font-bold"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.span 
          className="text-blue-400"
          animate={{ 
            color: ['#60a5fa', '#818cf8', '#60a5fa'],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          Sport
        </motion.span>
        <motion.span 
          className="text-white"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          IQ
        </motion.span>
      </motion.h1>
      
      <motion.div
        animate={{ 
          rotate: [0, -10, 0, 10, 0],
          scale: [1, 1.1, 1, 1.1, 1]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5
        }}
        className="text-5xl"
      >
        🧠
      </motion.div>
    </motion.div>
  );
};

// Welcome screen layout with enhanced animations
export const EnhancedWelcomeContent = ({ username, onStart, selectedMode, setSelectedMode }) => {
  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    
    // Add a small delay before continuing to the next screen
    setTimeout(() => {
      onStart(username, mode);
    }, 600);
  };
  
  // Game mode definitions
  const gameModes = [
    {
      mode: 'solo',
      title: 'Solo Play',
      description: 'Practice at your own pace',
      emoji: '🏀',
      icon: Trophy,
      primaryColor: 'green',
      secondaryColor: 'emerald'
    },
    {
      mode: 'create',
      title: 'Create 1v1 Game',
      description: 'Host a game & invite a friend',
      emoji: '⚔️',
      icon: Swords,
      primaryColor: 'blue',
      secondaryColor: 'indigo'
    },
    {
      mode: 'join',
      title: 'Join 1v1 Game',
      description: 'Join with an invite code',
      emoji: '🎮',
      icon: UserPlus,
      primaryColor: 'purple',
      secondaryColor: 'fuchsia'
    }
  ];
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-[#0c1220] to-[#1a1a2e]">
      {/* Animated logo header */}
      <AnimatedLogo />
      
      {/* Animated welcome heading */}
      <FadeSlide direction="up" duration={0.6} className="text-center mb-8">
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2"
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
          className="text-2xl sm:text-3xl mt-2"
        >
          ⚽ 🎾
        </motion.div>
      </FadeSlide>
      
      {/* Game mode cards with staggered animation */}
      <StaggerContainer 
        className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4"
        delay={0.4}
        staggerTime={0.15}
      >
        {gameModes.map((mode, index) => (
          <GameModeCard
            key={mode.mode}
            mode={mode.mode}
            title={mode.title}
            description={mode.description}
            emoji={mode.emoji}
            icon={mode.icon}
            onClick={handleModeSelect}
            isSelected={selectedMode === mode.mode}
            primaryColor={mode.primaryColor}
            secondaryColor={mode.secondaryColor}
            delay={index}
          />
        ))}
      </StaggerContainer>
      
      {/* Username display with animation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-6 sm:mt-8 text-center"
      >
        <p className="text-gray-400 text-sm sm:text-base">
          Playing as: {' '}
          <motion.span 
            className="text-green-400 font-semibold"
            whileHover={{ scale: 1.1 }}
            animate={{ 
              textShadow: ['0 0 0px #22c55e', '0 0 8px #22c55e', '0 0 0px #22c55e'],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {username || 'Guest'}
          </motion.span>
        </p>
      </motion.div>
      
      {/* Background animated sport icons */}
      {['⚽', '🏀', '🎾', '🏈', '⚾', '🏆', '🥇', '🏅'].map((icon, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl opacity-5 pointer-events-none"
          initial={{ 
            x: Math.random() * window.innerWidth, 
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