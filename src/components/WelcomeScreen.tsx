import React, { useState } from 'react';
import { Trophy, Swords, Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define GameMode type directly in component
type GameMode = 'solo' | '1v1' | 'multiplayer';

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
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [showSoloDetails, setShowSoloDetails] = useState(false);
  const [show1v1Details, setShow1v1Details] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    
    // Add a small delay before starting the game to show selection
    setTimeout(() => {
      if (!username) {
        console.error('Username not found');
        return;
      }
      onStart(username, mode);
    }, 300);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-[#0c1220] to-[#1a1a2e]">
      {/* Game title and logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-4"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl">🏆</span>
          <h1 className="text-3xl font-bold text-white">
            <span className="text-blue-400">Sport</span>
            <span className="text-white">IQ</span>
          </h1>
          <span className="text-3xl">🧠</span>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-4"
      >
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
      </motion.div>
      
      {/* How It Works Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => setShowHowItWorks(!showHowItWorks)}
        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 mb-4 text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Info size={16} />
        <span>{showHowItWorks ? "Hide Guide" : "How It Works"}</span>
        {showHowItWorks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </motion.button>
      
      {/* How It Works Panel */}
      <AnimatePresence>
        {showHowItWorks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg mb-6 overflow-hidden"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-white font-bold mb-2">How To Play</h3>
              <ol className="space-y-2 list-decimal list-inside text-sm text-gray-300 mb-4">
                <li>Select your preferred game mode (Solo or 1v1)</li>
                <li>Choose a sports category that interests you</li>
                <li>Answer 10 questions as quickly and accurately as possible</li>
                <li>Earn 10 points for each correct answer plus time bonuses</li>
                <li>View your performance stats and challenge others to beat your score!</li>
              </ol>
              
              <p className="text-xs text-gray-400 mt-2">
                Both game modes feature the same categories: Football ⚽, Basketball 🏀, Tennis 🎾, Olympics 🏅, and Mixed Sports 🎯
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Game Mode Cards - Side by Side */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
      >
        {/* Solo Mode Card with Expandable Details */}
        <motion.div
          variants={item}
          className="overflow-hidden"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect('solo')}
            className={`w-full group relative bg-gray-800 rounded-t-xl ${!showSoloDetails ? 'rounded-b-xl' : ''} p-6 overflow-hidden text-center ${selectedMode === 'solo' ? 'ring-2 ring-green-400' : ''}`}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            />
            
            <div className="flex flex-col items-center gap-3 sm:gap-4 relative z-10">
              <motion.div
                variants={iconAnimation}
                whileHover="hover"
                className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-green-600 to-green-400 rounded-full mb-2"
              >
                <Trophy size={32} className="text-white" />
              </motion.div>
              
              <motion.h2 
                className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"
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
              <p className="text-gray-400 text-sm">
                Practice at your own pace
              </p>
            </div>
          </motion.button>
          
          {/* Toggle Details Button */}
          <button 
            onClick={() => setShowSoloDetails(!showSoloDetails)}
            className={`w-full flex items-center justify-center p-2 bg-gray-700/60 ${showSoloDetails ? 'rounded-none border-b border-green-400/30' : 'rounded-b-xl'} text-sm text-green-400 hover:bg-gray-700/80 transition-colors`}
          >
            <span className="mr-1">{showSoloDetails ? 'Hide Details' : 'Learn More'}</span>
            {showSoloDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {/* Expandable Details */}
          <AnimatePresence>
            {showSoloDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/80 rounded-b-xl border-t border-gray-700/30 overflow-hidden"
              >
                <div className="p-4 text-left">
                  <p className="text-gray-300 text-sm mb-3">
                    Test your sports knowledge at your own pace. Answer 10 questions across your chosen category and earn points for correct answers. The faster you answer, the more bonus points you receive!
                  </p>
                  <div className="text-xs text-gray-400">
                    <span className="text-green-400 font-medium">Perfect for:</span> Practice, learning new sports facts, and improving your response time.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 1v1 Mode Card with Expandable Details */}
        <motion.div
          variants={item}
          className="overflow-hidden"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect('1v1')}
            className={`w-full group relative bg-gray-800 rounded-t-xl ${!show1v1Details ? 'rounded-b-xl' : ''} p-6 overflow-hidden text-center ${selectedMode === '1v1' ? 'ring-2 ring-blue-400' : ''}`}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            />
            
            <div className="flex flex-col items-center gap-3 sm:gap-4 relative z-10">
              <motion.div
                variants={iconAnimation}
                whileHover="hover"
                className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mb-2"
              >
                <Swords size={32} className="text-white" />
              </motion.div>
              
              <motion.h2 
                className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"
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
              <p className="text-gray-400 text-sm">
                Challenge a friend in real-time
              </p>
            </div>
          </motion.button>
          
          {/* Toggle Details Button */}
          <button 
            onClick={() => setShow1v1Details(!show1v1Details)}
            className={`w-full flex items-center justify-center p-2 bg-gray-700/60 ${show1v1Details ? 'rounded-none border-b border-blue-400/30' : 'rounded-b-xl'} text-sm text-blue-400 hover:bg-gray-700/80 transition-colors`}
          >
            <span className="mr-1">{show1v1Details ? 'Hide Details' : 'Learn More'}</span>
            {show1v1Details ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {/* Expandable Details */}
          <AnimatePresence>
            {show1v1Details && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/80 rounded-b-xl border-t border-gray-700/30 overflow-hidden"
              >
                <div className="p-4 text-left">
                  <p className="text-gray-300 text-sm mb-3">
                    Challenge a friend in real-time competition! Create a game, share the code, and see who has the better sports knowledge. Both players answer the same questions simultaneously.
                  </p>
                  <div className="text-xs text-gray-400">
                    <span className="text-blue-400 font-medium">Perfect for:</span> Competing with friends, proving you're the sports trivia champion, and having fun with in-game chat.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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

export default WelcomeScreen;