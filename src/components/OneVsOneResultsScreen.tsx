// Enhanced 1v1 Results screen component with improved sharing
import React, { useEffect, useCallback, useState } from 'react';
import { 
  Trophy, Home, RotateCw, Share2, Timer, Target, Award, 
  CheckCircle, XCircle, Zap, Medal, Crown, Copy, X,
  Facebook, MessageCircle, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useOneVsOneStore } from '../store/oneVsOneStore';
import type { Category } from '../types';

interface OneVsOneResultsScreenProps {
  onPlayAgain: () => void;
  onHome: () => void;
}

const categoryEmojis: Record<Category, string> = {
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  olympics: '🏅',
  mixed: '🎯'
};

const getPerformanceMessage = (accuracy: number) => {
  if (accuracy >= 90) return 'Outstanding! 🌟';
  if (accuracy >= 80) return 'Excellent! 🎯';
  if (accuracy >= 70) return 'Great Job! 👏';
  if (accuracy >= 60) return 'Well Done! 💪';
  if (accuracy >= 50) return 'Good Effort! 👍';
  return 'Keep Practicing! 💫';
};

// Custom X (formerly Twitter) icon component
const XLogo = ({ size = 20, className = "" }: { size?: number, className?: string }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.1907 4H19.9333L13.73 11.0533L20.8 20H15.0267L10.7027 14.4667L5.74933 20H3.00267L9.66667 12.4533L2.93333 4H8.84L12.7533 9.0467L17.1907 4ZM15.72 18.4667H17.0667L8.15733 5.46667H6.70933L15.72 18.4667Z" />
    </svg>
  );
};

// Toast notification component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
  >
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
      <X size={16} />
    </button>
  </motion.div>
);

