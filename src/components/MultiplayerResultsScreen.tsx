// Multiplayer lobby component using oneVsOneStore
import React from 'react';
import { Copy, Users, Loader2, Clock, Shield, ShieldCheck } from 'lucide-react';
import { useOneVsOneStore } from '../store/oneVsOneStore';

export const MultiplayerLobby: React.FC = () => {
  const { 
    gameId, 
    players,
    setPlayerReady,
    category,
    startCountdown,
    getCurrentPlayer,
    waitingForPlayers,
    isGameStarted
  } = useOneVsOneStore();
  
  const currentPlayer = getCurrentPlayer();
  const playerCount = players.length;
  const requiredPlayers = 2;
  const allPlayersPresent = playerCount === requiredPlayers;

  const copyInviteCode = () => {
    navigator.clipboard.writeText(gameId);
  };

  const handleReady = () => {
    if (currentPlayer && allPlayersPresent) {
      setPlayerReady();
    }
  };

  const allPlayersReady = allPlayersPresent && players.every(p => p.isReady);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 shadow-xl">
        {/* Header with game code */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">1v1 Game Lobby</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={gameId}
              readOnly
              className="bg-gray-700 text-white px-3 py-1 rounded font-mono text-sm"
            />
            <button
              onClick={copyInviteCode}
              className="p-2 rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
              title="Copy invite code"
            >
              <Copy size={20} />
            </button>
          </div>
        </div>

        {/* Player count indicator */}
        <div className="mb-6 flex items-center justify-center">
          <div className="bg-gray-700 rounded-full px-4 py-2 flex items-center gap-2">
            <Users size={20} className="text-green-400" />
            <span className="text-white font-medium">
              {playerCount}/2 Players
            </span>
          </div>
        </div>

        {/* Waiting state message */}
        {waitingForPlayers && (
          <div className="text-center mb-8 animate-pulse">
            <div className="flex items-center justify-center gap-3 text-yellow-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg font-medium">
                Waiting for opponent...
              </span>
            </div>
            <p className="text-gray-400 mt-2">
              Share the game code with your opponent to start
            </p>
          </div>
        )}

        {/* Players list */}
        <div className="mb-8">
          <h3 className="text-xl text-white flex items-center gap-2 mb-4">
            <Users size={24} />
            Players
          </h3>

          <div className="grid gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  player.id === currentPlayer?.id ? 'bg-gray-700' : 'bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{player.username}</span>
                  {player.id === currentPlayer?.id && (
                    <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {player.id === currentPlayer?.id && !player.isReady && allPlayersPresent && (
                    <button
                      onClick={handleReady}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white 
                               rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Shield size={16} />
                      Ready Up
                    </button>
                  )}
                  {player.isReady ? (
                    <span className="text-green-400 flex items-center gap-2">
                      <ShieldCheck size={16} />
                      Ready
                    </span>
                  ) : (
                    <span className="text-gray-400 flex items-center gap-2">
                      <Shield size={16} />
                      Not Ready
                    </span>
                  )}
                </div>
              </div>
            ))}
            {waitingForPlayers && (
              <div className="p-4 rounded-lg bg-gray-700/30 border-2 border-dashed border-gray-600">
                <div className="text-gray-400 text-center">
                  Waiting for opponent...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Countdown display */}
        {startCountdown !== null && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-2xl text-green-400 font-bold">
              <Clock className="w-6 h-6 animate-pulse" />
              <span className="animate-pulse">
                Game starting in {startCountdown}...
              </span>
            </div>
          </div>
        )}

        {/* Status message */}
        {startCountdown === null && (
          <div className="text-center text-gray-400">
            {allPlayersReady ? (
              <p>All players ready! Starting game...</p>
            ) : allPlayersPresent ? (
              <p>Waiting for all players to be ready...</p>
            ) : (
              <p>Waiting for opponent to join...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};