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
    category,
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

  // --- Helper Callbacks (Moved Before Effects) ---
  const getBonusTier = useCallback(/* ... */);
  const handleAnswerSelect = useCallback(/* ... */);
  const handleTimeUp = useCallback(/* ... */);

  // --- SEO Metadata Effects (Split) ---
  useEffect(() => { /* ... Effect 1 (mode) ... */ }, [mode]);
  useEffect(() => { /* ... Effect 2 (category) ... */ }, [category]);

  // --- Other Effects ---
  useEffect(() => { /* ... Log component mount ... */ }, [mode]);
  useEffect(() => { /* ... Handle game end ... */ }, [isLastQuestion, isAnswerChecked, endingTriggered, isGameEnded, onGameEnd]);
  useEffect(() => { /* ... Reset state on question change ... */ }, [currentQuestion, question]);
  useEffect(() => { /* ... Timer logic ... */ }, [isAnswerChecked, handleTimeUp, isGameEnded, isButtonEnabled, question]);

  // --- Navigation Handlers ---
  const handleBackToCategory = () => setConfirmDialog({ isOpen: true, type: 'category' });
  const handleBackToMode = () => setConfirmDialog({ isOpen: true, type: 'mode' });
  const handleLeaveGame = () => setConfirmDialog({ isOpen: true, type: 'leave' });
  const handleConfirmNavigation = () => { /* ... */ };

  // --- Helper Functions ---
  const getTimerColor = (time: number): string => { /* ... */ };
  const getBonusTierColor = (tier: BonusTier | null): string => { /* ... */ };
  const getResponseTimeColor = (time: number): string => { /* ... */ };


  // --- Loading / Ended States ---
  if (isGameEnded) {
    return ( /* ... Game Ended JSX ... */ );
  }
  // Check if questions are loaded, return loading if not
  // IMPORTANT: Access 'question' only AFTER this check
  if (!question) {
    return ( /* ... Loading Questions JSX ... */ );
  }

  // --- Prepare Data for Render (AFTER loading checks) ---
  const questionNumber = currentQuestion + 1;
  const currentPlayerResponseTimes = currentPlayer ? getPlayerResponseTimes(currentPlayer.id) : [];
  const lastResponseTimeRaw = currentPlayerResponseTimes[currentPlayerResponseTimes.length - 1];
  const lastResponseTimeDisplay = lastResponseTimeRaw !== undefined ? (15 - lastResponseTimeRaw).toFixed(1) : '-';

  // --- Category Icon Logic & DEBUG LOGGING (Moved just before return) ---
  const categoryConfig = {
    football: { icon: Trophy, emoji: '⚽', color: 'text-yellow-400' },
    basketball: { icon: Target, emoji: '🏀', color: 'text-orange-400' },
    tennis: { icon: Circle, emoji: '🎾', color: 'text-green-400' },
    olympics: { icon: Medal, emoji: '🏅', color: 'text-blue-400' },
    mixed: { icon: Dumbbell, emoji: '🎯', color: 'text-purple-400' }
  };

  console.log('[QuizGame Render] Category from store:', category);
  console.log('[QuizGame Render] categoryConfig keys:', Object.keys(categoryConfig));

  // Use the robust calculation
  const currentCategoryConfig = (category && categoryConfig[category as keyof typeof categoryConfig]) || categoryConfig.mixed;

  console.log('[QuizGame Render] Calculated currentCategoryConfig:', currentCategoryConfig ? `emoji: ${currentCategoryConfig.emoji}` : currentCategoryConfig);

  // Check right before defining CategoryIcon
  if (!currentCategoryConfig) {
      console.error('CRITICAL ERROR: currentCategoryConfig is undefined or null right before defining CategoryIcon!');
      // Render an error state instead of crashing
      return <div className="text-red-500 p-8 text-center min-h-screen flex items-center justify-center">Error state: Cannot determine category icon config! Check logs.</div>;
  } else {
      console.log('[QuizGame Render] Defining CategoryIcon based on valid currentCategoryConfig.');
  }

  // Define CategoryIcon HERE, just before the return, using the validated config
  const CategoryIcon = currentCategoryConfig.icon;
  console.log('[QuizGame Render] Successfully defined CategoryIcon variable.');


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
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between relative"> {/* Added relative positioning */}
           {/* Left side - Navigation Buttons Area (reserve space even if empty) */}
           <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3 w-40 h-full">
             {/* Navigation buttons will be placed absolutely below, this just reserves header space */}
           </div>

           {/* Centered title */}
           <div className="flex-grow flex items-center justify-center gap-2 text-center">
            <motion.div whileHover={{ scale: 1.1, rotate: 360 }} transition={{ duration: 0.5 }} className={`p-1.5 rounded-lg bg-gray-700/50 ${currentCategoryConfig.color}`} >
              {/* Use CategoryIcon safely here */}
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
             {/* ... Scores and Timer JSX ... */}
                {isMultiplayer && (
                  <div className="hidden sm:flex gap-2">
                    {players.map((player) => (
                      <motion.div key={player.id} className={`px-2 sm:px-3 py-1 rounded-full ${ player.id === currentPlayer?.id ? 'bg-green-600/20 text-green-300 border border-green-500/30' : 'bg-gray-700/20 text-gray-400 border border-transparent' }`} whileHover={{ scale: 1.05 }} >
                        <span className={`font-semibold text-xs sm:text-sm ${player.id === currentPlayer?.id ? 'text-white' : ''}`}>{player.score || 0}</span>
                        <span className="text-xs sm:text-sm ml-1">{player.username.substring(0, 6)}{player.username.length > 6 ? '..' : ''}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
                <motion.div className={`flex items-center gap-1 sm:gap-2 bg-gray-700/30 px-2.5 sm:px-4 py-1.5 rounded-full ${getTimerColor(localTime)}`} animate={{ scale: localTime <= 5 ? [1, 1.05, 1] : 1, transition: { duration: 0.5, repeat: localTime <= 5 ? Infinity : 0, repeatType: "reverse" } }} >
                  <motion.div animate={{ rotate: 360, transition: { duration: 2, repeat: Infinity, ease: "linear" } }} > <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> </motion.div>
                  <span className="font-semibold text-sm sm:text-base min-w-[3ch] sm:min-w-[4ch] text-right"> {localTime.toFixed(1)} </span>
                </motion.div>
           </div>
        </div>
      </motion.div>

      {/* Navigation Buttons (Absolutely Positioned) */}
      {isMultiplayer ? ( /* ... */ ) : ( /* ... */ )}
      {/* Host Indicator (Absolutely Positioned below header) */}
      {isMultiplayer && isHost && ( /* ... */ )}


      {/* Main Game Area */}
      <div className="container mx-auto max-w-2xl pt-20 sm:pt-24 pb-24 flex flex-col items-center">
        <motion.div
          className="card w-full p-6 md:p-8 bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.h2 key={question.question} /* ... */ > {question.question} </motion.h2>
          </AnimatePresence>

          {/* Options */}
          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion} /* ... */ >
              {question.options.map((option, index) => { /* ... options mapping ... */ })}
            </motion.div>
          </AnimatePresence>

          {/* Feedback Area */}
          <AnimatePresence>
            {isAnswerChecked && ( <motion.div /* ... */ > {/* ... feedback divs ... */ } </motion.div> )}
          </AnimatePresence>
        </motion.div>

        {/* Solo Score Display */}
        {!isMultiplayer && ( /* ... */ )}
      </div>

      {/* Chat Area (Multiplayer Only) */}
      {isMultiplayer && ( /* ... */ )}

    </div> // End Main Div
  );
};

export default QuizGame;

// NOTE: Some JSX sections like Options mapping, Feedback divs, Chat area etc. 
// are kept collapsed (...) in this view for brevity, 
// but ensure you have the full correct JSX from the previous version in your actual file.
