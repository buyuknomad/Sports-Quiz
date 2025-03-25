// Invite system component with improved game joining logic
import React, { useState, useEffect } from 'react';
import { Copy, UserPlus, Users, AlertCircle, ChevronRight } from 'lucide-react';
import { useOneVsOneStore } from '../store/oneVsOneStore';

interface InviteSystemProps {
  onJoinSuccess: () => void;
}

export const InviteSystem: React.FC<InviteSystemProps> = ({ onJoinSuccess }) => {
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const { 
    gameId, 
    joinGame, 
    socket, 
    players, 
    getCurrentPlayer, 
    hasJoinedGame 
  } = useOneVsOneStore();
  const username = localStorage.getItem('username') || '';

  // Check if already joined a game on mount and after changes
  useEffect(() => {
    if (hasJoinedGame) {
      console.log('Already joined a game, triggering success callback');
      onJoinSuccess();
    }
  }, [hasJoinedGame, onJoinSuccess]);

  useEffect(() => {
    if (!socket) return;

    const handleError = (error: { message: string }) => {
      setError(error.message);
    };

    const handleGameUpdated = (data: any) => {
      // Check if this player is in the game
      const isInGame = data.players.some((p: any) => p.id === socket.id);
      if (isInGame) {
        console.log('Game updated and player is in the game, triggering success callback');
        // Delay the redirect slightly to ensure store is updated
        setTimeout(() => {
          onJoinSuccess();
        }, 100);
      }
    };

    socket.on('error', handleError);
    socket.on('gameUpdated', handleGameUpdated);

    return () => {
      socket.off('error', handleError);
      socket.off('gameUpdated', handleGameUpdated);
    };
  }, [socket, onJoinSuccess]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      setError('Failed to copy code to clipboard');
    }
  };

  const handleJoinGame = () => {
    setError('');
    if (!joinCode.trim()) {
      setError('Please enter a game code');
      return;
    }
    
    try {
      console.log('Attempting to join game:', joinCode);
      joinGame(joinCode, username)
        .then(() => {
          console.log('Successfully joined game:', joinCode);
          // We don't call onJoinSuccess() here as it will be triggered by the useEffect watching hasJoinedGame
        })
        .catch((err) => {
          console.error('Error joining game:', err);
          setError(err.message || 'Failed to join game');
        });
    } catch (err) {
      console.error('Exception joining game:', err);
      setError('An error occurred while joining the game');
    }
  };

  // Get current player to check if they're the host
  const currentPlayer = getCurrentPlayer();
  const isHost = currentPlayer?.isHost || players.length === 0;
  const isJoined = players.some(p => p.id === socket?.id);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          {showJoin ? 'Join Game 🎮' : 'Create Game 🎮'}
        </h1>

        {!showJoin ? (
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Share this code with your friend
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gameId}
                  readOnly
                  className="flex-1 p-3 rounded-lg bg-gray-700 text-white font-mono text-lg select-all"
                />
                <button
                  onClick={handleCopyCode}
                  className={`p-3 rounded-lg ${
                    copySuccess ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors relative group`}
                  title="Copy code"
                >
                  <Copy size={24} />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {copySuccess ? 'Copied!' : 'Copy code'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowJoin(true)}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Want to join instead?
              </button>
              {(isHost || isJoined) && (
                <button
                  onClick={onJoinSuccess}
                  className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white 
                           transition-colors flex items-center gap-2 group"
                >
                  {isHost ? 'Continue to Category' : 'Continue to Lobby'}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Enter game code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value);
                  setError('');
                }}
                placeholder="Enter code"
                className={`w-full p-3 rounded-lg bg-gray-700 text-white font-mono text-lg 
                         border-2 ${error ? 'border-red-500' : 'border-transparent'} 
                         focus:border-green-500 focus:outline-none`}
                maxLength={6}
              />
              {error && (
                <div className="mt-2 text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setShowJoin(false);
                  setError('');
                }}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Create a game instead?
              </button>
              <button
                onClick={handleJoinGame}
                className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white 
                         transition-colors flex items-center gap-2"
              >
                <UserPlus size={20} />
                Join Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};