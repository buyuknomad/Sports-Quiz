// Main quiz game component with integrated header and animated options
import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useOneVsOneStore } from '../store/oneVsOneStore';
import { quickChatMessages } from '../constants/chat';
import { Trophy, Copy, MessageCircle, X, Clock, Target, Circle, Medal, Dumbbell, ArrowLeft, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameMode } from '../types';

interface QuizGameProps {
  mode: GameMode;
  onBackToCategory?: () => void;
  onBackToMode?: () => void;
}

// Bonus tier definitions
interface BonusTier {
  threshold: number;
  points: number;
  label: string;
  emoji: string;
}

const bonusTiers: BonusTier[] = [
  { threshold: 12, points: 5, label: "Lightning Fast", emoji: "⚡" },
  { threshold: 10, points: 4, label: "Quick", emoji: "🚀" },
  { threshold: 8, points: 3, label: "Normal", emoji: "✨" },
  { threshold: 6, points: 2, label: "Measured", emoji: "🎯" },
  { threshold: 3, points: 1, label: "Delayed", emoji: "⏳" },
  { threshold: 0, points: 0, label: "Slow", emoji: "🐌" },
];

const optionVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }),
  exit: { x: 20, opacity: 0 }
};

const QuizGame: React.FC<QuizGameProps> = ({ mode, onBackToCategory, onBackToMode }) => {
  const soloStore = useGameStore();
  const multiStore = useOneVsOneStore();
  const store = mode === 'solo' ? soloStore : multiStore;
  
  const { 
    currentQuestion, 
    questions,
    category,
    players,
    chatMessages,
    addChatMessage,
    isGameEnded,
    submitAnswer,
    getCurrentPlayer,
    getPlayerResponseTimes,
    endGame
  } = store;
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [localTime, setLocalTime] = useState(15);
  const [showChat, setShowChat] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [currentBonusTier, setCurrentBonusTier] = useState<BonusTier | null>(null);
  const [endingTriggered, setEndingTriggered] = useState(false);
  const [showNavConfirm, setShowNavConfirm] = useState<'category' | 'mode' | null>(null);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState<string | null>(null);
  
  const currentPlayer = getCurrentPlayer();
  const question = questions[currentQuestion];
  const isMultiplayer = mode !== 'solo';

  const categoryConfig = {
    football: { icon: Trophy, emoji: '⚽', color: 'text-yellow-400' },
    basketball: { icon: Target, emoji: '🏀', color: 'text-orange-400' },
    tennis: { icon: Circle, emoji: '🎾', color: 'text-green-400' },
    olympics: { icon: Medal, emoji: '🏅', color: 'text-blue-400' },
    mixed: { icon: Dumbbell, emoji: '🎯', color: 'text-purple-400' }
  };

  const currentCategoryConfig = categoryConfig[category] || categoryConfig.mixed;
  const CategoryIcon = currentCategoryConfig.icon;

  const currentPlayerResponseTimes = currentPlayer ? getPlayerResponseTimes(currentPlayer.id) : [];
  const lastResponseTime = currentPlayerResponseTimes[currentPlayerResponseTimes.length - 1];
  const totalResponseTime = currentPlayerResponseTimes.reduce((sum, time) => sum + time, 0);

  const handleBackToCategory = () => {
    setShowNavConfirm('category');
  };

  const handleBackToMode = () => {
    setShowNavConfirm('mode');
  };

  const confirmNavigation = (destination: 'category' | 'mode') => {
    setShowNavConfirm(null);
    if (destination === 'category' && onBackToCategory) {
      onBackToCategory();
    } else if (destination === 'mode' && onBackToMode) {
      onBackToMode();
    }
  };

  const cancelNavigation = () => {
    setShowNavConfirm(null);
  };

  useEffect(() => {
    if (!isMultiplayer || !question || isGameEnded || endingTriggered) return;
    
    const isLastQuestion = currentQuestion === questions.length - 1;
    
    if (isLastQuestion && isAnswerChecked) {
      console.log('Last question answered by current player, checking end game conditions...');
      
      const timer = setTimeout(() => {
        console.log('Forcing game end after last question');
        setEndingTriggered(true);
        endGame();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [
    currentQuestion, 
    questions.length, 
    isAnswerChecked, 
    isMultiplayer, 
    question,
    endGame,
    isGameEnded,
    endingTriggered
  ]);

  useEffect(() => {
    console.log('Question changed, resetting state');
    
    setIsButtonEnabled(true);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setLocalTime(15);
    setEarnedPoints(0);
    setCurrentBonusTier(null);
    setCurrentCorrectAnswer(null);
  }, [currentQuestion, question]);

  const getBonusTier = useCallback((time: number): BonusTier => {
    // Find the highest tier the player qualifies for
    for (const tier of bonusTiers) {
      if (time >= tier.threshold) {
        return tier;
      }
    }
    // Default to the lowest tier if no match (should never happen due to 0 threshold in tiers)
    return bonusTiers[bonusTiers.length - 1];
  }, []);

  const handleAnswerSelect = useCallback((answer: string) => {
    if (!isButtonEnabled || !currentPlayer || !question) return;
    
    setIsButtonEnabled(false);
    setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    setIsAnswerChecked(true);
    // Store the current correct answer to prevent it from changing during transition
    setCurrentCorrectAnswer(question.correctAnswer);

    const responseTimeMs = (15 - localTime) * 1000;
    const responseTimeSec = responseTimeMs / 1000;

    let points = 0;
    let tier = null;
    
    if (correct) {
      // Base points: 10 points for correct answer
      points = 10;
      
      // Find applicable bonus tier
      tier = getBonusTier(localTime);
      points += tier.points;
      
      setCurrentBonusTier(tier);
    }
    
    setEarnedPoints(points);

    const currentScore = currentPlayer.score || 0;
    const newTotalScore = currentScore + points;

    submitAnswer(answer, localTime, points, newTotalScore);
    
    if (currentQuestion === questions.length - 1) {
      console.log('This was the last question!');
    }
  }, [currentPlayer, localTime, question, submitAnswer, isButtonEnabled, currentQuestion, questions.length, getBonusTier]);

  const handleTimeUp = useCallback(() => {
    if (!isAnswerChecked && isButtonEnabled && currentPlayer) {
      setIsButtonEnabled(false);
      setIsAnswerChecked(true);
      setIsCorrect(false);
      setEarnedPoints(0);
      
      const currentScore = currentPlayer.score || 0;
      submitAnswer('', 0, 0, currentScore);
    }
  }, [isAnswerChecked, submitAnswer, isButtonEnabled, currentPlayer]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isAnswerChecked && !isGameEnded && isButtonEnabled && question) {
      const startTime = Date.now();
      const interval = 50;

      timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newTime = Math.max(15 - elapsed, 0);
        
        setLocalTime(newTime);
        
        if (newTime <= 0) {
          clearInterval(timer);
          handleTimeUp();
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isAnswerChecked, handleTimeUp, isGameEnded, isButtonEnabled, question]);

  const getResponseTimeColor = (time: number) => {
    if (time < 3) return 'text-green-400';
    if (time < 7) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getTimerColor = (time: number) => {
    if (time > 10) return 'text-green-400';
    if (time > 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBonusTierColor = (tier: BonusTier) => {
    if (tier.points >= 5) return 'text-purple-400';
    if (tier.points >= 4) return 'text-blue-400';
    if (tier.points >= 3) return 'text-green-400';
    if (tier.points >= 2) return 'text-yellow-400';
    if (tier.points >= 1) return 'text-orange-400';
    return 'text-gray-400';
  };

  if (isGameEnded) {
    return (
      <div className="text-white text-center p-8 flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card p-8 max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4">Game completed!</h2>
          <p className="mb-4">Loading results...</p>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              className="h-2 bg-green-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }
  
  if (!question) {
    return (
      <div className="text-white text-center p-8 flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card p-8 max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="mb-4">Preparing questions</p>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              className="h-2 bg-blue-500 rounded-full w-1/2"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  const questionNumber = currentQuestion + 1;

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Navigation Confirmation Modal */}
      <AnimatePresence>
        {showNavConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Are you sure?
              </h3>
              <p className="text-gray-300 mb-6">
                Your current progress will be lost if you leave this game.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={cancelNavigation}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                >
                  Stay in Game
                </button>
                <button
                  onClick={() => confirmNavigation(showNavConfirm)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                >
                  Leave Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar with Navigation Buttons */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left side - Navigation buttons */}
          <div className="flex items-center gap-2">
            {/* Back to Category Button */}
            {onBackToCategory && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToCategory}
                className="flex items-center gap-1 px-3 py-1 bg-gray-700/50 hover:bg-gray-700 
                         rounded-lg text-white text-sm transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Categories</span>
              </motion.button>
            )}

            {/* Back to Home/Mode Button */}
            {onBackToMode && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToMode}
                className="flex items-center gap-1 px-3 py-1 bg-gray-700/50 hover:bg-gray-700 
                         rounded-lg text-white text-sm transition-colors group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Home</span>
              </motion.button>
            )}
          </div>
          
          {/* Middle - Centered title */}
          <div className="flex items-center justify-center gap-2 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`p-2 rounded-lg bg-gray-700/50 ${currentCategoryConfig.color}`}
            >
              <CategoryIcon className="w-6 h-6" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-white font-medium capitalize flex items-center gap-1 justify-center">
                {category} Quiz
                <span className="text-xl ml-1">{currentCategoryConfig.emoji}</span>
              </h2>
              <p className="text-sm text-gray-400">
                Question {questionNumber} of {questions.length}
              </p>
            </div>
          </div>
          
          {/* Right side - Scores and timer */}
          <div className="flex items-center gap-4">
            {isMultiplayer && (
              <div className="flex gap-2">
                {players.map((player) => (
                  <motion.div
                    key={player.id}
                    className={`px-3 py-1 rounded-full ${
                      player.id === currentPlayer?.id ? 'bg-green-600/20' : 'bg-gray-700/20'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-white font-medium">{player.score || 0}</span>
                    <span className="text-gray-400 text-sm ml-1">{player.username}</span>
                  </motion.div>
                ))}
              </div>
            )}
            
            <motion.div 
              className={`flex items-center gap-2 bg-gray-700/30 px-4 py-2 rounded-full ${getTimerColor(localTime)}`}
              animate={{
                scale: localTime <= 5 ? [1, 1.1, 1] : 1,
                transition: {
                  duration: 0.5,
                  repeat: localTime <= 5 ? Infinity : 0,
                  repeatType: "reverse"
                }
              }}
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              >
                <Clock className="w-5 h-5" />
              </motion.div>
              <span className="font-medium min-w-[4ch] text-right">
                {localTime.toFixed(2)}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container-game pt-20">
        <motion.div 
          className="card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <AnimatePresence mode="wait">
            <motion.h2
              key={question.question}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-2xl font-bold text-white mb-8"
            >
              {question.question}
            </motion.h2>
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestion}
              className="grid gap-4"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {question.options.map((option, index) => {
                let buttonClass = "p-4 rounded-xl text-left w-full transition-colors duration-300 ";
                
                if (!isAnswerChecked) {
                  buttonClass += "bg-gray-700 hover:bg-gray-600 text-white";
                } else if (option === question.correctAnswer) {
                  buttonClass += "bg-green-600 text-white";
                } else if (option === selectedAnswer) {
                  buttonClass += "bg-red-600 text-white";
                } else {
                  buttonClass += "bg-gray-700 text-gray-400";
                }

                return (
                  <motion.button
                    key={option}
                    custom={index}
                    variants={optionVariants}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={!isButtonEnabled}
                    className={buttonClass}
                    whileHover={isButtonEnabled ? {
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 400, damping: 10 }
                    } : {}}
                    whileTap={isButtonEnabled ? {
                      scale: 0.98,
                      transition: { type: "spring", stiffness: 400, damping: 10 }
                    } : {}}
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        color: isAnswerChecked 
                          ? option === question.correctAnswer 
                            ? "#10B981" 
                            : option === selectedAnswer 
                              ? "#EF4444"
                              : "#9CA3AF"
                          : "#FFFFFF"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {option}
                    </motion.div>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {isAnswerChecked && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 space-y-2"
              >
                <motion.div 
                  className={`flex items-center gap-2 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <Copy size={20} />
                  <span>
                    {isCorrect 
                      ? `Correct! +${earnedPoints} points` 
                      : `Wrong! The correct answer was ${currentCorrectAnswer || question.correctAnswer}`}
                  </span>
                </motion.div>
                
                {isCorrect && currentBonusTier && (
                  <motion.div 
                    className={`flex items-center gap-2 ${getBonusTierColor(currentBonusTier)}`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                  >
                    <span className="text-sm">
                      {currentBonusTier.emoji} {currentBonusTier.label} bonus: +{currentBonusTier.points} points
                    </span>
                  </motion.div>
                )}
                
                {lastResponseTime !== undefined && (
                  <motion.div 
                    className={`flex items-center gap-2 ${getResponseTimeColor(lastResponseTime)}`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                  >
                    <Clock size={16} />
                    <span className="text-sm">
                      Response time: {lastResponseTime.toFixed(2)}s
                      {totalResponseTime > 0 && ` (total ${totalResponseTime.toFixed(2)}s)`}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {isMultiplayer && (
          <div className="fixed bottom-4 right-4 flex flex-col items-end">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowChat(!showChat)}
              className="mb-2 p-3 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              {showChat ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>

            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="space-y-2"
                >
                  <div className="mb-2 w-64 card max-h-40 overflow-y-auto">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-2 text-sm ${
                          msg.playerId === currentPlayer?.id
                            ? 'text-green-400'
                            : 'text-white'
                        }`}
                      >
                        <span className="font-bold">{msg.playerName}:</span> {msg.message}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 w-64">
                    {quickChatMessages.map(({ emoji, text }) => (
                      <motion.button
                        key={text}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => currentPlayer && addChatMessage(currentPlayer.id, `${emoji} ${text}`)}
                        className="p-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        {emoji} {text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {!isMultiplayer && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center text-gray-300"
          >
            Score: <span className="text-green-500 font-bold">{currentPlayer?.score || 0}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizGame;