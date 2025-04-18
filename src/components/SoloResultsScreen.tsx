// Enhanced Solo Results Screen with improved sharing functionality and EnhancedNavBar
import React, { useEffect, useCallback, useState } from 'react';
import { 
  Trophy, Home, RotateCw, Share2, Timer, Target, Award, 
  CheckCircle, XCircle, Zap, Copy, X, Facebook, 
  MessageCircle, Link as LinkIcon, Loader2
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category } from '../types';
import EnhancedNavBar from './layout/EnhancedNavBar';

interface SoloResultsScreenProps {
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

const AnswerDistributionChart = React.memo(({ correctAnswers, incorrectAnswers, totalQuestions }: {
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
  onShowToast,
  player,
  score,
  maxScore,
  accuracy,
  category,
  categoryEmoji,
  setCustomShareText
}: { 
  shareText: string; 
  shareUrl: string;
  onClose: () => void;
  onShowToast: (message: string) => void;
  player: any;
  score: number;
  maxScore: number;
  accuracy: number;
  category: Category;
  categoryEmoji: string;
  setCustomShareText: (text: string) => void;
}) => {
  const [loading, setLoading] = useState(false);

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
  
  const handleSuccessfulShare = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Removed confetti effect
      onShowToast('Results shared successfully!');
      setLoading(false);
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 500);
  };
  
