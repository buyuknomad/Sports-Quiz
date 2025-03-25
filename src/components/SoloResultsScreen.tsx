// Enhanced Solo Results Screen with accurate calculations and consistent formatting
import React, { useEffect, useCallback } from 'react';
import { Trophy, Home, RotateCw, Share2, Timer, Target, Award, CheckCircle, XCircle, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';
import type { Category } from '../types';

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

const SoloResultsScreen = React.memo<SoloResultsScreenProps>(({ onPlayAgain, onHome }) => {
  const { players, category, questions, questionResponseTimes } = useGameStore();
  const player = players[0];
  const categoryEmoji = categoryEmojis[category];

  const totalQuestions = questions.length;
  const score = player?.score || 0;
  const maxPossibleScore = totalQuestions * 15; // Each question is worth 15 points max
  const accuracy = (score / maxPossibleScore) * 100;
  
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

  useEffect(() => {
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
  }, []);

  const handleShare = useCallback(async () => {
    const shareText = `🎮 I scored ${score}/${maxPossibleScore} points with ${accuracy.toFixed(1)}% accuracy in the ${category} Sports Quiz! Can you beat my score? #SportsQuiz`;
    
    try {
      if (navigator.share && navigator.canShare && navigator.canShare({ text: shareText })) {
        await navigator.share({
          title: 'Sports Quiz Score',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Score copied to clipboard!');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Share failed:', error.message);
      }
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Score copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard failed:', clipboardError);
        alert('Unable to share score. Please try again.');
      }
    }
  }, [score, maxPossibleScore, accuracy, category]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="w-full max-w-xl bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700/50">
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
            onPlayAgain={onPlayAgain}
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
    </div>
  );
});

SoloResultsScreen.displayName = 'SoloResultsScreen';

export default SoloResultsScreen;