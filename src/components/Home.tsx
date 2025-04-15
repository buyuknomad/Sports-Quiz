// Enhanced Home component with authentication integration
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Play, Info, HelpCircle, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Sparkles, Swords } from 'lucide-react';
import Footer from './layout/Footer';
import AuthNavBar from './auth/AuthNavBar';
import { useAuth } from '../contexts/AuthContext';

// --- Data Definitions ---

// Example Questions for the carousel
const exampleQuestions = [
  {
    question: "Which country won the 2022 FIFA World Cup?",
    category: "Football",
    emoji: "⚽",
    colorClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    options: ["France", "Brazil", "Argentina", "Germany"]
  },
  {
    question: "Who holds the NBA record for most points in a single game?",
    category: "Basketball",
    emoji: "🏀",
    colorClass: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    options: ["Michael Jordan", "Kobe Bryant", "Wilt Chamberlain", "LeBron James"]
  },
  {
    question: "Which Grand Slam tournament is played on clay courts?",
    category: "Tennis",
    emoji: "🎾",
    colorClass: "bg-green-500/20 text-green-400 border-green-500/30",
    options: ["Wimbledon", "US Open", "French Open", "Australian Open"]
  },
  {
    question: "Who is the most decorated Olympian of all time?",
    category: "Olympics",
    emoji: "🏅",
    colorClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    options: ["Usain Bolt", "Michael Phelps", "Simone Biles", "Carl Lewis"]
  },
  {
    question: "Usain Bolt broke which two world records at the 2008 Olympics?",
    category: "Mixed",
    emoji: "🎯",
    colorClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    options: ["100m & 200m","200m & 400m","100m & 4x100m","200m & long jump"],
     },
  {
    question: "Which team has won the most UEFA Champions League titles?",
    category: "Football",
    emoji: "⚽",
    colorClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    options: ["Real Madrid", "AC Milan", "Bayern Munich", "Liverpool"]
  },
];

// Game Mode definitions for Homepage Display (Using WelcomeScreen style)
const homePageGameModes = [
  {
    id: 'solo',
    title: 'Solo Play',
    description: 'Practice at your own pace',
    icon: Trophy,
    iconBgColor: 'bg-gradient-to-br from-green-600 to-green-400',
    hoverGradient: 'from-green-600 to-green-400',
    emoji: '🏆',
  },
  {
    id: 'versus',
    title: '1v1 Challenge',
    description: 'Challenge a friend',
    icon: Swords,
    iconBgColor: 'bg-gradient-to-br from-blue-600 to-blue-400',
    hoverGradient: 'from-blue-600 to-blue-400',
    emoji: '⚔️',
  }
];

// Category definitions
const categories = [
  { name: 'Football', emoji: '⚽' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Olympics', emoji: '🏅' },
  { name: 'Mixed Sports', emoji: '🎯' }
];

// Sports icons for the animated background
const sportsIcons = ['⚽', '🏀', '🎾', '🏈', '⚾', '🏆', '🥇', '🏅'];

// --- Animation Variants ---
const shakeAnimation = {
  shake: {
    x: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.4 }
  }
};

// Icon animation from WelcomeScreen example
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


// --- Sub-Components ---

/**
 * Animated Background Component
 */
const AnimatedBackground = React.memo(() => (
  <div className="absolute inset-0 overflow-hidden z-0">
    {sportsIcons.map((icon, index) => (
      <motion.div
        key={index}
        className="absolute text-4xl opacity-5 pointer-events-none"
        style={{
            top: '-100px',
            left: `${Math.random() * 100}%`,
        }}
        animate={{
          y: '110vh',
          rotate: 360,
        }}
        transition={{
          duration: 20 + Math.random() * 15,
          repeat: Infinity,
          repeatType: "loop",
          delay: Math.random() * 5,
          ease: "linear"
        }}
      >
        {icon}
      </motion.div>
    ))}
  </div>
));

/**
 * Example Questions Carousel Component
 */
