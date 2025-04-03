// Multiplayer lobby component with improved navigation
import React, { useState } from 'react';
import { Copy, Users, Loader2, Clock, Shield, ShieldCheck, Crown, Home, ArrowLeft } from 'lucide-react';
import { useOneVsOneStore } from '../store/oneVsOneStore';
import { NavigationButton, ConfirmationDialog } from './navigation'; // Assuming these are correctly imported
import { NAVIGATION_LABELS, CONFIRMATION_MESSAGES } from '../constants/navigation'; // Assuming these are correctly imported

interface MultiplayerLobbyProps {
  onBackToCategory?: () => void;
  onBackToMode?: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onBackToCategory,
  onBackToMode
}) => {
  const {
    gameId,
    players,
    setPlayerReady,
    category, // Keep category if needed for display, otherwise removable
    startCountdown,
    getCurrentPlayer,
    waitingForPlayers,
    isGameStarted, // Keep isGameStarted if needed, otherwise removable
    socket,
    resetGame
  } = useOneVsOneStore();

  // Add confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'category' | 'mode' | null;
  }>({ isOpen: false, type: null });

  const currentPlayer = getCurrentPlayer();
  const isHost = currentPlayer?.isHost;
  const playerCount = players.length;
  const requiredPlayers = 2; // Assuming 1v1 mode always requires 2 players
  const allPlayersPresent = playerCount === requiredPlayers;

  const copyInviteCode = () => {
    if (gameId) {
        navigator.clipboard.writeText(gameId)
          .then(() => {
             // Optional: Show a success message/toast
             console.log('Invite code copied to clipboard!');
          })
          .catch(err => {
             console.error('Failed to copy invite code: ', err);
             // Optional: Show an error message/toast
          });
    }
  };

  const handleReady = () => {
    // Only allow readying up if the current player exists and all players are present
    if (currentPlayer && allPlayersPresent) {
      setPlayerReady();
    }
  };

  // Handle navigation request (opens confirmation)
  const handleNavRequest = (type: 'category' | 'mode') => {
    // Prevent non-host from even initiating the 'category' back navigation
    if (type === 'category' && !isHost) {
      console.warn('Non-host attempted to navigate back to categories.');
      return; // Should be blocked by disabled button, but safety check
    }

    setConfirmDialog({ isOpen: true, type });
  };

  // Handle the actual navigation AFTER confirmation
  const handleConfirmNavigation = () => {
    // Notify server if leaving the game
    if (isHost && socket?.connected) {
      console.log('Host is leaving the game, notifying server');
      socket.emit('leaveGame', { gameId, isHost: true });
    } else if (!isHost && socket?.connected) { // Ensure it's the non-host case
      console.log('Player is leaving the game, notifying server');
      socket.emit('leaveGame', { gameId, isHost: false });
    } else {
      console.warn('Socket not connected while trying to leave game.');
      // Decide if resetGame should still be called if socket is not connected
      // It's generally safer to reset local state regardless
    }

    // --- FIX: Execute navigation callback BEFORE resetting local state ---
    // This allows the parent component (App.tsx) to read the player's host status
    // from the store *before* it gets cleared by resetGame()
    if (confirmDialog.type === 'category' && onBackToCategory) {
      onBackToCategory();
    } else if (confirmDialog.type === 'mode' && onBackToMode) {
      onBackToMode();
    }
    // --- End Fix ---

    // Clean up local Zustand store state and disconnect socket AFTER navigation logic runs
    resetGame();

    // Close the confirmation dialog
    setConfirmDialog({ isOpen: false, type: null });
  };

  // Determine if all present players are ready
  const allPlayersReady = allPlayersPresent && players.every(p => p.isReady);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#1a1a1a] text-white"> {/* Added bg and text color */}
      {/* Navigation buttons */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
        {onBackToCategory && (
          <NavigationButton
            icon={ArrowLeft}
            label={NAVIGATION_LABELS.CATEGORIES}
            onClick={() => handleNavRequest('category')}
            disabled={!isHost} // Only host can go back to categories
            tooltip={!isHost ? "Only the host can change category/go back" : undefined}
          />
        )}

        {onBackToMode && (
          <NavigationButton
            icon={Home}
            label={NAVIGATION_LABELS.MODES}
            onClick={() => handleNavRequest('mode')} // Both players can go back to mode select
            delay={0.1} // Example animation delay
          />
        )}
      </div>

      {/* Host indicator */}
      {isHost && (
        <div className="fixed top-4 right-4 px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
          <Crown size={14} /> Host
        </div>
      )}

      {/* Confirmation dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirmNavigation}
        onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
        title="Leave Lobby?" // Adjusted title slightly
        message={isHost
          ? CONFIRMATION_MESSAGES.HOST_LEAVE_LOBBY // "Leaving will end the game for everyone. Are you sure?"
          : CONFIRMATION_MESSAGES.LEAVE_LOBBY}     // "Are you sure you want to leave the lobby?"
        confirmText={confirmDialog.type === 'category'
          ? `Go to ${NAVIGATION_LABELS.CATEGORIES}` // More descriptive confirm text
          : `Go to ${NAVIGATION_LABELS.MODES}`}
        cancelText={NAVIGATION_LABELS.STAY} // "Stay"
      />

      <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 shadow-xl">
        {/* Header with game code */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">1v1 Game Lobby</h2>
          {gameId ? (
             <div className="flex items-center gap-2">
               <input
                 type="text"
                 value={gameId}
                 readOnly
                 className="bg-gray-700 text-white px-3 py-1 rounded font-mono text-sm w-24 sm:w-auto" // Responsive width
               />
               <button
                 onClick={copyInviteCode}
                 className="p-2 rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
                 title="Copy invite code"
               >
                 <Copy size={20} />
               </button>
             </div>
          ) : (
            <span className="text-sm text-gray-400">Generating code...</span>
          )}

        </div>

        {/* Player count indicator */}
        <div className="mb-6 flex items-center justify-center">
          <div className="bg-gray-700 rounded-full px-4 py-2 flex items-center gap-2">
            <Users size={20} className="text-green-400" />
            <span className="text-white font-medium">
              {playerCount}/{requiredPlayers} Players
            </span>
          </div>
        </div>

        {/* Waiting state message */}
        {waitingForPlayers && playerCount < requiredPlayers && (
          <div className="text-center mb-8 animate-pulse">
            <div className="flex items-center justify-center gap-3 text-yellow-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg font-medium">
                Waiting for opponent...
              </span>
            </div>
            <p className="text-gray-400 mt-2 text-sm sm:text-base"> {/* Responsive text size */}
              Share the game code above with your opponent to start!
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
                className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${ // Responsive padding
                  player.id === currentPlayer?.id ? 'bg-gray-700' : 'bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden mr-2"> {/* Added overflow hidden */}
                  <span className="text-white font-medium truncate">{player.username}</span> {/* Added truncate */}
                  {player.id === currentPlayer?.id && (
                    <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded flex-shrink-0"> {/* Added shrink */}
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0"> {/* Added shrink */}
                  {/* Show Ready Up button only for current player, if not ready, and opponent is present */}
                  {player.id === currentPlayer?.id && !player.isReady && allPlayersPresent && (
                    <button
                      onClick={handleReady}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={startCountdown !== null} // Disable if countdown started
                    >
                      <Shield size={16} />
                      Ready Up
                    </button>
                  )}
                  {/* Show Ready/Not Ready status */}
                  {player.isReady ? (
                    <span className="text-green-400 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                      <ShieldCheck size={16} />
                      Ready
                    </span>
                  ) : (
                    <span className="text-gray-400 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                      <Shield size={16} />
                      Not Ready
                    </span>
                  )}
                </div>
              </div>
            ))}
            {/* Placeholder for opponent if waiting */}
            {playerCount < requiredPlayers && (
              <div className="p-4 rounded-lg bg-gray-700/30 border-2 border-dashed border-gray-600">
                <div className="text-gray-400 text-center">
                  Waiting for opponent...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Countdown display */}
        {startCountdown !== null && startCountdown > 0 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-2xl text-green-400 font-bold">
              <Clock className="w-6 h-6 animate-pulse" />
              <span className="animate-pulse">
                Game starting in {startCountdown}...
              </span>
            </div>
          </div>
        )}

        {/* Status message when countdown is not active */}
        {startCountdown === null && (
          <div className="text-center text-gray-400 h-6"> {/* Added fixed height */}
            {allPlayersReady ? (
              <p>All players ready! Starting game...</p>
            ) : allPlayersPresent ? (
              <p>Waiting for players to be ready...</p>
            ) : (
              // Message is already shown above if waiting, keep this space consistent
              <p>&nbsp;</p> // Non-breaking space to maintain height
            )}
          </div>
        )}
      </div>
    </div>
  );
};