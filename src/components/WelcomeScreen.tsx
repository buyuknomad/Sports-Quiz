import React, { useState, useEffect } from 'react';
import { Trophy, Swords, UserPlus, Info, HelpCircle, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { NavigationButton } from './navigation';
import { NAVIGATION_LABELS } from '../constants/navigation';
import EnhancedNavBar from './layout/EnhancedNavBar';
// Import Footer component
import Footer from './layout/Footer';

// Define expanded GameMode type with the new join option
type GameMode = 'solo' | 'create' | 'join';

interface WelcomeScreenProps {
  onStart: (username: string, mode: GameMode) => void;
}

// Animation variants
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
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [activeInfoPanel, setActiveInfoPanel] = useState<GameMode | null>(null);
  const location = useLocation();
  
  // Check if we came from dashboard or another page (not home)
  const [showBackToHome, setShowBackToHome] = useState(false);
  
  useEffect(() => {
    // Get navigation source to determine if we should show back button
    const source = localStorage.getItem('navigationSource');
    
    console.log('Navigation source:', source);
    
    // Show back button if we came from dashboard OR any other source except direct/home
    const showBack = source && source !== 'direct' && source !== 'home';
    setShowBackToHome(showBack);
    
  }, [location.pathname]);
  
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
  
  // Handle navigation back to home
  const handleBackToHome = () => {
    window.location.href = '/';
  };
  
  // Handle Learn More clicks
  const handleLearnMore = (mode: GameMode, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    setActiveInfoPanel(activeInfoPanel === mode ? null : mode);
  };
  
  // Content for each mode's info panel
  const modeInfo = {
    solo: {
      title: "Solo Play",
      description: "Test your sports knowledge at your own pace. Answer 10 questions across your chosen category and earn points for correct answers. The faster you answer, the more bonus points you receive!",
      perfectFor: "Practice, learning new sports facts, and improving your response time.",
      color: "text-green-400",
      bgColor: "bg-green-600/10",
      btnBgColor: "bg-green-500/20",
      btnHoverColor: "hover:bg-green-500/30",
      borderColor: "border-green-500/30" 
    },
    create: {
      title: "Create 1v1 Game",
      description: "Be the host! Create a game, choose the category, and get a shareable code to invite a friend. Challenge them to see who has better sports knowledge.",
      perfectFor: "Challenging friends, picking your favorite sports category, and proving you're the champion.",
      color: "text-blue-400",
      bgColor: "bg-blue-600/10",
      btnBgColor: "bg-blue-500/20",
      btnHoverColor: "hover:bg-blue-500/30",
      borderColor: "border-blue-500/30"
    },
    join: {
      title: "Join 1v1 Game",
      description: "Got an invite code? Use it to quickly join a friend's game and compete in real-time. The host has already selected the category - just enter the code and play!",
      perfectFor: "Accepting challenges, quick play, and jumping straight into competition.",
      color: "text-purple-400",
      bgColor: "bg-purple-600/10",
      btnBgColor: "bg-purple-500/20",
      btnHoverColor: "hover:bg-purple-500/30",
      borderColor: "border-purple-500/30"
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0c1220] to-[#1a1a2e]">
      {/* Add EnhancedNavBar instead of AuthNavBar */}
      <EnhancedNavBar variant="default" position="top-right" />
      
      {/* Back to Home button - only show if we came from dashboard */}
      {showBackToHome && (
        <div className="fixed bottom-6 left-6 z-50">
          <NavigationButton
            icon={Home}
            label={NAVIGATION_LABELS.HOME}
            onClick={handleBackToHome}
          />
        </div>
      )}

      {/* Main content wrapper with flex-grow to push footer down */}
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        {/* Header content remains the same */}
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
        
        {/* How It Works Button - unchanged */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 mb-4 text-sm cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Info size={16} />
          <span>{showHowItWorks ? "Hide Guide" : "How It Works"}</span>
          {showHowItWorks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </motion.button>
        
        {/* How It Works Panel - unchanged */}
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
                  <li>Select your preferred game mode (Solo, Create Game, or Join Game)</li>
                  <li>Choose a sports category that interests you (when creating a game)</li>
                  <li>Answer 10 questions as quickly and accurately as possible</li>
                  <li>Earn 10 points for each correct answer plus time bonuses</li>
                  <li>View your performance stats and challenge others to beat your score!</li>
                </ol>
                
                <p className="text-xs text-gray-400 mt-2">
                  All game modes feature the same categories: Football ⚽, Basketball 🏀, Tennis 🎾, Olympics 🏅, and Mixed Sports 🎯
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Game Mode Cards - with improved Learn More buttons */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4"
        >
          {/* Solo Mode Card */}
          <motion.div
            variants={item}
            className="relative bg-gray-800 rounded-xl p-6 pb-14 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-400 opacity-0 hover:opacity-10 transition-opacity duration-300"
            />
            
            {/* Card Content */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeSelect('solo')}
              className={`flex flex-col items-center gap-3 relative z-10 cursor-pointer ${selectedMode === 'solo' ? 'ring-2 ring-green-400 rounded-xl p-2' : ''}`}
            >
              <motion.div
                variants={iconAnimation}
                whileHover="hover"
                className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-green-600 to-green-400 rounded-full mb-2"
              >
                <Trophy size={32} className="text-white" />
              </motion.div>
              
              <motion.h2 
                className="text-xl font-bold text-white flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                Solo Play
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl"
                >
                  🏀
                </motion.span>
              </motion.h2>
              <p className="text-gray-400 text-sm mb-2">
                Practice at your own pace
              </p>
            </motion.div>
            
            {/* Improved Learn More Button - Absolute positioned at bottom */}
            <motion.button 
              onClick={(e) => handleLearnMore('solo', e)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute bottom-3 left-0 right-0 mx-auto w-3/4 py-2 px-4 rounded-lg ${modeInfo['solo'].btnBgColor} ${modeInfo['solo'].btnHoverColor} ${modeInfo['solo'].color} font-medium text-sm flex items-center justify-center gap-2 border ${modeInfo['solo'].borderColor} transition-colors cursor-pointer`}
            >
              <Info size={16} />
              {activeInfoPanel === 'solo' ? 'Hide Details' : 'Learn More'}
            </motion.button>
          </motion.div>

          {/* Create 1v1 Game Card */}
          <motion.div
            variants={item}
            className="relative bg-gray-800 rounded-xl p-6 pb-14 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 opacity-0 hover:opacity-10 transition-opacity duration-300"
            />
            
            {/* Card Content */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeSelect('create')}
              className={`flex flex-col items-center gap-3 relative z-10 cursor-pointer ${selectedMode === 'create' ? 'ring-2 ring-blue-400 rounded-xl p-2' : ''}`}
            >
              <motion.div
                variants={iconAnimation}
                whileHover="hover"
                className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mb-2"
              >
                <Swords size={32} className="text-white" />
              </motion.div>
              
              <motion.h2 
                className="text-xl font-bold text-white flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                Create 1v1 Game
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl"
                >
                  ⚔️
                </motion.span>
              </motion.h2>
              <p className="text-gray-400 text-sm mb-2">
                Host a game & invite a friend
              </p>
            </motion.div>
            
            {/* Improved Learn More Button */}
            <motion.button 
              onClick={(e) => handleLearnMore('create', e)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute bottom-3 left-0 right-0 mx-auto w-3/4 py-2 px-4 rounded-lg ${modeInfo['create'].btnBgColor} ${modeInfo['create'].btnHoverColor} ${modeInfo['create'].color} font-medium text-sm flex items-center justify-center gap-2 border ${modeInfo['create'].borderColor} transition-colors cursor-pointer`}
            >
              <Info size={16} />
              {activeInfoPanel === 'create' ? 'Hide Details' : 'Learn More'}
            </motion.button>
          </motion.div>

          {/* Join 1v1 Game Card */}
          <motion.div
            variants={item}
            className="relative bg-gray-800 rounded-xl p-6 pb-14 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-400 opacity-0 hover:opacity-10 transition-opacity duration-300"
            />
            
            {/* Card Content */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeSelect('join')}
              className={`flex flex-col items-center gap-3 relative z-10 cursor-pointer ${selectedMode === 'join' ? 'ring-2 ring-purple-400 rounded-xl p-2' : ''}`}
            >
              <motion.div
                variants={iconAnimation}
                whileHover="hover"
                className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-400 rounded-full mb-2"
              >
                <UserPlus size={32} className="text-white" />
              </motion.div>
              
              <motion.h2 
                className="text-xl font-bold text-white flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                Join 1v1 Game
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl"
                >
                  🎮
                </motion.span>
              </motion.h2>
              <p className="text-gray-400 text-sm mb-2">
                Join with an invite code
              </p>
            </motion.div>
            
            {/* Improved Learn More Button */}
            <motion.button 
              onClick={(e) => handleLearnMore('join', e)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute bottom-3 left-0 right-0 mx-auto w-3/4 py-2 px-4 rounded-lg ${modeInfo['join'].btnBgColor} ${modeInfo['join'].btnHoverColor} ${modeInfo['join'].color} font-medium text-sm flex items-center justify-center gap-2 border ${modeInfo['join'].borderColor} transition-colors cursor-pointer`}
            >
              <Info size={16} />
              {activeInfoPanel === 'join' ? 'Hide Details' : 'Learn More'}
            </motion.button>
          </motion.div>
        </motion.div>
        
        {/* Info Panel - Shows details for the selected mode */}
        <AnimatePresence>
          {activeInfoPanel && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`w-full max-w-lg mb-6 ${modeInfo[activeInfoPanel].bgColor} rounded-xl p-5 overflow-hidden border ${modeInfo[activeInfoPanel].borderColor}`}
            >
              <h3 className={`text-xl font-bold ${modeInfo[activeInfoPanel].color} mb-3`}>
                About {modeInfo[activeInfoPanel].title}
              </h3>
              
              <p className="text-gray-300 text-sm mb-3">
                {modeInfo[activeInfoPanel].description}
              </p>
              
              <div className="text-xs text-gray-400">
                <span className={`${modeInfo[activeInfoPanel].color} font-medium`}>Perfect for:</span> {modeInfo[activeInfoPanel].perfectFor}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Username display with animation */}
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
      
      {/* Add Footer component */}
      <Footer />
      
      {/* Background animated sport icons */}
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

export default WelcomeScreen;
