// Enhanced Home component with refined branding and clearer call-to-action
import React, { useState, useEffect } from 'react';
import { Play, Trophy, Brain, Medal, Award, Zap, Users, Football, Basketball } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeProps {
  onStart: (username: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);

  // Fun sports facts - expanded to 10 interesting facts
  const sportsFacts = [
    "The first Olympic Games were held in Ancient Greece in 776 BC",
    "A regulation NBA basketball hoop is exactly 10 feet (3.05m) high",
    "The longest tennis match lasted 11 hours and 5 minutes at Wimbledon 2010",
    "Soccer balls were originally made from inflated pig bladders",
    "Michael Phelps has won more Olympic medals (28) than 100 countries",
    "The Yankees have won the World Series 27 times—more than any other team",
    "Golf is the only sport that has been played on the moon",
    "The NHL's Stanley Cup has been used as a cereal bowl by players",
    "The average lifespan of an NFL career is just 3.3 years",
    "The most expensive soccer transfer was €222 million for Neymar in 2017"
  ];

  // Cycle through sports facts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % sportsFacts.length);
    }, 6000); // Slightly longer interval for better readability
    
    // Show the logo with a slight delay for better animation sequence
    const timer = setTimeout(() => {
      setShowLogo(true);
    }, 300);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handlePlay = () => {
    if (username.trim().length === 0) {
      setError(true);
      return;
    }
    onStart(username.trim());
  };

  // Sports icons that will animate in the background
  const sportsIcons = ['⚽', '🏀', '🎾', '🏈', '⚾', '🏆', '🥇', '🏅'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1220] to-[#1a1a2e] flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background icons */}
      {sportsIcons.map((icon, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl opacity-5 pointer-events-none"
          initial={{ x: Math.random() * window.innerWidth, y: -100 }}
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

      <div className="w-full max-w-md text-center z-10">
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="text-5xl"
                >
                  🏆
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
                  <span className="text-blue-400">
                    Sport<span className="text-white">IQ</span>
                  </span>
                </h1>
                <motion.div
                  animate={{ rotate: [0, -10, 0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                  className="text-5xl"
                >
                  🧠
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xl text-gray-300 italic">Test Your Sports Knowledge</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            delay: 0.2 
          }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Enter the Quiz Arena
            </h2>
            
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(false);
                  }}
                  className={`w-full p-4 pr-12 text-lg rounded-lg bg-gray-700 text-white placeholder-gray-400 
                          border-2 ${error ? 'border-red-500' : 'border-gray-600'} 
                          focus:border-blue-500 focus:outline-none transition-colors`}
                />
                <Users className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-2 text-left"
                >
                  Please enter a username to continue
                </motion.p>
              )}
            </div>
            
            <motion.button
              onClick={handlePlay}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full p-4 text-xl font-bold rounded-lg bg-blue-600
                      hover:bg-blue-700
                      text-white transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
            >
              <Play size={24} className="fill-white" />
              TEST YOUR SPORTIQ
            </motion.button>
            <p className="text-gray-400 text-xs mt-2">Select game mode on the next screen</p>
          </div>
          
          <motion.div 
            className="grid grid-cols-3 gap-3 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-gray-700/50 p-3 rounded-lg flex flex-col items-center">
              <Trophy size={20} className="text-yellow-400 mb-1" />
              <span className="text-sm text-gray-300">Solo Quiz</span>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg flex flex-col items-center">
              <Users size={20} className="text-blue-400 mb-1" />
              <span className="text-sm text-gray-300">1v1 Duels</span>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg flex flex-col items-center">
              <Medal size={20} className="text-green-400 mb-1" />
              <span className="text-sm text-gray-300">Leaderboard</span>
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-300 text-sm mb-3 font-medium"
          >
            Quiz Categories:
          </motion.p>
          
          <motion.div 
            className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="bg-gray-700/50 p-1 sm:p-2 rounded-lg flex flex-col items-center">
              <span className="text-xl sm:text-2xl">⚽</span>
              <span className="text-[10px] sm:text-xs text-gray-300">Football</span>
            </div>
            <div className="bg-gray-700/50 p-1 sm:p-2 rounded-lg flex flex-col items-center">
              <span className="text-xl sm:text-2xl">🏀</span>
              <span className="text-[10px] sm:text-xs text-gray-300">Basketball</span>
            </div>
            <div className="bg-gray-700/50 p-1 sm:p-2 rounded-lg flex flex-col items-center">
              <span className="text-xl sm:text-2xl">🎾</span>
              <span className="text-[10px] sm:text-xs text-gray-300">Tennis</span>
            </div>
            <div className="bg-gray-700/50 p-1 sm:p-2 rounded-lg flex flex-col items-center">
              <span className="text-xl sm:text-2xl">🏅</span>
              <span className="text-[10px] sm:text-xs text-gray-300">Olympics</span>
            </div>
            <div className="bg-gray-700/50 p-1 sm:p-2 rounded-lg flex flex-col items-center">
              <span className="text-xl sm:text-2xl">🎯</span>
              <span className="text-[10px] sm:text-xs text-gray-300">Mixed</span>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Enhanced Fun Facts with fluid animations - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 bg-gray-800/60 backdrop-blur-sm rounded-xl w-full overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
          
          <div className="p-3 relative">
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0] 
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🔍
              </motion.div>
              <motion.p 
                className="text-blue-400 font-bold text-xs uppercase tracking-wider"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                SPORTS FACT
              </motion.p>
            </div>
            
            <div className="min-h-[3.5em] flex items-center">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={currentFact}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 100, 
                    damping: 12,
                    duration: 0.7
                  }}
                  className="text-gray-300 text-xs sm:text-sm italic break-words"
                >
                  {sportsFacts[currentFact]}
                </motion.p>
              </AnimatePresence>
            </div>
            
            {/* Fact counter dots - Mobile Optimized */}
            <div className="flex justify-center flex-wrap gap-1 mt-2">
              {sportsFacts.slice(0, Math.min(5, sportsFacts.length)).map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1 rounded-full ${index === currentFact % 5 ? 'w-4 bg-blue-400' : 'w-1 bg-gray-600'}`}
                  animate={index === currentFact % 5 ? { 
                    scale: [1, 1.2, 1],
                    backgroundColor: ['#60a5fa', '#818cf8', '#60a5fa']
                  } : {}}
                  transition={{ duration: 2, repeat: index === currentFact % 5 ? Infinity : 0 }}
                />
              ))}
              {sportsFacts.length > 5 && (
                <motion.div 
                  className="h-1 w-4 rounded-full bg-gray-600"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};