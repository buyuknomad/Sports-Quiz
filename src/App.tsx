// Main App component with improved navigation and multiplayer transition fix
import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
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
import { clearQuestionCache } from './lib/supabase-client';
import { RouteTracker } from './components/analytics/RouteTracker';


function App() {
  const [gameState, setGameState] = useState<'home' | 'welcome' | 'category' | 'invite' | 'lobby' | 'game' | 'results' | 'loading'>('home');
  const [currentMode, setCurrentMode] = useState<GameMode>('solo');
  const [categorySelectionInProgress, setCategorySelectionInProgress] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
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
    hasJoinedGame,
    requestRematch
  } = useOneVsOneStore();

  const handleHomeStart = (username: string) => {
    localStorage.setItem('username', username);
    resetSoloGame();
    reset1v1Game();
    setGameState('welcome');
  };

  const handleStart = async (username: string, selectedMode: GameMode) => {
    try {
      // Set currentMode to either 'solo' or '1v1' for the game stores
      // Both 'create' and 'join' use the '1v1' game mode
      setCurrentMode(selectedMode === 'solo' ? 'solo' : '1v1');
      
      if (selectedMode === 'solo') {
        resetSoloGame();
        await initializeSoloGame('solo');
        addPlayer(username);
        setGameState('category');
      } else if (selectedMode === 'create') {
        // Host path: Create a new 1v1 game 
        reset1v1Game();
        await initialize1v1Game();
        setGameState('category'); // Go to category selection first
      } else if (selectedMode === 'join') {
        // Guest path: Skip category, go straight to invite system in join mode
        reset1v1Game();
        await initialize1v1Game();
        // Set a flag to show the join UI directly
        localStorage.setItem('showJoinUI', 'true');
        setGameState('invite');
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handlePlayAgain = async () => {
    const username = localStorage.getItem('username') || 'Guest';
    
    // Clear question cache to get fresh questions on restart
    clearQuestionCache();
    
    if (currentMode === 'solo') {
      resetSoloGame();
      initializeSoloGame(currentMode);
      addPlayer(username);
      setGameState('category');
    } else {
      // For 1v1 mode, we don't need to do anything here
      // The rematch process is handled by the OneVsOneResultsScreen component
      // The store will handle the socket events and state updates
      console.log('1v1 rematch is handled directly by the rematch system');
    }
  };

  const handleInviteSuccess = () => {
    // User has clicked "Continue to Lobby" on InviteSystem
    // The game is already created in the InviteSystem component
    setGameState('lobby');
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
        // 1v1 mode - store selected category and go to invite screen
        setSelectedCategory(category);
        
        if (hasJoinedGame) {
          // Already joined a game (went back from lobby)
          console.log('Already joined game, updating category');
          set1v1Category(category);
          setGameState('lobby');
        } else {
          // New game flow - go to invite system
          console.log('Selected category for new game:', category);
          setGameState('invite');
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
    // Check if we're being redirected to category selection
    const goToCategory = localStorage.getItem('goToCategory') === 'true';
    
    // Clean up the stored states
    localStorage.removeItem('goToCategory');
    
    // Reset game states
    resetSoloGame();
    reset1v1Game();
    setSelectedCategory(null);
    
    // Redirect based on context
    if (goToCategory) {
      console.log('Redirecting to category selection from invite screen');
      setGameState('category');
    } else {
      // Otherwise go to welcome screen
      setGameState('welcome');
    }
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

  // Listen for custom returnToLobby event for rematch
  useEffect(() => {
    const handleReturnToLobby = () => {
      console.log('Custom returnToLobby event received, navigating to lobby');
      setGameState('lobby');
    };
    
    window.addEventListener('sportiq:returnToLobby', handleReturnToLobby);
    
    return () => {
      window.removeEventListener('sportiq:returnToLobby', handleReturnToLobby);
    };
  }, []);
  
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
      categorySelectionInProgress,
      selectedCategory,
      isHost: getCurrentPlayer()?.isHost,
      goToCategory: localStorage.getItem('goToCategory')
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
    categorySelectionInProgress,
    selectedCategory,
    getCurrentPlayer
  ]);

  // Handle rematch for 1v1 mode
  const handle1v1Rematch = () => {
    // This will be called from the results screen
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return;
    
    // Just request a rematch using the store function
    requestRematch(currentPlayer.id);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RouteTracker />
        <div className="min-h-screen bg-[#1a1a1a]">
          {gameState === 'home' && (
            <Home onStart={handleHomeStart} />
          )}
          {gameState === 'welcome' && (
            <WelcomeScreen onStart={handleStart} />
          )}
          {gameState === 'invite' && (
            <InviteSystem 
              onJoinSuccess={handleInviteSuccess} 
              onBackToMode={handleReturnToModeSelect}
              selectedCategory={selectedCategory} // Pass the selected category
            />
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
            <MultiplayerLobby 
              onBackToCategory={handleBackToCategory}
              onBackToMode={handleReturnToModeSelect}
            />
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
              <OneVsOneResultsScreen 
                onPlayAgain={handle1v1Rematch} 
                onHome={handleReturnToModeSelect} 
              />
            )
          )}
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;