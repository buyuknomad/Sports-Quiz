// Main App component with improved navigation and multiplayer transition fix
// Updated import statement to use default import for Home component
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import Home from './components/Home';
import WelcomeScreen from './components/WelcomeScreen';
import { CategorySelect } from './components/CategorySelect';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import QuizGame from './components/QuizGame';
import SoloResultsScreen from './components/SoloResultsScreen';
import { OneVsOneResultsScreen } from './components/OneVsOneResultsScreen';
import { InviteSystem } from './components/InviteSystem';
import { useGameStore } from './store/gameStore';
import { useOneVsOneStore } from './store/oneVsOneStore';
import type { GameMode, Category } from './types';

function App() {
  const [gameState, setGameState] = useState<'home' | 'welcome' | 'category' | 'invite' | 'lobby' | 'game' | 'results' | 'loading'>('home');
  const [currentMode, setCurrentMode] = useState<GameMode>('solo');
  const [categorySelectionInProgress, setCategorySelectionInProgress] = useState(false);
  
  const { 
    initializeGame: initializeSoloGame, 
    addPlayer,
    setCategory: setSoloCategory,
    isGameStarted: isSoloGameStarted, 
    isGameEnded: isSoloGameEnded,
    resetGame: resetSoloGame,
    players: soloPlayers
  } = useGameStore();

  const {
    initializeGame: initialize1v1Game,
    createGame: create1v1Game,
    isGameStarted: is1v1GameStarted,
    isGameEnded: is1v1GameEnded,
    resetGame: reset1v1Game,
    setCategory: set1v1Category,
    players: multiPlayers,
    getCurrentPlayer,
    socket,
    hasJoinedGame
  } = useOneVsOneStore();

  const handleHomeStart = (username: string) => {
    localStorage.setItem('username', username);
    resetSoloGame();
    reset1v1Game();
    setGameState('welcome');
  };

  const handleStart = async (username: string, selectedMode: GameMode) => {
    try {
      setCurrentMode(selectedMode);
      
      if (selectedMode === 'solo') {
        resetSoloGame();
        await initializeSoloGame(selectedMode);
        addPlayer(username);
        setGameState('category');
      } else {
        reset1v1Game();
        await initialize1v1Game();
        setGameState('invite');
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handlePlayAgain = async () => {
    const username = localStorage.getItem('username') || 'Guest';
    
    if (currentMode === 'solo') {
      resetSoloGame();
      initializeSoloGame(currentMode);
      addPlayer(username);
      setGameState('category');
    } else {
      // For 1v1 mode, reset the game and go to invite/create game page
      try {
        reset1v1Game();
        await initialize1v1Game();
        
        // Check if user is connected to socket
        if (socket && socket.connected) {
          // Direct to invite page where user can create or join a game
          setGameState('invite');
        } else {
          // If socket connection failed, redirect to welcome screen
          console.log('Socket connection not established, redirecting to welcome screen');
          setGameState('welcome');
        }
      } catch (error) {
        console.error('Error restarting 1v1 game:', error);
        // In case of error, fall back to welcome screen
        setGameState('welcome');
      }
    }
  };

  const handleInviteSuccess = () => {
    if (multiPlayers.length >= 2) {
      console.log('Player appears to have joined an existing game with multiple players');
      
      const currentPlayer = getCurrentPlayer();
      
      if (currentPlayer && !currentPlayer.isHost) {
        console.log('Current player is not host, directing to lobby');
        setGameState('lobby');
        return;
      }
    }
    
    if (hasJoinedGame) {
      const currentPlayer = getCurrentPlayer();
      const isHost = currentPlayer?.isHost;
      
      if (!isHost) {
        console.log('Player has joined an existing game as non-host, directing to lobby');
        setGameState('lobby');
        return;
      }
    }
    
    console.log('Player is starting a new game or is the host, directing to category selection');
    setGameState('category');
  };

  const handleCategorySelect = async (category: Category) => {
    // Add a debounce mechanism with component state
    if (categorySelectionInProgress) {
      console.log('Category selection already in progress, ignoring');
      return;
    }
    
    try {
      // Set the debounce flag
      setCategorySelectionInProgress(true);
      
      console.log(`App handling category selection: ${category} for mode: ${currentMode}`);
      
      if (currentMode === 'solo') {
        try {
          // Show loading state immediately to prevent any other actions
          setGameState('loading');
          
          // Then set category, which will load questions
          await setSoloCategory(category);
          
          // The gameState will be updated to 'game' by the useEffect when isGameStarted becomes true
        } catch (error) {
          console.error('Error setting solo category:', error);
          // If there's an error, go back to category selection
          setGameState('category');
        }
      } else {
        // 1v1 mode - The critical fix is here!
        try {
          if (!hasJoinedGame) {
            // If not joined yet, create game first, then set state
            console.log('Creating new 1v1 game with category:', category);
            await create1v1Game(category);
            // Only AFTER game creation is complete, change the state
            setGameState('lobby');
          } else {
            // If already joined, update category first
            console.log('Already joined a game, updating category');
            set1v1Category(category);
            // Change state to lobby only after category is updated
            setGameState('lobby');
          }
        } catch (error) {
          console.error('Error creating/updating 1v1 game:', error);
        }
      }
    } finally {
      // Clear the debounce flag after a delay
      setTimeout(() => {
        setCategorySelectionInProgress(false);
      }, 1000);
    }
  };

  const handleReturnToModeSelect = () => {
    resetSoloGame();
    reset1v1Game();
    setGameState('welcome');
  };

  const handleBackToCategory = () => {
    if (currentMode === 'solo') {
      // Instead of initializing a new game, just change the state
      // Don't reset or initialize the game here
      setGameState('category');
    } else {
      // For multiplayer, going back to category is only possible for the host
      const currentPlayer = getCurrentPlayer();
      if (currentPlayer && currentPlayer.isHost) {
        setGameState('category');
      } else {
        // Non-host players would go to lobby instead
        setGameState('lobby');
      }
    }
  };

  // Listen for the custom game started event
  useEffect(() => {
    const handleGameStarted = () => {
      console.log('Custom game started event received, forcing transition to game');
      if (gameState === 'lobby') {
        setGameState('game');
      }
    };

    window.addEventListener('sportiq:gameStarted', handleGameStarted);
    
    return () => {
      window.removeEventListener('sportiq:gameStarted', handleGameStarted);
    };
  }, [gameState]);

  // More targeted effect for loading -> game transition
  useEffect(() => {
    if (gameState === 'loading' && (
        (currentMode === 'solo' && isSoloGameStarted) ||
        (currentMode === '1v1' && is1v1GameStarted)
      )) {
      console.log('Game started while in loading screen, transitioning to game screen');
      setGameState('game');
    }
  }, [isSoloGameStarted, is1v1GameStarted, currentMode, gameState]);
  
  // Specific effect for lobby -> game transition
  useEffect(() => {
    if (gameState === 'lobby' && currentMode === '1v1' && is1v1GameStarted && !is1v1GameEnded) {
      console.log('1v1 game started while in lobby state, transitioning to game screen');
      setGameState('game');
    }
  }, [is1v1GameStarted, is1v1GameEnded, currentMode, gameState]);

  // Keep this effect for other state transitions like results
  useEffect(() => {
    if (currentMode === 'solo' && isSoloGameEnded) {
      console.log('Solo game ended, transitioning to results screen');
      setGameState('results');
    } else if (currentMode === '1v1' && is1v1GameEnded) {
      console.log('1v1 game ended, transitioning to results screen');
      setGameState('results');
    }
  }, [isSoloGameEnded, is1v1GameEnded, currentMode]);

  useEffect(() => {
    if (socket && currentMode === '1v1') {
      const handleGameOver = (data: any) => {
        console.log('Game over event received in App.tsx:', data);
        setGameState('results');
        
        setTimeout(() => {
          if (gameState !== 'results' && is1v1GameEnded) {
            console.log('Forcing transition to results screen');
            setGameState('results');
          }
        }, 1000);
      };

      socket.on('gameOver', handleGameOver);
      
      return () => {
        socket.off('gameOver', handleGameOver);
      };
    }
  }, [socket, currentMode, is1v1GameEnded, gameState]);

  useEffect(() => {
    if (currentMode === '1v1' && is1v1GameEnded && gameState !== 'results') {
      console.log('Game ended but UI not in results state, forcing transition');
      
      const timer = setTimeout(() => {
        setGameState('results');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentMode, is1v1GameEnded, gameState]);

  useEffect(() => {
    console.log('Current game state:', {
      mode: currentMode,
      state: gameState,
      isSoloGameStarted,
      isSoloGameEnded,
      is1v1GameStarted,
      is1v1GameEnded,
      soloPlayersCount: soloPlayers.length,
      multiPlayersCount: multiPlayers.length,
      hasJoinedGame,
      categorySelectionInProgress
    });
  }, [
    gameState, 
    currentMode, 
    isSoloGameStarted, 
    isSoloGameEnded, 
    is1v1GameStarted, 
    is1v1GameEnded, 
    soloPlayers.length, 
    multiPlayers.length,
    hasJoinedGame,
    categorySelectionInProgress
  ]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#1a1a1a]">
        {gameState === 'home' && (
          <Home onStart={handleHomeStart} />
        )}
        {gameState === 'welcome' && (
          <WelcomeScreen onStart={handleStart} />
        )}
        {gameState === 'invite' && (
          <InviteSystem onJoinSuccess={handleInviteSuccess} />
        )}
        {gameState === 'category' && (
          <CategorySelect 
            onSelect={handleCategorySelect}
            mode={currentMode}
            onBack={handleReturnToModeSelect}
          />
        )}
        {gameState === 'loading' && (
          <div className="min-h-screen bg-background p-4 flex items-center justify-center">
            <div className="text-white text-center p-8">
              <h2 className="text-2xl font-bold mb-4">Loading Quiz...</h2>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-2 bg-green-500 rounded-full animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        )}
        {gameState === 'lobby' && currentMode === '1v1' && (
          <MultiplayerLobby />
        )}
        {/* Use a stable key to prevent unnecessary remounting of QuizGame */}
        {gameState === 'game' && (
          <QuizGame 
            key={`game-${currentMode}-${soloPlayers[0]?.id || 'solo'}`}
            mode={currentMode} 
            onBackToCategory={handleBackToCategory}
            onBackToMode={handleReturnToModeSelect}
          />
        )}
        {gameState === 'results' && (
          currentMode === 'solo' ? (
            <SoloResultsScreen onPlayAgain={handlePlayAgain} onHome={handleReturnToModeSelect} />
          ) : (
            <OneVsOneResultsScreen onPlayAgain={handlePlayAgain} onHome={handleReturnToModeSelect} />
          )
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;