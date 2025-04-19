// src/components/QuizGame.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useOneVsOneStore } from '../store/oneVsOneStore';
import { quickChatMessages } from '../constants/chat';
import {
  Trophy, Copy, MessageCircle, X, Clock, Target, Circle,
  Medal, Dumbbell, ArrowLeft, Home, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameMode, Category } from '../types'; // Ensure Category is imported if not already
import { NavigationButton, ConfirmationDialog } from './navigation';
import { NAVIGATION_LABELS, CONFIRMATION_MESSAGES } from '../constants/navigation';
import NoIndexTag from './seo/NoIndexTag';

interface QuizGameProps {
  mode: GameMode;
  onBackToCategory?: () => void;
  onBackToMode?: () => void;
  onGameEnd?: () => void; // New prop for handling game end
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

const QuizGame: React.FC<QuizGameProps> = ({ mode, onBackToCategory, onBackToMode, onGameEnd }) => {
  const soloStore = useGameStore();
  const multiStore = useOneVsOneStore();
  const store = mode === 'solo' ? soloStore : multiStore;

  const {
    currentQuestion,
    questions,
    category, // Still get category from the store
    players,
    chatMessages,
    addChatMessage,
    isGameEnded,
    submitAnswer,
    getCurrentPlayer,
    getPlayerResponseTimes,
    endGame,
    socket,
    gameId,
    resetGame
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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'category' | 'mode' | 'leave' | null;
  }>({ isOpen: false, type: null });

  // --- Derived State ---
  const currentPlayer = getCurrentPlayer();
  const isHost = currentPlayer?.isHost;
  const question = questions[currentQuestion];
  const isMultiplayer = mode !== 'solo';
  const isLastQuestion = currentQuestion === questions.length - 1;

  // --- SEO Metadata Effects (Split) ---

  // Effect 1: Handles mode-based titles and cleanup (depends only on mode)
  useEffect(() => {
    // Set a base title based on mode
    const modeText = mode === 'solo' ? 'Solo Quiz' : '1v1 Battle';
    // Set a more generic title initially, category effect will override if possible
    document.title = `SportIQ Game - ${modeText}`; 

    // You could set a generic mode-based description here too if desired

    // Cleanup function: Reset metadata when mode changes or component unmounts
    return () => {
      console.log("Resetting metadata on mode change / unmount");
      // Reset to default title
      document.title = 'SportIQ - Test Your Sports Knowledge in Quiz Battles';

      // Reset meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Challenge your sports knowledge in solo mode or compete against friends in real-time 1v1 battles across football, basketball, tennis, and Olympics categories.');
      }
      // Reset OG/Twitter tags if needed (optional)
    };
  }, [mode]); // <-- Depends only on mode

  // Effect 2: Handles category-specific titles/descriptions (depends only on category)
  useEffect(() => {
    // Only run if category is valid
    if (!category || category === 'mixed') { // Also skip for 'mixed' if it should use default
        console.log("Category effect: Skipping update for null or mixed category");
        // Optionally reset to mode-specific title if needed, or let Effect 1 handle it
        // const modeText = mode === 'solo' ? 'Solo Quiz' : '1v1 Battle';
        // document.title = `SportIQ Game - ${modeText}`; 
        return; 
    }

    console.log("Category effect: Updating metadata for category:", category);
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    const modeText = mode === 'solo' ? 'Solo Quiz' : '1v1 Battle';
    const newTitle = `${categoryName} ${modeText} - SportIQ`;
    const newDescription = `Test your ${category} knowledge in this ${mode === 'solo' ? 'solo practice' : 'multiplayer challenge'} quiz. Answer questions, earn points and compete for the highest score!`;

    // Update document title
    document.title = newTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', newDescription);
    }

    // Update Open Graph titles and descriptions
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (ogTitle) ogTitle.setAttribute('content', newTitle);
    if (twitterTitle) twitterTitle.setAttribute('content', newTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    const twitterDesc = document.querySelector('meta[property="twitter:description"]');
    if (ogDesc) ogDesc.setAttribute('content', newDescription);
    if (twitterDesc) twitterDesc.setAttribute('content', newDescription);

  }, [category]); // <-- Depends only on category (and mode implicitly via prop access)

