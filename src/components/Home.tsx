// src/components/Home.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, User, Play, ChevronDown, CheckCircle, 
  LogIn, UserPlus, Medal, BarChart2, Clock, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalyticsEvent } from '../hooks/useAnalyticsEvent';
import Footer from './layout/Footer';
import EnhancedNavBar from './layout/EnhancedNavBar';

// Keep existing interface
interface HomeProps {
  onStart: (username: string) => void;
}

// Example categories for the rotating display
const categories = [
  { name: 'Football', emoji: '⚽' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Olympics', emoji: '🏅' },
  { name: 'Mixed Sports', emoji: '🎯' }
];

// Example quiz question for the preview
const exampleQuestions = [
  {
    question: "Which country won the 2022 FIFA World Cup?",
    options: ["France", "Brazil", "Argentina", "Germany"],
    category: "Football",
    emoji: "⚽"
  },
  {
    question: "Who holds the NBA record for most points in a single game?",
    options: ["Michael Jordan", "Kobe Bryant", "Wilt Chamberlain", "LeBron James"],
    category: "Basketball",
    emoji: "🏀"
  },
  {
    question: "Who has won the most Grand Slam singles titles in men's tennis?",
    options: ["Rafael Nadal", "Roger Federer", "Novak Djokovic", "Pete Sampras"],
    category: "Tennis",
    emoji: "🎾"
  },
  {
    question: "Which country has won the most Summer Olympic gold medals in history?",
    options: ["United States", "Soviet Union", "China", "Great Britain"],
    category: "Olympics",
    emoji: "🏅"
  }
];


const Home: React.FC<HomeProps> = ({ onStart }) => {
  const { user, profile } = useAuth();
  const { trackEvent } = useAnalyticsEvent();
  
  const [username, setUsername] = useState('');
  const [activePath, setActivePath] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState(false);

  // Set username from profile if available
  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile]);

  // Auto-rotate questions for the preview
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuestionIndex((prev) => 
        prev === exampleQuestions.length - 1 ? 0 : prev + 1
      );
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  const handlePlayNow = () => {
    if (username.trim() === '') {
      setError(true);
      return;
    }
    
    setError(false);
    
    // Track play event - keep your existing analytics
    trackEvent('home_start', { username });
    
    // Call the existing onStart prop
    onStart(username.trim());
  };

  // Enhanced Logo and branding component
  const Logo = () => (
    <div className="relative inline-block">
      <div className="relative z-20 flex items-center justify-center gap-3">
        <motion.div
          animate={{ 
            rotate: [0, 5, 0, -5, 0],
            scale: [1, 1.1, 1, 1.1, 1]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <span className="text-5xl md:text-6xl">🏆</span>
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-400">
          Sport<span className="text-white">IQ</span>
        </h1>
        <motion.div
          animate={{ 
            rotate: [0, -5, 0, 5, 0],
            scale: [1, 1.1, 1, 1.1, 1]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <span className="text-5xl md:text-6xl">🧠</span>
        </motion.div>
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500 opacity-15 blur-2xl rounded-full z-10"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1220] to-[#1a1a2e] text-white">
      {/* Replace AuthNavBar with EnhancedNavBar */}
      <EnhancedNavBar variant="default" position="top-right" />

      {/* Main Hero Section */}
      <main className="container mx-auto px-4 py-8">
        {/* Main Headline */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo />
          <motion.p
            className="text-xl md:text-2xl text-gray-300 italic mt-4"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            The Ultimate Sports Trivia Game
          </motion.p>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-2">
            Challenge yourself or compete against friends in the ultimate sports trivia experience
          </p>
        </motion.div>

        {/* Two-Path Section with Absolutely Positioned Button Sections */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 max-w-5xl mx-auto mb-16 relative">
          {/* Subtle connecting element */}
          <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-500/20 rounded-full blur-xl z-0"></div>
          
          {/* Play Now Path */}
          <motion.div 
            className={`relative bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 overflow-hidden border-2 transition-all duration-300 ${activePath === 'play' ? 'border-blue-500/50 shadow-lg shadow-blue-500/20' : 'border-gray-700/30'}`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            onMouseEnter={() => setActivePath('play')}
            onMouseLeave={() => setActivePath(null)}
            style={{ height: '450px', position: 'relative' }} // Fixed height with relative positioning
          >
            {/* Header Section - Same for both cards */}
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <Play className="text-blue-400" />
                  Quick Play
                </h2>
                <p className="text-gray-300 mb-4">Jump right into the action!</p>
              </div>
              <motion.div
                className="w-12 h-12 bg-blue-600/30 rounded-full flex items-center justify-center"
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: "rgba(37, 99, 235, 0.4)"
                }}
              >
                <Trophy size={24} className="text-blue-400" />
              </motion.div>
            </div>

            {/* Main Content - Fixed Height Section */}
            <div className="space-y-3 mb-6 h-28">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                <p className="text-gray-200">No account required</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                <p className="text-gray-200">Instant access to all quiz categories</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                <p className="text-gray-200">Challenge friends with shareable codes</p>
              </div>
            </div>

            {/* Button Section - Absolutely Positioned at Bottom */}
            <div className="absolute bottom-14 left-6 right-6 space-y-3">
              <div className={`relative border-2 rounded-lg overflow-hidden transition-colors duration-300 ${error ? 'border-red-500' : activePath === 'play' ? 'border-blue-500' : 'border-gray-600'}`}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(false); }}
                  className="w-full py-3 px-4 text-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none"
                  placeholder="Enter your username"
                />
                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              
              {error && (
                <p className="text-red-500 text-sm">Please enter a username to continue</p>
              )}

              <motion.button
                onClick={handlePlayNow}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full p-4 text-xl font-bold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 flex items-center justify-center gap-3"
              >
                <Play size={24} className="fill-white" />
                <span>PLAY NOW</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Create Account Path */}
          <motion.div 
            className={`relative bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 overflow-hidden border-2 transition-all duration-300 ${activePath === 'account' ? 'border-green-500/50 shadow-lg shadow-green-500/20' : 'border-gray-700/30'}`}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onMouseEnter={() => setActivePath('account')}
            onMouseLeave={() => setActivePath(null)}
            style={{ height: '450px', position: 'relative' }} // Fixed height with relative positioning
          >
            {/* Header Section - Same for both cards */}
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-green-400 mb-2 flex items-center gap-2">
                  <UserPlus className="text-green-400" />
                  Create Account
                </h2>
                <p className="text-gray-300 mb-4">Track your progress & compete</p>
              </div>
              <motion.div
                className="w-12 h-12 bg-green-600/30 rounded-full flex items-center justify-center"
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: "rgba(22, 163, 74, 0.4)"
                }}
              >
                <Medal size={24} className="text-green-400" />
              </motion.div>
            </div>

            {/* Main Content - Fixed Height Section */}
            <div className="space-y-3 mb-6 h-28">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                <p className="text-gray-200">Save your game history and stats</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                <p className="text-gray-200">Track your improvement over time</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                <p className="text-gray-200">Compete on leaderboards</p>
              </div>
              <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
              <p className="text-gray-200">Unlock achievements and exclusive badges</p>
              </div>
            </div>

            {/* Button Section - Absolutely Positioned at Bottom to Match Left Card */}
            <div className="absolute bottom-6 left-6 right-6 space-y-3">
              {/* Adding an invisible placeholder with same height as input to maintain spacing */}
              <div className="invisible h-[54px]"></div>
              
              {/* Space for error message placeholder */}
              <div className="invisible h-[20px]"></div>
              
              <motion.a
                href="/auth/signup"
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full p-4 text-xl font-bold rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all duration-200 flex items-center justify-center gap-3 block"
              >
                <UserPlus size={24} />
                <span>CREATE ACCOUNT</span>
              </motion.a>
              
              <div className="text-center">
                <a 
                  href="/auth/signin"
                  className="text-green-400 hover:text-green-300 text-sm"
                >
                  Already have an account? Sign in
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quiz Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Preview a Sample Question</h2>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <span className="text-xl">{exampleQuestions[currentQuestionIndex].emoji}</span>
                  <span className="font-medium">{exampleQuestions[currentQuestionIndex].category}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-gray-700/70 text-gray-300 flex items-center gap-1">
                  <Clock size={14} />
                  <span className="text-sm">15s</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                {exampleQuestions[currentQuestionIndex].question}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exampleQuestions[currentQuestionIndex].options.map((option, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                    className="p-3 bg-gray-700/50 rounded-lg cursor-pointer text-white border border-gray-600/50 hover:border-blue-500/50 transition-colors"
                  >
                    {option}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-5xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Why Play SportIQ?</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(30, 41, 59, 0.5)" }}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30"
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <Trophy size={24} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multiple Categories</h3>
              <p className="text-gray-400">Test your knowledge across football, basketball, tennis, Olympics, and mixed sports.</p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(30, 41, 59, 0.5)" }}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30"
            >
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                <Users size={24} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multiplayer Battles</h3>
              <p className="text-gray-400">Challenge friends to real-time 1v1 quiz battles with shareable invite codes.</p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(30, 41, 59, 0.5)" }}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30"
            >
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                <BarChart2 size={24} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Track Your Progress</h3>
              <p className="text-gray-400">See your improvement over time with detailed statistics and performance tracking.</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Categories Section with Horizontal Scroll */}
     <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5, duration: 0.5 }}
  className="max-w-5xl mx-auto mb-16"
