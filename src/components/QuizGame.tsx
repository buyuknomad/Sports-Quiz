import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Copy, MessageCircle, Clock, Target, 
  ArrowLeft, Home, CheckCircle, XCircle
} from 'lucide-react';

// This is a UI/UX redesign mockup - actual functionality would be connected
// to the existing store and logic from the original component
const EnhancedQuizGame = () => {
  // Mock state for demonstration
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [score, setScore] = useState(0);
  
  // Mock data
  const category = "football";
  const totalQuestions = 10;
  const question = {
    question: "Which country won the 2022 FIFA World Cup?",
    options: ["France", "Brazil", "Argentina", "Germany"],
    correctAnswer: "Argentina"
  };
  
  // Simulate timer
  useEffect(() => {
    if (!isAnswerChecked && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => Math.max(prev - 0.1, 0));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isAnswerChecked]);
  
  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    if (isAnswerChecked) return;
    
    setSelectedAnswer(answer);
    setIsAnswerChecked(true);
    setIsCorrect(answer === question.correctAnswer);
    
    if (answer === question.correctAnswer) {
      setScore(prev => prev + 10);
    }
    
    // Auto-advance to next question after delay
    setTimeout(() => {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setTimeRemaining(15);
    }, 2000);
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestion) / totalQuestions) * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1528] to-[#1a2a4a] text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 15 + Math.random() * 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Game container with glass morphism effect */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Header with enhanced styling */}
        <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-lg">
          <div className="bg-gray-900/80 border-b border-blue-500/30 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              {/* Category badge */}
              <div className="flex items-center gap-2">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                  className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-md shadow-blue-500/20"
                >
                  <Trophy className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex flex-col">
                  <h2 className="font-bold text-sm sm:text-base capitalize flex items-center gap-1">
                    <span className="text-blue-400">Football</span>
                    <span className="text-xl">⚽</span>
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="font-medium text-blue-400">{currentQuestion + 1}</span>
                    <span className="text-gray-500">/</span>
                    <span>{totalQuestions}</span>
                  </div>
                </div>
              </div>
              
              {/* Score display */}
              <div className="rounded-full px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 flex items-center gap-2 text-sm font-semibold">
                <span className="text-gray-400">Score:</span>
                <span className="text-blue-400">{score}</span>
              </div>
              
              {/* Timer with visual indicator */}
              <div className="relative">
                <motion.div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  animate={{
                    boxShadow: timeRemaining < 5 
                      ? ['0 0 0px 0px rgba(239, 68, 68, 0.7)', '0 0 20px 2px rgba(239, 68, 68, 0.7)'] 
                      : 'none'
                  }}
                  transition={{ duration: 1, repeat: timeRemaining < 5 ? Infinity : 0, repeatType: "reverse" }}
                >
                  <svg className="w-14 h-14 -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="#1f2937"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke={timeRemaining > 10 ? "#3b82f6" : timeRemaining > 5 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="4"
                      strokeDasharray={24 * 2 * Math.PI}
                      strokeDashoffset={(24 * 2 * Math.PI) * (1 - timeRemaining / 15)}
                      strokeLinecap="round"
                      initial={false}
                      animate={{ 
                        strokeDashoffset: (24 * 2 * Math.PI) * (1 - timeRemaining / 15)
                      }}
                      transition={{ duration: 0.1, ease: "linear" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Clock className="w-4 h-4 absolute text-gray-400 -mt-5" />
                    <span className={`font-bold text-lg ${
                      timeRemaining > 10 ? "text-blue-400" : 
                      timeRemaining > 5 ? "text-amber-400" : 
                      "text-red-400"
                    }`}>
                      {timeRemaining.toFixed(1)}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-gray-800">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
              initial={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </header>
        
        {/* Navigation buttons */}
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-700/50 text-white shadow-lg flex items-center justify-center group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-700/50 text-white shadow-lg flex items-center justify-center group"
          >
            <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        </div>
        
        {/* Main question card with enhanced styling */}
        <motion.div
          layout
          className="max-w-3xl mx-auto p-8 bg-gray-900/60 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-900/30"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`question-${currentQuestion}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">Question {currentQuestion + 1}</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {question.question}
              </h2>
            </motion.div>
          </AnimatePresence>
          
          {/* Answer options with improved design */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`options-${currentQuestion}`}
              className="grid gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {question.options.map((option, index) => {
                let buttonClass = "p-5 rounded-xl w-full text-left transition-all border-2 ";
                let iconComponent = null;
                
                if (!isAnswerChecked) {
                  buttonClass += "bg-gray-800/80 hover:bg-gray-700/80 text-white border-gray-700/50 hover:border-blue-500/50";
                } else if (option === question.correctAnswer) {
                  buttonClass += "bg-green-500/10 text-white border-green-500/50";
                  iconComponent = <CheckCircle className="w-5 h-5 text-green-500" />;
                } else if (option === selectedAnswer) {
                  buttonClass += "bg-red-500/10 text-gray-300 border-red-500/50";
                  iconComponent = <XCircle className="w-5 h-5 text-red-500" />;
                } else {
                  buttonClass += "bg-gray-800/40 text-gray-400 border-gray-700/30";
                }

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswerChecked}
                    className={buttonClass}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { 
                        opacity: 1, 
                        x: 0,
                        transition: { 
                          duration: 0.3, 
                          delay: index * 0.1,
                          type: "spring", 
                          stiffness: 300, 
                          damping: 24 
                        }
                      }
                    }}
                    whileHover={!isAnswerChecked ? { 
                      scale: 1.02, 
                      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)",
                      borderColor: "rgba(59, 130, 246, 0.5)"
                    } : {}}
                    whileTap={!isAnswerChecked ? { scale: 0.98 } : {}}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700/80 flex items-center justify-center text-sm font-medium">
                          {['A', 'B', 'C', 'D'][index]}
                        </div>
                        <span className="text-lg font-medium">{option}</span>
                      </div>
                      {iconComponent}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
          
          {/* Feedback area with enhanced animation */}
          <AnimatePresence>
            {isAnswerChecked && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 overflow-hidden"
              >
                <div className={`p-4 rounded-xl backdrop-blur-sm ${
                  isCorrect 
                    ? "bg-green-500/10 border border-green-500/30" 
                    : "bg-red-500/10 border border-red-500/30"
                }`}>
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h3 className="text-green-400 font-bold text-lg">Correct!</h3>
                          <p className="text-gray-300 text-sm">+10 points added to your score</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <XCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-red-400 font-bold text-lg">Incorrect</h3>
                          <p className="text-gray-300 text-sm">
                            The correct answer was <span className="text-green-400 font-medium">{question.correctAnswer}</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Chat button (multiplayer mode) */}
        <div className="fixed bottom-6 right-6 z-50">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChat(!showChat)}
            className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg flex items-center justify-center"
          >
            <MessageCircle size={24} />
          </motion.button>
          
          {/* Chat panel would go here */}
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute bottom-16 right-0 w-72 bg-gray-900/90 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50 shadow-xl"
              >
                <h3 className="text-white font-bold mb-2">Quick Chat</h3>
                <div className="space-y-2 mb-4">
                  {[
                    { emoji: '👍', text: 'Nice one!' },
                    { emoji: '🔥', text: 'On fire!' },
                    { emoji: '🎯', text: 'Great shot!' },
                    { emoji: '💪', text: 'Keep it up!' }
                  ].map((msg, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2"
                    >
                      <span>{msg.emoji}</span>
                      <span>{msg.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuizGame;