// Memoized answer distribution chart component
const AnswerDistributionChart = React.memo(({ 
  correctAnswers, 
  incorrectAnswers, 
  totalQuestions 
}: {
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-green-400 flex items-center gap-1">
            <CheckCircle size={16} /> Correct
          </span>
          <span className="text-green-400 font-bold">{correctAnswers}</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-1000"
            style={{ width: `${(correctAnswers / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
      <div className="w-12 text-center text-gray-400">
        {((correctAnswers / totalQuestions) * 100).toFixed(0)}%
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-red-400 flex items-center gap-1">
            <XCircle size={16} /> Incorrect
          </span>
          <span className="text-red-400 font-bold">{incorrectAnswers}</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-1000"
            style={{ width: `${(incorrectAnswers / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
      <div className="w-12 text-center text-gray-400">
        {((incorrectAnswers / totalQuestions) * 100).toFixed(0)}%
      </div>
    </div>
  </div>
));

AnswerDistributionChart.displayName = 'AnswerDistributionChart';

// Share Modal Component
const ShareModal = ({ 
  shareText, 
  shareUrl, 
  onClose, 
  onShowToast 
}: { 
  shareText: string; 
  shareUrl: string;
  onClose: () => void;
  onShowToast: (message: string) => void;
}) => {
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      onShowToast('Text copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      onShowToast('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Share Your Results</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="bg-gray-700/50 p-4 rounded-lg mb-6 relative group">
          <p className="sport-share-text text-white">{shareText}</p>
          <button 
            onClick={handleCopyText}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-800/50 rounded-md hover:bg-gray-800"
            title="Copy text"
          >
            <Copy size={14} className="text-gray-300" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm">Website:</span>
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors"
            >
              <Copy size={14} /> Copy
            </button>
          </div>
          <div className="bg-gray-700/30 p-2 rounded text-green-400 text-sm font-mono truncate">
            {shareUrl}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {/* X (formerly Twitter) */}
          <button
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
            className="p-3 bg-black hover:bg-gray-900 rounded-lg text-white transition-colors flex items-center justify-center"
            title="Share on X"
          >
            <XLogo size={20} />
          </button>
          
          {/* Facebook */}
          <button
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank')}
            className="p-3 bg-[#4267B2]/90 hover:bg-[#4267B2] rounded-lg text-white transition-colors flex items-center justify-center"
            title="Share on Facebook"
          >
            <Facebook size={20} />
          </button>
          
          {/* WhatsApp */}
          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')}
            className="p-3 bg-[#25D366]/90 hover:bg-[#25D366] rounded-lg text-white transition-colors flex items-center justify-center"
            title="Share on WhatsApp"
          >
            <MessageCircle size={20} />
          </button>
          
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="p-3 bg-gray-600/90 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center justify-center"
            title="Copy link"
          >
            <LinkIcon size={20} />
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Share with friends and challenge them to beat your score!
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced player stats component
const PlayerStats = React.memo(({ 
  player,
  isWinner,
  totalQuestions,
  maxPossibleScore,
  playerResponseTimes
}: {
  player: Player;
  isWinner: boolean;
  totalQuestions: number;
  maxPossibleScore: number;
  playerResponseTimes: number[];
}) => {
  // Calculate statistics
  const score = player.score || 0;
  
  // First try to get correctAnswers directly from player if available
  let correctAnswers = player.correctAnswers;
  
  // If correctAnswers isn't available, estimate from score
  // Each correct answer gives 10 base points + up to 5 bonus points
  if (correctAnswers === undefined) {
    correctAnswers = Math.floor(score / 15); // Each correct answer is worth up to 15 points max
  }
  
  const incorrectAnswers = totalQuestions - correctAnswers;
  const accuracy = (score / maxPossibleScore) * 100;
  
  // Calculate response times
  const validResponseTimes = playerResponseTimes.filter(time => time > 0 && time <= 15);
  const fastestResponse = validResponseTimes.length > 0 ? Math.min(...validResponseTimes) : 0;
  const slowestResponse = validResponseTimes.length > 0 ? Math.max(...validResponseTimes) : 0;
  const avgTimePerQuestion = validResponseTimes.length > 0
    ? validResponseTimes.reduce((sum, time) => sum + time, 0) / validResponseTimes.length
    : 0;
  const totalResponseTime = validResponseTimes.reduce((sum, time) => sum + time, 0);

  const performanceMessage = getPerformanceMessage(accuracy);

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 ${
      isWinner ? 'ring-2 ring-yellow-400' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isWinner && <Crown className="w-6 h-6 text-yellow-400" />}
          <h3 className="text-xl font-bold text-white">{player.username}</h3>
          {isWinner && (
            <div className="bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded-full text-xs font-bold">
              Winner!
            </div>
          )}
        </div>
        <div className="text-xl text-gray-300">{performanceMessage}</div>
      </div>

      {/* Score and Accuracy section */}
      <div className="bg-gray-700/30 rounded-xl p-4 backdrop-blur-sm mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Final Score</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              {score}
            </div>
            <div className="mt-2 w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000"
                style={{ width: `${(score / maxPossibleScore) * 100}%` }}
              />
            </div>
            <div className="text-gray-400 text-sm mt-1">Max: {maxPossibleScore}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Accuracy</div>
            <div className="text-3xl font-bold text-green-400">
              {accuracy.toFixed(1)}%
            </div>
            <div className="mt-2 w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000"
                style={{ width: `${Math.min(accuracy, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Answer Distribution section */}
      <div className="bg-gray-700/30 rounded-xl p-4 backdrop-blur-sm mb-4">
        <h3 className="text-lg text-white mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Answer Distribution
        </h3>
        <AnswerDistributionChart
          correctAnswers={correctAnswers}
          incorrectAnswers={incorrectAnswers}
          totalQuestions={totalQuestions}
        />
      </div>

      {/* Response Times section */}
      <div className="bg-gray-700/30 rounded-xl p-4 backdrop-blur-sm">
        <h3 className="text-lg text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Response Times
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Fastest Response</span>
            <span className="text-green-400 font-bold">{fastestResponse.toFixed(2)}s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Slowest Response</span>
            <span className="text-yellow-400 font-bold">{slowestResponse.toFixed(2)}s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Average Response</span>
            <span className="text-blue-400 font-bold">{avgTimePerQuestion.toFixed(2)}s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Response Time</span>
            <span className="text-purple-400 font-bold">{totalResponseTime.toFixed(2)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
});

PlayerStats.displayName = 'PlayerStats';

// Memoized action buttons component
const ActionButtons = React.memo(({ onPlayAgain, onHome, onShare }: {
  onPlayAgain: () => void;
  onHome: () => void;
  onShare: () => void;
}) => (
  <div className="grid grid-cols-3 gap-4">
    <button
      onClick={onPlayAgain}
      className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-600 
               hover:bg-green-700 text-white font-semibold transition-all transform 
               hover:scale-[1.02] active:scale-[0.98] group"
    >
      <RotateCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
      Play Again
    </button>
    <button
      onClick={onHome}
      className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gray-700 
               hover:bg-gray-600 text-white font-semibold transition-all transform 
               hover:scale-[1.02] active:scale-[0.98] group"
    >
      <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      Home
    </button>
    <button
      onClick={onShare}
      className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-600 
               hover:bg-blue-700 text-white font-semibold transition-all transform 
               hover:scale-[1.02] active:scale-[0.98] group"
    >
      <Share2 className="w-5 h-5 group-hover:rotate-45 transition-transform" />
      Share
    </button>
  </div>
));

ActionButtons.displayName = 'ActionButtons';

export const OneVsOneResultsScreen: React.FC<OneVsOneResultsScreenProps> = ({ onPlayAgain, onHome }) => {
  const { 
    players, 
    category, 
    questions, 
    completionTime = 0,
    getCurrentPlayer,
    getPlayerResponseTimes
  } = useOneVsOneStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const currentPlayer = getCurrentPlayer();
  const categoryEmoji = categoryEmojis[category];
  const maxPossibleScore = questions.length * 15; // Each question is worth 15 points max

  // Sort players by score
  const sortedPlayers = React.useMemo(() => 
    [...players].sort((a, b) => b.score - a.score),
    [players]
  );

  const winner = sortedPlayers[0];
  const loser = sortedPlayers[1];
  const isTied = winner?.score === loser?.score;

  // Get response times for each player
  const getResponseTimes = useCallback((playerId: string) => {
    return getPlayerResponseTimes(playerId);
  }, [getPlayerResponseTimes]);

  // Create share content
  const shareText = isTied
    ? `I tied ${winner?.score}-${loser?.score} in the ${category} quiz on SportIQ! Can you beat our scores? #SportIQ`
    : `I ${winner?.username === currentPlayer?.username ? 'won' : 'lost'} ${winner?.score}-${loser?.score} in the ${category} quiz on SportIQ! Challenge me! #SportIQ`;
  
  const shareUrl = `https://sportiq.games`;

  // Toast handler
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Handle share score
  const handleShare = useCallback(async () => {
    // Try to use the native share API first
    try {
      if (navigator.share && navigator.canShare && navigator.canShare({ text: shareText, url: shareUrl })) {
        await navigator.share({
          title: 'SportIQ Match Result',
          text: shareText,
          url: shareUrl
        });
        
        // Record successful share
        showToast('Result shared successfully!');
        return;
      }
    } catch (error) {
      console.error('Native share failed:', error);
    }
    
    // Fall back to showing the share modal
    setShowShareModal(true);
  }, [shareText, shareUrl]);

  // Trigger confetti effect on mount
  useEffect(() => {
    if (!isTied && winner) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: NodeJS.Timer = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isTied, winner]);

  if (!sortedPlayers.length) {
    return <div className="text-white text-center p-8">Loading results...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="w-full max-w-3xl bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700/50">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Trophy className="w-24 h-24 text-yellow-400 animate-bounce filter drop-shadow-lg" />
            <span className="absolute top-12 right-0 text-4xl animate-pulse">
              {categoryEmoji}
            </span>
            <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mt-6 mb-2">Match Complete!</h2>
          {isTied ? (
            <p className="text-2xl text-blue-400 font-bold mb-2">It's a tie! 🤝</p>
          ) : (
            <p className="text-2xl text-green-400 font-bold mb-2">
              {winner?.username} wins! 🏆
            </p>
          )}
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Timer className="w-4 h-4" />
            <span>Match duration: {completionTime.toFixed(1)}s</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {sortedPlayers.map((player, index) => (
            <PlayerStats
              key={player.id}
              player={player}
              isWinner={index === 0 && !isTied}
              totalQuestions={questions.length}
              maxPossibleScore={maxPossibleScore}
              playerResponseTimes={getResponseTimes(player.id)}
            />
          ))}
        </div>

        <ActionButtons
          onPlayAgain={onPlayAgain}
          onHome={onHome}
          onShare={handleShare}
        />

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Share your results with friends! 🎮
          </p>
        </div>
      </div>
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          shareText={shareText}
          shareUrl={shareUrl}
          onClose={() => setShowShareModal(false)}
          onShowToast={showToast}
        />
      )}
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      
      {/* Add these global styles to your CSS or create animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        /* Almarena-like font styling */
        .sport-share-text {
          font-family: "Almarena Neue", "Montserrat", "Segoe UI", sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          font-size: 1.1rem;
          line-height: 1.4;
          text-transform: none;
        }
      `}</style>
    </div>
  );
};

export default OneVsOneResultsScreen;