  // --- Other Effects ---

  // Log component mounting
  useEffect(() => {
    console.log('QuizGame component mounted for mode:', mode);
    return () => {
      console.log('QuizGame component unmounting');
    };
  }, [mode]); // Keep this dependency on mode

  // Effect to handle game ending when the last question is answered
  useEffect(() => {
    if (!isLastQuestion || !isAnswerChecked || endingTriggered || isGameEnded || !onGameEnd) {
      return;
    }
    console.log('Last question answered, preparing to end game');
    const timer = setTimeout(() => {
      console.log('Triggering game end after last question');
      setEndingTriggered(true);
      onGameEnd();
    }, 2500); // Wait for answer feedback
    return () => clearTimeout(timer);
  }, [isLastQuestion, isAnswerChecked, endingTriggered, isGameEnded, onGameEnd]);

  // Effect to reset state when question changes
  useEffect(() => {
    if (question) {
      console.log('Question changed, resetting state for question:', currentQuestion);
      setIsButtonEnabled(true);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsCorrect(false);
      setLocalTime(15);
      setEarnedPoints(0);
      setCurrentBonusTier(null);
      setCurrentCorrectAnswer(null);
    } else {
        console.log("Question changed, but no question data available yet.");
    }
  }, [currentQuestion, question]); // Keep dependency on question if available

