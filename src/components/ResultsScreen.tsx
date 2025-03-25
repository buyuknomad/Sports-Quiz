// Enhanced Results screen component with sports emojis and improved styling
import React from 'react';
import { Trophy, Home, RotateCw, Medal, Crown } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { Category } from '../types';

interface ResultsScreenProps {
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

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ onPlayAgain, onHome }) => {
  const { players, mode, category } = useGameStore();
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isTied = sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score;
  const categoryEmoji = categoryEmojis[category];

  const getPositionStyle = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-600 to-yellow-500';
    if (index === 1) return 'bg-gradient-to-r from-gray-600 to-gray-500';
    if (index === 2) return 'bg-gradient-to-r from-amber-700 to-amber-600';
    return 'bg-gray-700';
  };

  const getPositionIcon = (index: number) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-300" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-300" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-12">
          <div className="relative">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
            <span className="absolute top-12 right-1/2 transform translate-x-16 text-4xl animate-pulse">
              {categoryEmoji}
            </span>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
          {isTied ? (
            <p className="text-2xl text-green-400">
              It's a tie! 🤝
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-2xl text-green-400">
                Winner: {winner.username}
              </p>
              <p className="text-xl text-yellow-400">
                {winner.score} points 🏆
              </p>
            </div>
          )}
        </div>

        <div className="mb-12">
          <h3 className="text-xl text-white mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Final Standings
          </h3>
          
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`${getPositionStyle(index)} rounded-xl p-4 transition-transform hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPositionIcon(index)}
                    <span className="text-white font-semibold">
                      {player.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{player.score}</span>
                    <span className="text-sm">pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-600 
                     hover:bg-green-700 text-white font-semibold transition-all transform 
                     hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCw className="w-5 h-5" />
            Play Again
          </button>
          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gray-700 
                     hover:bg-gray-600 text-white font-semibold transition-all transform 
                     hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>

        {mode !== 'solo' && (
          <p className="text-center text-gray-400 mt-6 text-sm">
            Thanks for playing! Challenge your friends to beat your score! 🎮
          </p>
        )}
      </div>
    </div>
  );
};