const ExampleQuestionsCarousel = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!isAutoSliding) return undefined;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentQuestionIndex(prev =>
        prev === exampleQuestions.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoSliding]);

  const handleQuestionHover = (isHovering) => {
    setIsAutoSliding(!isHovering);
  };

  const navigateQuestion = (newDirection) => {
    setDirection(newDirection);
    setCurrentQuestionIndex(prev => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = exampleQuestions.length - 1;
      else if (nextIndex >= exampleQuestions.length) nextIndex = 0;
      return nextIndex;
    });
    setIsAutoSliding(false);
    setTimeout(() => setIsAutoSliding(true), 7000);
  };

  const goToQuestion = (index) => {
    setDirection(index > currentQuestionIndex ? 1 : -1);
    setCurrentQuestionIndex(index);
    setIsAutoSliding(false);
    setTimeout(() => setIsAutoSliding(true), 7000);
  }

  const questionVariants = {
    enter: (direction) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 30 : -30, opacity: 0 })
  };

  const currentQuestion = exampleQuestions[currentQuestionIndex];

  return (
    <motion.div
      className="max-w-xl mx-auto mt-8 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      onMouseEnter={() => handleQuestionHover(true)}
      onMouseLeave={() => handleQuestionHover(false)}
    >
       <p className="text-sm text-center text-blue-300/80 mb-2">See Example Questions</p>
      <div className={`bg-gray-800/60 backdrop-blur-md border ${currentQuestion.colorClass} p-4 md:p-5 rounded-xl relative overflow-hidden shadow-lg`}>
        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-medium ${currentQuestion.colorClass} border-t-0 border-r-0 border border-gray-700/50`}>
          {currentQuestion.emoji} {currentQuestion.category}
        </div>
        <div className="min-h-[130px] md:min-h-[100px] pr-10 pl-10 md:pr-4 md:pl-4 flex items-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentQuestionIndex}
              custom={direction}
              variants={questionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full"
            >
              <h3 className="text-white text-md md:text-lg font-semibold mb-3">
                {currentQuestion.question}
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {currentQuestion.options.map((option, index) => (
                  <span key={index} className="text-gray-400 truncate">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          onClick={() => navigateQuestion(-1)}
          className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-900/60 text-white hover:bg-gray-900/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Previous question"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => navigateQuestion(1)}
          className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-900/60 text-white hover:bg-gray-900/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Next question"
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {exampleQuestions.map((_, index) => (
          <button
            key={index}
            onClick={() => goToQuestion(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentQuestionIndex === index
                ? 'bg-blue-500 scale-125 w-4'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label={`Go to question ${index + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
};


/**
 * Hero Section Component
 */
const HeroSection = () => (
  <motion.div
    className="text-center mb-12"
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7 }}
  >
    {/* Logo */}
    <div className="relative inline-block mb-4">
      <div className="relative z-20 flex items-center justify-center gap-3">
        <motion.div
          animate={{ rotate: [0, 5, 0, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl md:text-6xl"
        >🏆</motion.div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-400">
          Sport<span className="text-white">IQ</span>
        </h1>
        <motion.div
          animate={{ rotate: [0, -5, 0, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="text-5xl md:text-6xl"
        >🧠</motion.div>
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500 opacity-15 blur-2xl rounded-full z-10"></div>
    </div>
    {/* Taglines */}
    <motion.p
      className="text-xl md:text-2xl text-gray-300 italic relative z-20"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
    >The Ultimate Sports Trivia Challenge</motion.p>
    <motion.p
      className="text-lg md:text-xl text-blue-400 font-semibold mt-2 relative z-20"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
    >Challenge Your Sports Knowledge in Seconds</motion.p>
    {/* Underline */}
    <motion.div
      className="h-1 w-24 md:w-32 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mt-4 mb-8"
      initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
    />
    {/* Example Questions */}
    <ExampleQuestionsCarousel />
    {/* Categories Label */}
    <motion.h3
        className="text-lg font-semibold text-white mt-10 mb-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
    >Quiz Categories</motion.h3>
    {/* Category Pills */}
    <motion.div
      className="flex flex-wrap justify-center gap-2"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
    >
      {categories.map((category, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.1 + index * 0.1 }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(55, 65, 81, 0.7)' }}
          className="px-3 py-1 bg-gray-800/50 backdrop-blur-sm rounded-full text-sm text-gray-300 flex items-center gap-1 cursor-default transition-colors"
        >
          <span>{category.emoji}</span>
          <span>{category.name}</span>
        </motion.div>
      ))}
    </motion.div>
    {/* Daily Questions Note */}
    <motion.p
        className="text-sm text-blue-300/90 mt-6 flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
    >
        <Sparkles size={16} className="text-yellow-400" />
        New questions added daily!
        <Sparkles size={16} className="text-yellow-400" />
    </motion.p>
  </motion.div>
);

/**
 * Game Mode Selection Component
 */
const GameModeSelection = () => (
  <motion.div
    className="mb-12"
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
  >
    <h2 className="text-2xl md:text-3xl text-white text-center font-semibold mb-8">Game Modes</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
      {homePageGameModes.map((mode, index) => (
        <motion.div
          key={mode.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 + index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)", transition: { duration: 0.2 } }}
          className="relative bg-gray-800/70 backdrop-blur-md rounded-xl p-6 pb-14 overflow-hidden group cursor-default"
        >
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${mode.hoverGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />
          
          <div className="flex flex-col items-center gap-3 relative z-10 text-center">
              <motion.div
                variants={iconAnimation}
                whileHover="hover"
                className={`w-16 h-16 flex items-center justify-center ${mode.iconBgColor} rounded-full mb-2 shadow-lg`}
              >
                <mode.icon size={32} className="text-white" />
              </motion.div>
              <motion.h2
                className="text-xl font-bold text-white flex items-center gap-2"
              >
                {mode.title}
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl"
                >
                  {mode.emoji}
                </motion.span>
              </motion.h2>
              <p className="text-gray-400 text-sm mb-2">
                {mode.description}
              </p>
          </div>
             <motion.div
              className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${mode.iconBgColor} origin-left`}
              initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.3, ease: "easeOut" }}
            />
        </motion.div>
      ))}
    </div>
  </motion.div>
);


/**
 * Login Area Component with Auth Integration
 */
const LoginArea = ({ username, setUsername, error, setError, handlePlay, isLoggedIn }) => {
  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
      className="max-w-md mx-auto bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700/50"
    >
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Enter The Arena</h2>
      
      {/* Container for shaking */}
      <motion.div
        className="relative mb-6"
        variants={shakeAnimation}
        animate={error ? "shake" : ""}
      >
        {/* Input field container */}
        {/* If user is logged in, show readonly username */}
        <div className={`relative border-2 rounded-lg overflow-hidden transition-colors duration-300 ${error ? 'border-red-500' : isInputFocused ? 'border-blue-500' : 'border-gray-600'}`}>
          <input
            id="usernameInput"
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(false); }}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            className={`w-full py-3 px-4 text-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none ${isLoggedIn ? 'opacity-80' : ''}`}
            placeholder="Your Username"
            readOnly={isLoggedIn} // Make readonly if logged in
          />
          <Users className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
        </div>

        {/* Error message */}
        {error && (
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-2 ml-1">
            Please enter a username to continue
          </motion.p>
        )}
      </motion.div>

      {/* Play Button */}
      <motion.button
        onClick={handlePlay}
        whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
        whileTap={{ scale: 0.97 }}
        className="w-full p-4 text-xl font-bold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 flex items-center justify-center gap-3 shadow-lg relative overflow-hidden group"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="relative z-10"
        ><Play size={24} className="fill-white" /></motion.div>
        <span className="relative z-10">TEST YOUR SPORTIQ</span>
      </motion.button>
      
      {/* Show different message based on auth state */}
      <p className="text-gray-400 text-xs mt-3 text-center">
        {isLoggedIn 
          ? "Your progress will be saved to your account" 
          : "Select game mode on the next screen"}
      </p>
    </motion.div>
  );
};



// --- Main Component ---

const EnhancedHomePage = ({ onStart }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(false);
  const { user, profile } = useAuth(); // Use the auth context to get user state
  
  // Automatically use profile username if available
  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile]);

  const handlePlay = useCallback(() => {
    if (username.trim().length === 0) {
      setError(true);
      return;
    }
    setError(false);
    onStart(username.trim());
  }, [username, onStart]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0c1220] to-[#1a1a2e] text-white overflow-x-hidden isolate">
      {/* Auth NavBar - shows sign in or user dashboard link */}
      <AuthNavBar />
      
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
        <HeroSection />
        <GameModeSelection />
        <LoginArea
          username={username}
          setUsername={setUsername}
          error={error}
          setError={setError}
          handlePlay={handlePlay}
          isLoggedIn={!!user} // Pass authentication state to LoginArea
        />
   
        
        {/* Replace the old Footer component with the new imported Footer */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1.3 }}
          className="mt-16"
        >
          <Footer />
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedHomePage;