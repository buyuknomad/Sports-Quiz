// Updated QuizGame.tsx with improved last question handling and gameOver listener
import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useOneVsOneStore } from '../store/oneVsOneStore';
import { quickChatMessages } from '../constants/chat';
import {
  Trophy, Copy, MessageCircle, X, Clock, Target, Circle,
  Medal, Dumbbell, ArrowLeft, Home, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameMode, Category, Question } from '../types';
import { NavigationButton, ConfirmationDialog } from './navigation';
import { NAVIGATION_LABELS, CONFIRMATION_MESSAGES } from '../constants/navigation';
import NoIndexTag from './seo/NoIndexTag';

interface QuizGameProps {
  mode: GameMode;
  onBackToCategory?: () => void;
  onBackToMode?: () => void;
  onGameEnd?: () => void;
}

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
    transition: { delay: i * 0.1, type: "spring", stiffness: 100, damping: 10 }
  }),
  exit: { x: 20, opacity: 0 }
};

const QuizGame: React.FC<QuizGameProps> = ({ mode, onBackToCategory, onBackToMode, onGameEnd }) => {
  const soloStore = useGameStore();
  const multiStore = useOneVsOneStore();
  const store = mode === 'solo' ? soloStore : multiStore;

  const {
    currentQuestion, questions, category, players, chatMessages, addChatMessage,
    isGameEnded, submitAnswer, getCurrentPlayer, getPlayerResponseTimes,
    endGame, socket, gameId, resetGame
  } = store;

  // --- State Hooks ---
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [localTime, setLocalTime] = useState(15);
  const [showChat, setShowChat] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [currentBonusTier, setCurrentBonusTier] = useState<BonusTier | null>(null);
  const [endingTriggered, setEndingTriggered] = useState(false);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; type: 'category' | 'mode' | 'leave' | null; }>({ isOpen: false, type: null });
  
  // Flag to track if we're waiting for the server to end the game
  const [waitingForGameEnd, setWaitingForGameEnd] = useState(false);
  // New state for transition message during game ending
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);

  // --- Derived State ---
  const currentPlayer = getCurrentPlayer();
  const isHost = currentPlayer?.isHost;
  const question: Question | undefined = questions[currentQuestion]; // Explicitly type question
  const isMultiplayer = mode !== 'solo';
  const isLastQuestion = currentQuestion === questions.length - 1;

  // --- Add Game Over Socket Listener ---
  useEffect(() => {
    if (!socket || !isMultiplayer) return;
    
    const handleGameOver = (data: any) => {
      console.log('Game over event received in QuizGame component:', data);
      // Clear waiting state
      setWaitingForGameEnd(false);
      // Set transition message
      setTransitionMessage("Game complete! Loading results...");
    };
    
    // Add listener for gameOver event
    socket.on('gameOver', handleGameOver);
    
    // Clean up listener when component unmounts
    return () => {
      socket.off('gameOver', handleGameOver);
    };
  }, [socket, isMultiplayer]);

  // --- Helper Callbacks ---
  const getBonusTier = useCallback((time: number): BonusTier => {
    for (const tier of bonusTiers) { if (time >= tier.threshold) return tier; }
    return bonusTiers[bonusTiers.length - 1];
  }, []);

  const handleAnswerSelect = useCallback((answer: string) => {
    if (!isButtonEnabled || !currentPlayer || !question) return;
    setIsButtonEnabled(false); setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct); setIsAnswerChecked(true); setCurrentCorrectAnswer(question.correctAnswer);
    const responseTimeSec = 15 - localTime;
    let points = 0; let tier = null;
    if (correct) { points = 10; tier = getBonusTier(localTime); points += tier.points; setCurrentBonusTier(tier); }
    setEarnedPoints(points);
    const currentScore = currentPlayer.score || 0;
    const newTotalScore = currentScore + points;
    submitAnswer(answer, localTime, points, newTotalScore);
    
    // Set waiting message for the last question in multiplayer mode
    if (currentQuestion === questions.length - 1 && isMultiplayer) {
      console.log('This was the last question! Waiting for server to end the game.');
      setWaitingForGameEnd(true);
      setTransitionMessage("Waiting for other player to answer the final question...");
    }
  }, [currentPlayer, localTime, question, submitAnswer, isButtonEnabled, currentQuestion, questions.length, getBonusTier, isMultiplayer]);

  const handleTimeUp = useCallback(() => {
    if (isButtonEnabled && !isAnswerChecked && currentPlayer && question) {
      console.log("Time is up!");
      setIsButtonEnabled(false); setIsAnswerChecked(true); setIsCorrect(false); setEarnedPoints(0); setCurrentCorrectAnswer(question.correctAnswer);
      const currentScore = currentPlayer.score || 0;
      submitAnswer('', 0, 0, currentScore);
      
      // Set waiting message for the last question in multiplayer mode
      if (currentQuestion === questions.length - 1 && isMultiplayer) {
        console.log('Last question time up! Waiting for server to end the game.');
        setWaitingForGameEnd(true);
        setTransitionMessage("Waiting for other player to answer the final question...");
      }
    }
  }, [isButtonEnabled, isAnswerChecked, submitAnswer, currentPlayer, question, currentQuestion, questions.length, isMultiplayer]);


  // --- SEO Metadata Effects (Split) ---
  useEffect(() => {
    const modeText = mode === 'solo' ? 'Solo Quiz' : '1v1 Battle';
    document.title = `SportIQ Game - ${modeText}`;
    return () => {
      document.title = 'SportIQ - Test Your Sports Knowledge in Quiz Battles';
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', 'Challenge your sports knowledge in solo mode or compete against friends in real-time 1v1 battles across football, basketball, tennis, and Olympics categories.');
    };
  }, [mode]);

  useEffect(() => {
    if (!category || category === 'mixed') return;
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    const modeText = mode === 'solo' ? 'Solo Quiz' : '1v1 Battle';
    const newTitle = `${categoryName} ${modeText} - SportIQ`;
    const newDescription = `Test your ${category} knowledge in this ${mode === 'solo' ? 'solo practice' : 'multiplayer challenge'} quiz. Answer questions, earn points and compete for the highest score!`;
    document.title = newTitle;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', newDescription);
    const ogTitle = document.querySelector('meta[property="og:title"]'); if (ogTitle) ogTitle.setAttribute('content', newTitle);
    const twitterTitle = document.querySelector('meta[property="twitter:title"]'); if (twitterTitle) twitterTitle.setAttribute('content', newTitle);
    const ogDesc = document.querySelector('meta[property="og:description"]'); if (ogDesc) ogDesc.setAttribute('content', newDescription);
    const twitterDesc = document.querySelector('meta[property="twitter:description"]'); if (twitterDesc) twitterDesc.setAttribute('content', newDescription);
  }, [category]);

  // --- Other Effects ---
  useEffect(() => { console.log('QuizGame component mounted for mode:', mode); return () => { console.log('QuizGame component unmounting'); }; }, [mode]);

  // Monitor question changes
  useEffect(() => {
    if (question) {
      console.log(`Current question (${currentQuestion}):`, question.question.substring(0, 30) + '...');
    } else {
      console.log('No question available yet');
    }
  }, [question, currentQuestion]);

  // FIXED: Solo mode game ending - only trigger for solo mode, never for multiplayer
  useEffect(() => {
    // Only for solo mode, never trigger manual game end for multiplayer
    if (mode === 'solo' && isLastQuestion && isAnswerChecked && !endingTriggered && !isGameEnded && onGameEnd) {
      const timer = setTimeout(() => { 
        setEndingTriggered(true);
        onGameEnd();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isLastQuestion, isAnswerChecked, endingTriggered, isGameEnded, onGameEnd, mode]);

  useEffect(() => {
    if (question) {
      setIsButtonEnabled(true); setSelectedAnswer(null); setIsAnswerChecked(false); setIsCorrect(false);
      setLocalTime(15); setEarnedPoints(0); setCurrentBonusTier(null); setCurrentCorrectAnswer(null);
      // Reset waiting flag and transition message when new question is loaded
      setWaitingForGameEnd(false);
      setTransitionMessage(null);
    }
  }, [currentQuestion, question]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined = undefined;
    if (!isAnswerChecked && !isGameEnded && isButtonEnabled && question) {
      const startTime = Date.now(); const interval = 50;
      timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000; const newTime = Math.max(15 - elapsed, 0);
        setLocalTime(newTime);
        if (newTime <= 0) { if (timer) clearInterval(timer); handleTimeUp(); }
      }, interval);
      return () => { if (timer) clearInterval(timer); };
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isAnswerChecked, handleTimeUp, isGameEnded, isButtonEnabled, question]);


  // --- Navigation Handlers ---
  const handleBackToCategory = () => setConfirmDialog({ isOpen: true, type: 'category' });
  const handleBackToMode = () => setConfirmDialog({ isOpen: true, type: 'mode' });
  const handleLeaveGame = () => setConfirmDialog({ isOpen: true, type: 'leave' });
  const handleConfirmNavigation = () => {
    if (isMultiplayer && socket?.connected) { socket.emit('leaveGame', { gameId, isHost: isHost || false }); resetGame(true); }
    else if (!isMultiplayer) { resetGame(); }
    if (confirmDialog.type === 'category' && onBackToCategory) onBackToCategory();
    else if ((confirmDialog.type === 'mode' || confirmDialog.type === 'leave') && onBackToMode) onBackToMode();
    setConfirmDialog({ isOpen: false, type: null });
  };

  // --- Helper Functions ---
  const getTimerColor = (time: number): string => {
    if (time > 10) return 'text-green-400';
    if (time > 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBonusTierColor = (tier: BonusTier | null): string => {
    if (!tier) return 'text-gray-400';
    if (tier.points >= 5) return 'text-purple-400';
    if (tier.points >= 4) return 'text-blue-400';
    if (tier.points >= 3) return 'text-green-400';
    if (tier.points >= 2) return 'text-yellow-400';
    if (tier.points >= 1) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getResponseTimeColor = (responseTime: number): string => { // responseTime is time TAKEN (0-15)
    if (responseTime < 5) return 'text-green-400';   // < 5s
    if (responseTime < 10) return 'text-yellow-400'; // 5s to 10s
    return 'text-orange-400'; // > 10s
  };


  // --- Loading / Ended States ---
  if (isGameEnded) {
    return (
      <div className="text-white text-center p-8 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0c1220] to-[#1a1a2e]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Game completed!</h2><p className="mb-4 text-gray-400">Loading results...</p><div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden"><motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1 }} className="h-2 bg-green-500 rounded-full"/></div>
        </motion.div>
      </div>
    );
  }
  // IMPORTANT: Access 'question' only AFTER this check
  if (!question) {
    return (
      <div className="text-white text-center p-8 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0c1220] to-[#1a1a2e]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2><p className="mb-4 text-gray-400">Preparing questions</p><div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden"><motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="h-2 bg-blue-500 rounded-full w-1/2"/></div>
        </motion.div>
      </div>
    );
  }

  // --- Prepare Data for Render (AFTER loading checks) ---
  const questionNumber = currentQuestion + 1;
  const currentPlayerResponseTimes = currentPlayer ? getPlayerResponseTimes(currentPlayer.id) : [];
  const lastResponseTimeRaw = currentPlayerResponseTimes[currentPlayerResponseTimes.length - 1]; // This is time TAKEN
  const lastResponseTimeDisplay = lastResponseTimeRaw !== undefined ? lastResponseTimeRaw.toFixed(1) : '-'; // Display time TAKEN


  // --- Category Icon Logic (Just before return) ---
  const categoryConfig = {
    football: { icon: Trophy, emoji: '⚽', color: 'text-yellow-400' },
    basketball: { icon: Target, emoji: '🏀', color: 'text-orange-400' },
    tennis: { icon: Circle, emoji: '🎾', color: 'text-green-400' },
    olympics: { icon: Medal, emoji: '🏅', color: 'text-blue-400' },
    mixed: { icon: Dumbbell, emoji: '🎯', color: 'text-purple-400' }
  };
  const currentCategoryConfig = (category && categoryConfig[category as keyof typeof categoryConfig]) || categoryConfig.mixed;
  if (!currentCategoryConfig) {
    return <div className="text-red-500 p-8 text-center min-h-screen flex items-center justify-center">Error state: Cannot load category configuration.</div>;
  }
  const CategoryIcon = currentCategoryConfig.icon;


  // --- MAIN RETURN ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1220] to-[#1a1a2e] p-4 text-white">
      {/* SEO NoIndex Tag */}
      <NoIndexTag noIndex={true} canonicalUrl={`https://sportiq.games/game${category ? `/${category}` : ''}`} />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirmNavigation}
        onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
        title="Are you sure?"
        message={isMultiplayer && isHost ? CONFIRMATION_MESSAGES.HOST_LEAVE : CONFIRMATION_MESSAGES.LEAVE_GAME}
        confirmText={confirmDialog.type === 'category' ? NAVIGATION_LABELS.CATEGORIES : confirmDialog.type === 'leave' ? "Leave Game" : NAVIGATION_LABELS.MODES}
        cancelText={NAVIGATION_LABELS.STAY}
      />

      {/* Header Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 z-40 h-16" // Fixed height
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between relative">
           {/* Left side spacer */}
           <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3 w-auto h-full">
             {/* Reserved space */}
           </div>

           {/* Centered title */}
           <div className="flex-grow flex items-center justify-center gap-2 text-center px-16">
            <motion.div whileHover={{ scale: 1.1, rotate: 360 }} transition={{ duration: 0.5 }} className={`p-1.5 rounded-lg bg-gray-700/50 ${currentCategoryConfig.color}`} >
              <CategoryIcon className="w-5 h-5" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-sm sm:text-base font-medium capitalize flex items-center gap-1 justify-center">
                {category || 'Game'} Quiz
                <span className="text-lg sm:text-xl ml-1">{currentCategoryConfig.emoji}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Question {questionNumber} of {questions.length}
              </p>
            </div>
           </div>

           {/* Right side - Scores and timer */}
           <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 sm:gap-4">
            {isMultiplayer && (
              <div className="hidden md:flex gap-2"> {/* Scores hidden on small screens */}
                {players.map((player) => (
                  <motion.div
                    key={player.id}
                    className={`px-2 sm:px-3 py-1 rounded-full ${ player.id === currentPlayer?.id ? 'bg-green-600/20 text-green-300 border border-green-500/30' : 'bg-gray-700/20 text-gray-400 border border-transparent' }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className={`font-semibold text-xs sm:text-sm ${player.id === currentPlayer?.id ? 'text-white' : ''}`}>{player.score || 0}</span>
                    <span className="text-xs sm:text-sm ml-1">{player.username.substring(0, 6)}{player.username.length > 6 ? '..' : ''}</span>
                  </motion.div>
                ))}
              </div>
            )}
            <motion.div
              className={`flex items-center gap-1 sm:gap-2 bg-gray-700/30 px-2.5 sm:px-4 py-1.5 rounded-full ${getTimerColor(localTime)}`}
              animate={{ scale: localTime <= 5 ? [1, 1.05, 1] : 1, transition: { duration: 0.5, repeat: localTime <= 5 ? Infinity : 0, repeatType: "reverse" } }}
            >
              <motion.div animate={{ rotate: 360, transition: { duration: 2, repeat: Infinity, ease: "linear" } }} >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
              <span className="font-semibold text-sm sm:text-base min-w-[3ch] sm:min-w-[4ch] text-right">
                {localTime.toFixed(1)}
              </span>
            </motion.div>
           </div>
        </div>
      </motion.div>

      {/* Navigation Buttons (Absolutely Positioned) */}
      {isMultiplayer ? (
          <div className="fixed bottom-6 left-6 z-50">
            <NavigationButton icon={LogOut} label="Leave Game" onClick={handleLeaveGame} />
          </div>
      ) : (
          <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
            {onBackToCategory && <NavigationButton icon={ArrowLeft} label={NAVIGATION_LABELS.CATEGORIES} onClick={handleBackToCategory} />}
            {onBackToMode && <NavigationButton icon={Home} label={NAVIGATION_LABELS.MODES} onClick={handleBackToMode} delay={0.1} />}
          </div>
      )}

      {/* Host Indicator (Absolutely Positioned below header) */}
      {isMultiplayer && isHost && (
          <div className="fixed top-[calc(theme(spacing.16)+theme(spacing.2))] right-4 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400 flex items-center gap-1 z-30">
              <Trophy size={12} /> Host
          </div>
      )}


      {/* Main Game Area */}
      <div className="container mx-auto max-w-2xl pt-20 sm:pt-24 pb-24 flex flex-col items-center">
        {/* Waiting or Transition Message */}
        {isMultiplayer && isLastQuestion && isAnswerChecked && transitionMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg text-center"
          >
            <p>{transitionMessage}</p>
          </motion.div>
        )}

        <motion.div
          className="card w-full p-6 md:p-8 bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={question.question} // Use question text as key for animation
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xl md:text-2xl font-bold text-white mb-8 text-center leading-tight"
            >
              {question.question}
            </motion.h2>
          </AnimatePresence>

          {/* Options */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion} // Animate options container based on question index
              className="grid grid-cols-1 md:grid-cols-2 gap-4" // Responsive grid
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {question.options.map((option, index) => {
                  let buttonClass = "p-4 rounded-xl text-left w-full transition-all duration-300 text-base md:text-lg font-medium border-2 border-transparent ";

                  if (!isAnswerChecked) {
                      buttonClass += "bg-gray-700/80 hover:bg-gray-600/80 hover:border-blue-500 text-white";
                  } else {
                      buttonClass += "transform scale-100 ";
                      if (option === currentCorrectAnswer) {
                          buttonClass += "bg-green-600 text-white border-green-400 shadow-lg";
                      } else if (option === selectedAnswer) {
                          buttonClass += "bg-red-600 text-white border-red-400 opacity-80";
                      } else {
                          buttonClass += "bg-gray-700/50 text-gray-400 opacity-60";
                      }
                  }

                  return (
                      <motion.button
                          key={`${currentQuestion}-${option}`}
                          custom={index}
                          variants={optionVariants}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={!isButtonEnabled || isAnswerChecked}
                          className={buttonClass}
                          whileHover={isButtonEnabled && !isAnswerChecked ? { scale: 1.03, y: -2, transition: { type: "spring", stiffness: 400, damping: 10 } } : {}}
                          whileTap={isButtonEnabled && !isAnswerChecked ? { scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 10 } } : {}}
                      >
                          {option}
                      </motion.button>
                  );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Feedback Area */}
          <AnimatePresence>
            {isAnswerChecked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto', transition: { delay: 0.2, duration: 0.3 } }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                className="mt-6 space-y-2 text-center text-sm overflow-hidden"
              >
                {/* Correct/Incorrect Feedback */}
                <motion.div
                  className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
                  initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  {isCorrect ? `Correct! +${earnedPoints} points` : `Wrong! Correct answer: ${currentCorrectAnswer}`}
                </motion.div>

                {/* Bonus Tier Feedback */}
                {isCorrect && currentBonusTier && (
                  <motion.div
                    className={`${getBonusTierColor(currentBonusTier)}`}
                    initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                  >
                    {currentBonusTier.emoji} {currentBonusTier.label} bonus: +{currentBonusTier.points} points
                  </motion.div>
                )}

                {/* Response Time Feedback */}
                {selectedAnswer && lastResponseTimeRaw !== undefined && (
                   <motion.div
                      // Use raw time (time taken) for color logic
                      className={`${getResponseTimeColor(lastResponseTimeRaw)} flex items-center justify-center gap-1`}
                      initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                    >
                      <Clock size={14} />
                      {/* Display formatted time taken */}
                      <span>Response time: {lastResponseTimeDisplay}s</span>
                  </motion.div>
                )}
                {/* Feedback for Timeout */}
                {!selectedAnswer && isAnswerChecked && (
                    <motion.div
                      className={`text-red-400 flex items-center justify-center gap-1`}
                      initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                    >
                       <Clock size={14} />
                       <span>Time's up!</span>
                   </motion.div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Solo Score Display */}
        {!isMultiplayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
            className="mt-6 text-center text-gray-300 font-semibold"
          >
            Score: <span className="text-green-400 text-lg">{currentPlayer?.score || 0}</span>
          </motion.div>
        )}
      </div>

      {/* Chat Area (Multiplayer Only) */}
      {isMultiplayer && (
          <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
              <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setShowChat(!showChat)}
                  className="mb-2 p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-colors"
                  aria-label={showChat ? "Close Chat" : "Open Chat"}
              >
                  {showChat ? <X size={24} /> : <MessageCircle size={24} />}
              </motion.button>

              <AnimatePresence>
                  {showChat && (
                      <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="space-y-2"
                      >
                          {/* Chat History */}
                          <div className="mb-2 w-64 h-40 card p-3 overflow-y-auto bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-inner">
                              {chatMessages.length === 0 && <p className="text-gray-400 text-sm text-center italic h-full flex items-center justify-center">No messages yet.</p>}
                              {chatMessages.map((msg) => (
                                  <div key={msg.id} className={`mb-1 text-sm break-words ${msg.playerId === currentPlayer?.id ? 'text-green-300 text-right' : 'text-gray-200 text-left'}`}>
                                      {msg.playerId !== currentPlayer?.id && <span className="font-semibold mr-1">{msg.playerName}:</span>}
                                      {msg.message}
                                  </div>
                              ))}
                          </div>

                          {/* Quick Chat Buttons */}
                          <div className="grid grid-cols-2 gap-2 w-64">
                              {quickChatMessages.map(({ emoji, text }) => (
                                  <motion.button
                                      key={text} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                      onClick={() => currentPlayer && addChatMessage(currentPlayer.id, `${emoji} ${text}`)}
                                      className="p-2 text-xs sm:text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
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

    </div> // End Main Div
  );
};

export default QuizGame;
