import React, { useState, useEffect } from 'react';
import { Play, Trophy, Brain, Medal, Award, Zap, Users, Info, HelpCircle, ChevronDown, ChevronUp, Swords, MessageCircle, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = ({ onStart }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);
  const [showAboutSection, setShowAboutSection] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

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

  // App features for collapsible section
  const appFeatures = [
    { title: "Multiple Categories", description: "Test your knowledge across Football, Basketball, Tennis, Olympics, and Mixed sports", icon: Trophy },
    { title: "Solo Challenge", description: "Practice at your own pace and improve your sports knowledge", icon: Brain },
    { title: "1v1 Duels", description: "Challenge friends in real-time competitive matches", icon: Swords },
    { title: "Fresh Content", description: "New questions added every day to keep challenges exciting", icon: RefreshCw },
    { title: "Performance Stats", description: "Track your response times and accuracy", icon: Activity }
  ];

  // How to play steps
  const howToPlaySteps = [
    { title: "Enter username", description: "Enter your username to get started" },
    { title: "Choose Game Mode", description: "Select Solo Play or challenge a friend in 1v1 Mode" },
    { title: "Select Category", description: "Pick from Football, Basketball, Tennis, Olympics, or Mixed Sports" },
    { title: "Answer Questions", description: "Test your knowledge with challenging sports trivia" },
    { title: "Earn Points", description: "Get 10 points for correct answers plus speed bonuses" }
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

      <div className="w-full max-w-lg text-center z-10">
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="mb-8"
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

        {/* About Game Section - Collapsible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <motion.button
            onClick={() => setShowAboutSection(!showAboutSection)}
            className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Info size={16} />
            <span>About SportIQ</span>
            {showAboutSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </motion.button>
          
          <AnimatePresence>
            {showAboutSection && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 my-3 text-left">
                  <p className="text-gray-300 text-sm">
                    <span className="font-bold text-blue-400">SportIQ</span> is the ultimate sports trivia challenge that tests your knowledge across multiple sports categories. Whether you're a casual fan or a sports expert, our carefully crafted questions will challenge and entertain you.
                  </p>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {appFeatures.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <feature.icon size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-300">{feature.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700 mb-4"
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

        {/* How to Play - Collapsible Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-4"
        >
          <motion.button
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className="flex items-center justify-center gap-2 text-green-400 hover:text-green-300 transition-colors mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HelpCircle size={16} />
            <span>How to Play</span>
            {showHowToPlay ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </motion.button>
          
          <AnimatePresence>
            {showHowToPlay && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 my-3">
                  <div className="space-y-3">
                    {howToPlaySteps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-400 text-xs font-bold">{index + 1}</span>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">{step.title}</p>
                          <p className="text-xs text-gray-400">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-500 text-xs">
            © 2025 SportIQ - v1.2.0 - The Ultimate Sports Trivia Challenge
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;