  // Effect for timer logic
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
  }, [isAnswerChecked, handleTimeUp, isGameEnded, isButtonEnabled, question]); // Keep dependencies

  // --- Callbacks ---

  const getBonusTier = useCallback((time: number): BonusTier => {
    for (const tier of bonusTiers) {
      if (time >= tier.threshold) return tier;
    }
    return bonusTiers[bonusTiers.length - 1];
  }, []); // No dependencies needed

  const handleAnswerSelect = useCallback((answer: string) => {
    if (!isButtonEnabled || !currentPlayer || !question) return;

    setIsButtonEnabled(false);
    setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    setIsAnswerChecked(true);
    setCurrentCorrectAnswer(question.correctAnswer); // Store correct answer for display

    const responseTimeSec = 15 - localTime; // Already in seconds
    let points = 0;
    let tier = null;

    if (correct) {
      points = 10; // Base points
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
    if (!isAnswerChecked && isButtonEnabled && currentPlayer && question) { // Added question check
        console.log("Time is up!");
        setIsButtonEnabled(false);
        setIsAnswerChecked(true);
        setIsCorrect(false);
        setEarnedPoints(0);
        setCurrentCorrectAnswer(question.correctAnswer); // Store correct answer for display

        const currentScore = currentPlayer.score || 0;
        submitAnswer('', 0, 0, currentScore); // Submit empty answer, 0 time left, 0 points
    }
  }, [isAnswerChecked, submitAnswer, isButtonEnabled, currentPlayer, question]); // Added question dependency


  // --- Navigation Handlers ---
  const handleBackToCategory = () => setConfirmDialog({ isOpen: true, type: 'category' });
  const handleBackToMode = () => setConfirmDialog({ isOpen: true, type: 'mode' });
  const handleLeaveGame = () => setConfirmDialog({ isOpen: true, type: 'leave' });

  const handleConfirmNavigation = () => {
    if (isMultiplayer && socket?.connected) {
      console.log('Multiplayer mode: notifying server about leaving the game');
      socket.emit('leaveGame', { gameId, isHost: isHost || false });
      resetGame(true); // Disconnect socket on leave for multiplayer
    } else if (!isMultiplayer) {
        resetGame(); // Reset solo game state
    }

    // Navigate based on dialog type
    if (confirmDialog.type === 'category' && onBackToCategory) onBackToCategory();
    else if ((confirmDialog.type === 'mode' || confirmDialog.type === 'leave') && onBackToMode) onBackToMode();

    setConfirmDialog({ isOpen: false, type: null });
  };

  // --- Helper Functions ---
  const getTimerColor = (time: number) => {
    if (time > 10) return 'text-green-400';
    if (time > 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBonusTierColor = (tier: BonusTier | null) => {
    if (!tier) return 'text-gray-400';
    if (tier.points >= 5) return 'text-purple-400';
    if (tier.points >= 4) return 'text-blue-400';
    if (tier.points >= 3) return 'text-green-400';
    if (tier.points >= 2) return 'text-yellow-400';
    if (tier.points >= 1) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 3) return 'text-green-400'; // Less than 3 seconds
    if (time < 7) return 'text-yellow-400'; // 3 to 7 seconds
    return 'text-orange-400'; // More than 7 seconds
  };

  // --- Category Icon Logic ---
  const categoryConfig = {
    football: { icon: Trophy, emoji: '⚽', color: 'text-yellow-400' },
    basketball: { icon: Target, emoji: '🏀', color: 'text-orange-400' },
    tennis: { icon: Circle, emoji: '🎾', color: 'text-green-400' },
    olympics: { icon: Medal, emoji: '🏅', color: 'text-blue-400' },
    mixed: { icon: Dumbbell, emoji: '🎯', color: 'text-purple-400' }
  };
  const currentCategoryConfig = category ? categoryConfig[category] : categoryConfig.mixed; // Handle null category
  const CategoryIcon = currentCategoryConfig.icon;


  // --- Loading / Ended States ---
  // --- Loading / Ended States ---
  if (isGameEnded) {
    // Replace the comment with the actual loading JSX
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
    // Replace the comment with the actual loading JSX
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
                className="h-2 bg-blue-500 rounded-full w-1/2" // Or adjust progress animation if needed
              />
            </div>
          </motion.div>
        </div>
      );
  }

  // --- Render Logic ---
  const questionNumber = currentQuestion + 1;
  const currentPlayerResponseTimes = currentPlayer ? getPlayerResponseTimes(currentPlayer.id) : [];
  const lastResponseTime = currentPlayerResponseTimes[currentPlayerResponseTimes.length - 1];
  const totalResponseTime = currentPlayerResponseTimes.reduce((sum, time) => sum + time, 0);


  return (
    // --- Main JSX Structure ---
    <div className="min-h-screen bg-background p-4">
      {/* SEO NoIndex Tag */}
      <NoIndexTag noIndex={true} canonicalUrl={`https://sportiq.games/game${category ? `/${category}` : ''}`} />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirmNavigation}
        onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
        title="Are you sure?"
        message={isMultiplayer && isHost
          ? CONFIRMATION_MESSAGES.HOST_LEAVE
          : CONFIRMATION_MESSAGES.LEAVE_GAME}
        confirmText={confirmDialog.type === 'category'
          ? NAVIGATION_LABELS.CATEGORIES
          : confirmDialog.type === 'leave'
            ? "Leave Game"
            : NAVIGATION_LABELS.MODES}
        cancelText={NAVIGATION_LABELS.STAY}
      />

      {/* Header Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 z-40"
      >
        {/* ... existing header bar JSX ... */}
        {/* Centered title */}
        <div className="flex items-center justify-center gap-2 mx-auto">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
            className={`p-2 rounded-lg bg-gray-700/50 ${currentCategoryConfig.color}`}
          >
            <CategoryIcon className="w-6 h-6" />
          </motion.div>
          <div className="text-center">
            <h2 className="text-white font-medium capitalize flex items-center gap-1 justify-center">
              {category || 'Game'} Quiz {/* Show 'Game' if category is null */}
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
                    player.id === currentPlayer?.id ? 'bg-green-600/20 text-green-300' : 'bg-gray-700/20 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className={`font-medium ${player.id === currentPlayer?.id ? 'text-white' : ''}`}>{player.score || 0}</span>
                  <span className="text-sm ml-1">{player.username.substring(0, 8)}{player.username.length > 8 ? '...' : ''}</span> {/* Truncate name */}
                </motion.div>
              ))}
            </div>
          )}

          {/* Timer */}
          <motion.div
            className={`flex items-center gap-2 bg-gray-700/30 px-4 py-2 rounded-full ${getTimerColor(localTime)}`}
            animate={{
              scale: localTime <= 5 ? [1, 1.1, 1] : 1,
              transition: { duration: 0.5, repeat: localTime <= 5 ? Infinity : 0, repeatType: "reverse" }
            }}
          >
             {/* ... existing timer icon and value ... */}
              <motion.div
                animate={{ rotate: 360, transition: { duration: 2, repeat: Infinity, ease: "linear" } }}
              >
                <Clock className="w-5 h-5" />
              </motion.div>
              <span className="font-medium min-w-[4ch] text-right">
                {localTime.toFixed(1)} {/* Show 1 decimal */}
              </span>
          </motion.div>
        </div>

      </motion.div>

      {/* Navigation Buttons */}
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

      {/* Host Indicator */}
      {isMultiplayer && isHost && (
          <div className="fixed top-4 right-4 px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-400 flex items-center gap-1 z-50">
              <Trophy size={14} /> Host
          </div>
      )}

      {/* Main Game Area */}
      <div className="container mx-auto max-w-2xl pt-24 pb-24 flex flex-col items-center"> {/* Adjusted padding */}
        <motion.div
          className="card w-full p-6 md:p-8" // Added padding
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
              className="text-xl md:text-2xl font-bold text-white mb-8 text-center" // Centered text
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
                let buttonClass = "p-4 rounded-xl text-left w-full transition-all duration-300 text-base md:text-lg "; // Base classes

                if (!isAnswerChecked) {
                  buttonClass += "bg-gray-700 hover:bg-gray-600 text-white"; // Default state
                } else {
                  // Answer checked state
                    buttonClass += "transform scale-100 "; // Prevent hover scale when checked
                  if (option === currentCorrectAnswer) { // Use stored correct answer
                    buttonClass += "bg-green-600 text-white border-2 border-green-400 shadow-lg"; // Correct answer style
                  } else if (option === selectedAnswer) {
                    buttonClass += "bg-red-600 text-white border-2 border-red-400 opacity-80"; // Incorrect selected answer style
                  } else {
                    buttonClass += "bg-gray-700 text-gray-400 opacity-60"; // Other options style
                  }
                }

                return (
                  <motion.button
                    key={`${currentQuestion}-${option}`} // More specific key
                    custom={index}
                    variants={optionVariants}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={!isButtonEnabled || isAnswerChecked} // Disable after answer checked
                    className={buttonClass}
                    whileHover={isButtonEnabled && !isAnswerChecked ? { scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 10 } } : {}}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 space-y-2 text-center text-sm" // Centered feedback
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
                {lastResponseTime !== undefined && (
                  <motion.div
                    className={`${getResponseTimeColor(15 - lastResponseTime)} flex items-center justify-center gap-1`} // Use remaining time for color
                        initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                    >
                    <Clock size={14} />
                    <span>Response time: {(15-lastResponseTime).toFixed(1)}s</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Solo Score Display (if not multiplayer) */}
        {!isMultiplayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
            className="mt-6 text-center text-gray-300 font-semibold"
          >
            Score: <span className="text-green-400">{currentPlayer?.score || 0}</span>
          </motion.div>
        )}

      </div> {/* End Main Game Area */}


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
                          <div className="mb-2 w-64 h-40 card p-3 overflow-y-auto bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg">
                              {chatMessages.length === 0 && <p className="text-gray-400 text-sm text-center italic">No messages yet.</p>}
                              {chatMessages.map((msg) => (
                                  <div key={msg.id} className={`mb-1 text-sm ${msg.playerId === currentPlayer?.id ? 'text-green-300' : 'text-gray-200'}`}>
                                      <span className="font-semibold">{msg.playerName}:</span> {msg.message}
                                  </div>
                              ))}
                          </div>

                          {/* Quick Chat Buttons */}
                          <div className="grid grid-cols-2 gap-2 w-64">
                              {quickChatMessages.map(({ emoji, text }) => (
                                  <motion.button
                                      key={text} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                      onClick={() => currentPlayer && addChatMessage(currentPlayer.id, `${emoji} ${text}`)}
                                      className="p-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
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