>
  <h2 className="text-2xl font-bold text-center mb-8">Quiz Categories</h2>
  
  {/* Grid layout for the 5 categories with no scrolling */}
  <div className="grid grid-cols-5 gap-2 px-2">
    {categories.map((category, index) => (
      <motion.div
        key={index}
        whileHover={{ y: -5, scale: 1.03 }}
        className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-700/30"
      >
        <div className="text-3xl mb-2 text-center">{category.emoji}</div>
        <h3 className="text-base font-bold text-white text-center">{category.name}</h3>
      </motion.div>
    ))}
  </div>
</motion.div>

        {/* CTA Section */}
       <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Ready to Test Your Sports Knowledge?</h2>
          
          {/* Username input centered above both buttons */}
          <div className="max-w-md mx-auto mb-6">
            <div className={`relative border-2 rounded-lg overflow-hidden transition-colors duration-300 ${error ? 'border-red-500' : 'border-gray-600 hover:border-blue-500'}`}>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(false); }}
                className="w-full py-3 px-4 text-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none"
                placeholder="Enter your username"
              />
              <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mt-1">Please enter a username</p>
            )}
          </div>
          
          {/* Buttons side by side */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <motion.button
              onClick={handlePlayNow}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="sm:w-64 px-6 py-4 text-xl font-bold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Play size={20} className="fill-white" />
              <span>PLAY NOW</span>
            </motion.button>
            
            <motion.a
              href="/auth/signup"
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="sm:w-64 px-6 py-4 text-xl font-bold rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              <span>CREATE ACCOUNT</span>
            </motion.a>
          </div>
          
          {/* Sign in link below both buttons */}
          <div className="text-center">
            <a 
              href="/auth/signin"
              className="text-green-400 hover:text-green-300 text-sm"
            >
              Already have an account? Sign in
            </a>
          </div>
        </motion.div>
      </main>

      {/* Use your existing Footer component */}
      <Footer />

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {categories.map((category, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl opacity-5"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: -100,
              rotate: 0
            }}
            animate={{ 
              y: '120vh',
              rotate: 360,
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              delay: index * 3,
              ease: "linear"
            }}
          >
            {category.emoji}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
