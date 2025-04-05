// Invite system component with simplified navigation
import React, { useState, useEffect } from 'react';
import { Copy, UserPlus, AlertCircle, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useOneVsOneStore } from '../store/oneVsOneStore';
import { NavigationButton, ConfirmationDialog } from './navigation';
import { NAVIGATION_LABELS, CONFIRMATION_MESSAGES } from '../constants/navigation';
import type { Category } from '../types';

interface InviteSystemProps {
  onJoinSuccess: () => void;
  onBackToMode?: () => void;
  selectedCategory?: Category | null;
}

export const InviteSystem: React.FC<InviteSystemProps> = ({ 
  onJoinSuccess, 
  onBackToMode,
  selectedCategory = 'mixed'
}) => {
  // Initialize show join based on localStorage
  const [showJoin, setShowJoin] = useState(() => {
    const shouldShowJoin = localStorage.getItem('showJoinUI') === 'true';
    if (shouldShowJoin) {
      // Clear the flag immediately
      localStorage.removeItem('showJoinUI');
      return true;
    }
    return false;
  });
  
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  
  const { 
    gameId, 
    joinGame, 
    socket, 
    players, 
    getCurrentPlayer, 
    hasJoinedGame,
    resetGame,
    createGame
  } = useOneVsOneStore();
  
  const username = localStorage.getItem('username') || '';
  const currentPlayer = getCurrentPlayer();
  const isHost = currentPlayer?.isHost;
  
  // Add state for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'mode' | 'category' | null;
  }>({ isOpen: false, type: null });

  // Create game with selected category on component mount
  useEffect(() => {
    const initializeGame = async () => {
      // Only create a new game if showing create UI and we don't already have one
      if (!showJoin && !hasJoinedGame && !isCreatingGame && !gameId && selectedCategory) {
        try {
          setIsCreatingGame(true);
          console.log('Automatically creating game with category:', selectedCategory);
          await createGame(selectedCategory);
          setIsCreatingGame(false);
        } catch (error) {
          console.error('Failed to create game:', error);
          setIsCreatingGame(false);
        }
      }
    };

    initializeGame();
  }, [hasJoinedGame, gameId, selectedCategory, createGame, isCreatingGame, showJoin]);

  // Proceed to lobby when user clicks Continue
  const handleContinueToLobby = () => {
    onJoinSuccess();
  };

  useEffect(() => {
    if (!socket) return;

    const handleError = (error: { message: string }) => {
      setError(error.message);
    };

    const handleGameUpdated = (data: any) => {
      // This is for when joining a game with a code
      const isInGame = data.players.some((p: any) => p.id === socket.id);
      if (isInGame) {
        console.log('Game updated and player is in the game, triggering success callback');
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
    if (!gameId) return;
    
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
  
  // Handle back to mode selection
  const handleBackToMode = () => {
    setConfirmDialog({ isOpen: true, type: 'mode' });
  };
  
  // Handle back to category selection (for hosts)
  const handleBackToCategory = () => {
    // Signal to App.tsx that we want to go to category selection
    localStorage.setItem('goToCategory', 'true');
    
    // Clean up any game creation in progress
    resetGame();
    
    // Navigate back via the provided callback
    if (onBackToMode) onBackToMode();
  };
  
  // Handle confirmation dialog
  const handleConfirmNavigation = () => {
    // Clean up any game creation in progress
    resetGame();
    
    // Navigate based on dialog type (only modal dialog is for mode selection now)
    if (onBackToMode) onBackToMode();
    
    // Close the dialog
    setConfirmDialog({ isOpen: false, type: null });
  };

  // Get category icon
  const getCategoryEmoji = (category?: Category | null) => {
    if (!category) return '';
    
    switch(category) {
      case 'football': return ' ⚽';
      case 'basketball': return ' 🏀';
      case 'tennis': return ' 🎾';
      case 'olympics': return ' 🏅';
      case 'mixed': default: return ' 🎯';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#1a1a1a]">
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirmNavigation}
        onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
        title="Go Back?"
        message="Are you sure you want to go back to mode selection? Any game setup in progress will be lost."
        confirmText={NAVIGATION_LABELS.MODES}
        cancelText="Stay Here"
      />
    
      {/* Back to Mode Selection Button (fixed position) */}
      <div className="fixed bottom-6 left-6 z-50">
        {onBackToMode && (
          <NavigationButton
            icon={Home}
            label={NAVIGATION_LABELS.MODES}
            onClick={handleBackToMode}
          />
        )}
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-white text-center mb-4">
          {showJoin ? 'Join Game 🎮' : 'Create Game 🎮'}
        </h1>
        
        {/* Show selected category */}
        {selectedCategory && !showJoin && (
          <div className="text-center mb-6">
            <span className="px-4 py-2 bg-gray-800 rounded-full text-blue-400 text-sm inline-block">
              {`Category: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
              {getCategoryEmoji(selectedCategory)}
            </span>
          </div>
        )}

        {!showJoin ? (
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            {isCreatingGame ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-300">Creating game...</p>
              </div>
            ) : (
              <>
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
                      disabled={!gameId}
                      className={`p-3 rounded-lg ${
                        copySuccess ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                      } text-white transition-colors relative group ${!gameId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Copy code"
                    >
                      <Copy size={24} />
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {copySuccess ? 'Copied!' : 'Copy code'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Simplified button layout for Create Game view */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleBackToCategory}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white 
                             transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Change Category
                  </button>
                  
                  <button
                    onClick={handleContinueToLobby}
                    disabled={!gameId}
                    className={`px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white 
                              transition-colors flex items-center gap-2 group ${!gameId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Continue to Lobby
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </>
            )}
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

            {/* Simplified button layout for Join Game view */}
            <div className="flex justify-end items-center">
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

export default InviteSystem;