  const shareToSocial = (platform: string) => {
    let shareUrl;
    const fullText = shareText.includes('https://sportiq.games') ? shareText : `${shareText} https://sportiq.games`;
    
    switch(platform) {
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://sportiq.games')}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
    handleSuccessfulShare();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Share Challenge</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-sm text-gray-400 mb-4 text-center">Challenge your friends to beat your score!</p>
        
        {/* Visual Share Preview */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 mb-6 relative group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">S</div>
            <span className="text-blue-400 font-bold">SportIQ</span>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex justify-between mb-3">
              <div className="text-white font-bold">{player?.username || 'You'}</div>
              <div className="bg-green-500/20 px-2 py-0.5 rounded text-green-400 text-sm">
                {accuracy >= 80 ? 'Master' : accuracy >= 60 ? 'Expert' : 'Challenger'}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 mb-2">
              <div className="flex justify-between">
                <div className="text-gray-400 text-sm">Score</div>
                <div className="text-yellow-400 font-bold">{score}/{maxScore}</div>
              </div>
              <div className="mt-1 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600"
                  style={{ width: `${Math.min((score / maxScore) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-center text-sm text-gray-300">
              {category.charAt(0).toUpperCase() + category.slice(1)} Quiz {categoryEmoji}
            </div>
          </div>
          
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                        flex items-center justify-center transition-opacity rounded-lg">
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded text-white text-sm">
              Preview
            </span>
          </div>
        </div>
        
        {/* Customization */}
        <div className="mb-6">
          <label className="flex justify-between text-gray-300 text-sm mb-2">
            <span>Customize your message:</span>
            <button 
              onClick={handleCopyText}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Copy size={14} /> Copy
            </button>
          </label>
          <textarea 
            value={shareText}
            onChange={(e) => setCustomShareText(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg text-white text-sm resize-none border border-gray-600 focus:border-blue-500 focus:outline-none"
            rows={3}
          />
        </div>
        
        {/* Share Options - Visual Redesign */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            className="flex items-center justify-center gap-2 p-3 bg-blue-600 
                     hover:bg-blue-700 rounded-lg text-white transition-colors"
            onClick={() => shareToSocial('x')}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
            <span>Share to Social</span>
          </button>
          <button 
            className="flex items-center justify-center gap-2 p-3 bg-green-600 
                     hover:bg-green-700 rounded-lg text-white transition-colors"
            onClick={() => {
              handleCopyText();
              handleSuccessfulShare();
            }}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
            <span>Share via Chat</span>
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {/* X (formerly Twitter) */}
          <button
            onClick={() => shareToSocial('x')}
            className="p-3 bg-black hover:bg-gray-900 rounded-lg text-white transition-colors flex items-center justify-center"
            title="Share on X"
            disabled={loading}
          >
            <XLogo size={20} />
          </button>
          
          {/* Facebook */}
          <button
            onClick={() => shareToSocial('facebook')}
            className="p-3 bg-[#4267B2]/90 hover:bg-[#4267B2] rounded-lg text-white transition-colors flex items-center justify-center"
            title="Share on Facebook"
            disabled={loading}
          >
            <Facebook size={20} />
          </button>
          
          {/* WhatsApp */}
          <button
            onClick={() => shareToSocial('whatsapp')}
            className="p-3 bg-[#25D366]/90 hover:bg-[#25D366] rounded-lg text-white transition-colors flex items-center justify-center"
            title="Share on WhatsApp"
            disabled={loading}
          >
            <MessageCircle size={20} />
          </button>
          
          {/* Copy Link */}
          <button
            onClick={() => {
              handleCopyLink();
              handleSuccessfulShare();
            }}
            className="p-3 bg-gray-600/90 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center justify-center"
            title="Copy link"
            disabled={loading}
          >
            <LinkIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const StatsDisplay = React.memo(({ 
  score, 
  accuracy, 
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  fastestResponse,
  slowestResponse,
  avgTimePerQuestion,
  totalResponseTime
}: {
  score: number;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  fastestResponse: number;
  slowestResponse: number;
  avgTimePerQuestion: number;
  totalResponseTime: number;
}) => (
  <div className="space-y-6">
    <div className="bg-gray-700/30 rounded-xl p-6 backdrop-blur-sm">
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-1">Final Score</div>
          <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            {score}
          </div>
          <div className="mt-2 w-full bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000"
              style={{ width: `${(score / (totalQuestions * 15)) * 100}%` }}
            />
          </div>
          <div className="text-gray-400 text-sm mt-1">Max: {totalQuestions * 15}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-1">Accuracy</div>
          <div className="text-4xl font-bold text-green-400">
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

    <div className="bg-gray-700/30 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-green-400" />
        Answer Distribution
      </h3>
      <AnswerDistributionChart
        correctAnswers={correctAnswers}
        incorrectAnswers={incorrectAnswers}
        totalQuestions={totalQuestions}
      />
    </div>

    <div className="bg-gray-700/30 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        Response Times
      </h3>
      <div className="space-y-4">
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
));

StatsDisplay.displayName = 'StatsDisplay';

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
      className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-600 
               hover:bg-blue-700 text-white transition-all transform 
               hover:scale-[1.02] active:scale-[0.98] group"
    >
      <div className="flex items-center justify-center gap-2">
        <Share2 className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        <span>Challenge</span>
      </div>
      <span className="text-xs text-blue-200 mt-1">Share your score</span>
    </button>
  </div>
));

ActionButtons.displayName = 'ActionButtons';

// Don't memo the component since that can cause stale state issues with the button
const SoloResultsScreen: React.FC<SoloResultsScreenProps> = ({ onPlayAgain, onHome }) => {
  const { players, category, questions, questionResponseTimes } = useGameStore();
  const player = players[0];
  const categoryEmoji = categoryEmojis[category];
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  // No need for challenge ID as we're just linking to homepage
  const totalQuestions = questions.length || 10; // Default to 10 if questions array is empty
  const score = player?.score || 0;
  const maxPossibleScore = totalQuestions * 15; // Each question is worth 15 points max
  const accuracy = totalQuestions > 0 ? (score / maxPossibleScore) * 100 : 0;
  
  // More engaging share text
  const getShareText = () => {
    const performanceLabel = 
      accuracy >= 90 ? 'mastered' : 
      accuracy >= 70 ? 'aced' : 
      accuracy >= 50 ? 'conquered' : 
      'tackled';
    
    return `I just ${performanceLabel} the ${category} quiz on SportIQ with ${score}/${maxPossibleScore} points (${accuracy.toFixed(1)}% accuracy)! Think you can beat my score? 🎯 #SportIQ https://sportiq.games`;
  };
  
  const [customShareText, setCustomShareText] = useState(getShareText());
  const shareText = customShareText;
  const shareUrl = `https://sportiq.games`;
  
  // Use the actual count of correct answers from the player object
  const correctAnswers = player?.correctAnswers || 0;
  const incorrectAnswers = totalQuestions - correctAnswers;
  
  const validResponseTimes = questionResponseTimes.filter(time => time > 0 && time <= 15);
  const fastestResponse = validResponseTimes.length > 0 ? Math.min(...validResponseTimes) : 0;
  const slowestResponse = validResponseTimes.length > 0 ? Math.max(...validResponseTimes) : 0;
  const avgTimePerQuestion = validResponseTimes.length > 0
    ? validResponseTimes.reduce((sum, time) => sum + time, 0) / validResponseTimes.length
    : 0;
  const totalResponseTime = validResponseTimes.reduce((sum, time) => sum + time, 0);

  const performanceMessage = getPerformanceMessage(accuracy);

  // Toast handler
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Complete overhaul of the Play Again handling with forced blocking
  const [isPlayingAgain, setIsPlayingAgain] = useState(false);
  const playAgainInitiatedRef = useRef(false);
  
  const handlePlayAgainClick = useCallback(() => {
    // Use refs to completely block multiple executions
    if (isPlayingAgain || playAgainInitiatedRef.current) {
      console.log('Play Again already in progress, blocking additional clicks');
      return;
    }
    
    // Set both state and ref to block clicks
    setIsPlayingAgain(true);
    playAgainInitiatedRef.current = true;
    
    console.log('Play Again button clicked, initiating game reset (with blocking)...');
    
    try {
      // Call onPlayAgain immediately - no delay
      onPlayAgain();
      
      // Leave the button disabled indefinitely
      // It will be unmounted when navigation completes
      // Never reset isPlayingAgain or playAgainInitiatedRef
    } catch (err) {
      console.error('Error in Play Again:', err);
      // Only reset on error to allow retry
      setIsPlayingAgain(false);
      playAgainInitiatedRef.current = false;
    }
  }, [onPlayAgain]);

  const handleShare = useCallback(() => {
    // Skip native sharing and always use our custom modal
    // This provides a more consistent experience across browsers
    setShowShareModal(true);
    
    // Reset the share text when opening the modal
    setCustomShareText(getShareText());
  }, [getShareText]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Add EnhancedNavBar with minimal variant */}
      <EnhancedNavBar variant="minimal" position="top-right" />
      
      <div data-testid="solo-results-container" className="w-full max-w-xl bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700/50">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Trophy className="w-24 h-24 text-yellow-400 animate-bounce filter drop-shadow-lg" />
            <span className="absolute top-12 right-0 text-4xl animate-pulse">
              {categoryEmoji}
            </span>
            <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mt-6 mb-2">Game Complete!</h2>
          <p className="text-2xl text-green-400 font-bold mb-2">{performanceMessage}</p>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Timer className="w-4 h-4" />
            <span>Total response time: {totalResponseTime.toFixed(2)}s</span>
          </div>
        </div>

        <StatsDisplay
          score={score}
          accuracy={accuracy}
          totalQuestions={totalQuestions}
          correctAnswers={correctAnswers}
          incorrectAnswers={incorrectAnswers}
          fastestResponse={fastestResponse}
          slowestResponse={slowestResponse}
          avgTimePerQuestion={avgTimePerQuestion}
          totalResponseTime={totalResponseTime}
        />

        <div className="mt-8">
          <ActionButtons
            onPlayAgain={handlePlayAgainClick}
            onHome={onHome}
            onShare={handleShare}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Challenge your friends to beat your score! 🏆
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
          player={player}
          score={score}
          maxScore={maxPossibleScore}
          accuracy={accuracy}
          category={category}
          categoryEmoji={categoryEmoji}
          setCustomShareText={setCustomShareText}
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
      `}</style>
    </div>
  );
};

// Export directly without memo wrapper
export default SoloResultsScreen;
