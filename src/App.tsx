// Main App component with improved navigation
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './components/Home';
import { WelcomeScreen } from './components/WelcomeScreen';
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
  const [gameState, setGameState] = useState<'home' | 'welcome' | 'category' | 'invite' | 'lobby' | 'game' | 'results'>('home');
  const [currentMode, setCurrentMode] = useState<GameMode>('solo');
  
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
    if (currentMode === 'solo') {
      try {
        await setSoloCategory(category);
        setGameState('game');
      } catch (error) {
        console.error('Error setting solo category:', error);
      }
    } else {
      try {
        if (hasJoinedGame) {
          set1v1Category(category);
        } else {
          await create1v1Game(category);
        }
        setGameState('lobby');
      } catch (error) {
        console.error('Error creating/updating 1v1 game:', error);
      }
    }
  };

  const handleReturnToModeSelect = () => {
    resetSoloGame();
    reset1v1Game();
    setGameState('welcome');
  };

  const handleBackToCategory = () => {
    if (currentMode === 'solo') {
      resetSoloGame();
      initializeSoloGame(currentMode);
      const username = localStorage.getItem('username') || 'Guest';
      addPlayer(username);
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

  useEffect(() => {
    if ((currentMode === 'solo' && isSoloGameStarted && !isSoloGameEnded) ||
        (currentMode === '1v1' && is1v1GameStarted && !is1v1GameEnded)) {
      console.log('Game started, transitioning to game screen');
      setGameState('game');
    }
  }, [isSoloGameStarted, isSoloGameEnded, is1v1GameStarted, is1v1GameEnded, currentMode]);

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
      hasJoinedGame
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
    hasJoinedGame
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
            onCategorySelected={handleCategorySelect}
            onSelect={handleCategorySelect}
            mode={currentMode}
            onBack={handleReturnToModeSelect}
          />
        )}
        {gameState === 'lobby' && currentMode === '1v1' && (
          <MultiplayerLobby />
        )}
        {gameState === 'game' && (
          <QuizGame 
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