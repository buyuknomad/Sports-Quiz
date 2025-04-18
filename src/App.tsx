// App.tsx with route-based navigation for the game flow
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Home from './components/Home';
import WelcomeScreen from './components/WelcomeScreen';
import { CategorySelect } from './components/CategorySelect';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import QuizGame from './components/QuizGame';
import SoloResultsScreen from './components/SoloResultsScreen';
import { OneVsOneResultsScreen } from './components/OneVsOneResultsScreen';
import { InviteSystem } from './components/InviteSystem';
import FAQPage from './components/FAQPage';
import AboutPage from './components/AboutPage';
import { useGameStore } from './store/gameStore';
import { useOneVsOneStore } from './store/oneVsOneStore';
import type { GameMode, Category } from './types';
import { clearQuestionCache } from './lib/supabase-client';
import { useAnalyticsEvent } from './hooks/useAnalyticsEvent';

// Auth Components
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import EmailVerification from './components/auth/EmailVerification';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './components/dashboard/Dashboard';
import GameHistory from './components/dashboard/GameHistory';
import Settings from './components/dashboard/Settings';

// Enhanced Route Tracker Component for SPA navigation tracking
const EnhancedRouteTracker = ({ 
  currentView, 
  additionalParams = {} 
}: { 
  currentView: string; 
  additionalParams?: Record<string, any>; 
}) => {
  const { trackPageView, trackEvent } = useAnalyticsEvent();
  const location = useLocation();

  useEffect(() => {
    // Track the current URL path
    trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  useEffect(() => {
    // Track state-based view changes as virtual pageviews
    if (currentView) {
      const viewName = currentView.charAt(0).toUpperCase() + currentView.slice(1);
      trackPageView(`/view/${currentView}`, `${viewName} View`);
      
      // Also track as events for more detailed analytics
      trackEvent('view_screen', {
        screen_name: currentView,
        ...additionalParams
      });
      
      // Log for debugging
      console.log(`Tracked virtual pageview: ${currentView}`, additionalParams);
    }
  }, [currentView, additionalParams, trackPageView, trackEvent]);

  return null;
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// AppContent component - All router-dependent code goes here
const AppContent = () => {
  const [gameState, setGameState] = useState<'home' | 'welcome' | 'category' | 'invite' | 'lobby' | 'game' | 'results' | 'loading'>('home');
  const [currentMode, setCurrentMode] = useState<GameMode>('solo');
  const [categorySelectionInProgress, setCategorySelectionInProgress] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { trackEvent } = useAnalyticsEvent();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use ref to track if we've already performed the initialization for welcome route
  const welcomeInitialized = useRef(false);
  
  const { 
    initializeGame: initializeSoloGame, 
    addPlayer,
    setCategory: setSoloCategory,
    isGameStarted: isSoloGameStarted, 
    isGameEnded: isSoloGameEnded,
    resetGame: resetSoloGame,
    players: soloPlayers,
    endGame: endSoloGame
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
    requestRematch,
    endGame: end1v1Game
  } = useOneVsOneStore();

  // Effect to sync URL with game state - respond to URL changes
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/') {
      setGameState('home');
    } else if (path === '/welcome') {
      setGameState('welcome');
    } else if (path === '/category') {
      setGameState('category');
    } else if (path === '/invite') {
      setGameState('invite');
    } else if (path === '/lobby') {
      setGameState('lobby');
    } else if (path === '/game') {
      setGameState('game');
    } else if (path === '/results') {
      setGameState('results');
    }
  }, [location.pathname]);

  // Handle direct navigation to welcome page - USING A REF TO PREVENT INFINITE LOOP
  useEffect(() => {
    if (location.pathname === '/welcome' && !welcomeInitialized.current) {
      console.log('Direct navigation to welcome screen detected');
      
      // Ensure username is set
      if (!localStorage.getItem('username')) {
        localStorage.setItem('username', 'Guest');
      }
      
      // Mark as initialized to prevent infinite loop
      welcomeInitialized.current = true;
      
      // Update game state if needed
      if (gameState !== 'welcome') {
        setGameState('welcome');
      }
      
      // Also store navigation source in localStorage to help welcome screen detect origins
      localStorage.setItem('navigationSource', 'direct');
      
      // Track navigation
      trackEvent('navigation', { 
        action: 'to_welcome_screen',
        source: 'direct_navigation'
      });
    } else if (location.pathname !== '/welcome') {
      // Reset the flag when navigating away
      welcomeInitialized.current = false;
      
      // Also clear the navigation source
      localStorage.removeItem('navigationSource');
    }
  }, [location.pathname, trackEvent, gameState]);

  const handleHomeStart = (username: string) => {
    // Track home screen start action
    trackEvent('home_start', { username });
    
    localStorage.setItem('username', username);
    resetSoloGame();
    reset1v1Game();
    
    // Set navigation source before redirecting
    localStorage.setItem('navigationSource', 'home');
    
    // Always navigate to welcome URL for consistency
    navigate('/welcome');
  };

  const handleStart = async (username: string, selectedMode: GameMode) => {
    try {
      // Track mode selection
      trackEvent('mode_select', { mode: selectedMode, username });
      
      // Set currentMode to either 'solo' or '1v1' for the game stores
      // Both 'create' and 'join' use the '1v1' game mode
      setCurrentMode(selectedMode === 'solo' ? 'solo' : '1v1');
      
      if (selectedMode === 'solo') {
        resetSoloGame();
        await initializeSoloGame('solo');
        addPlayer(username);
        
        // Use navigate instead of setGameState for proper URL-based routing
        navigate('/category');
      } else if (selectedMode === 'create') {
        // Host path: Create a new 1v1 game 
        reset1v1Game();
        await initialize1v1Game();
        
        // Navigate to category selection
        navigate('/category');
      } else if (selectedMode === 'join') {
        // Guest path: Skip category, go straight to invite system in join mode
        reset1v1Game();
        await initialize1v1Game();
        // Set a flag to show the join UI directly
        localStorage.setItem('showJoinUI', 'true');
        
        // Navigate to invite page
        navigate('/invite');
        
        // Track join game attempt
        trackEvent('join_game_attempt', { mode: '1v1' });
      }
    } catch (error) {
      console.error('Error starting game:', error);
      
      // Track error for analytics
      trackEvent('game_start_error', { 
        mode: selectedMode,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handlePlayAgain = async () => {
    const username = localStorage.getItem('username') || 'Guest';
    
    // Track play again action
    trackEvent('play_again', { mode: currentMode, category: selectedCategory });
    
    // Clear question cache to get fresh questions on restart
    clearQuestionCache();
    
    if (currentMode === 'solo') {
      resetSoloGame();
      initializeSoloGame(currentMode);
      addPlayer(username);
      navigate('/category');
    } else {
      // For 1v1 mode, we don't need to do anything here
      // The rematch process is handled by the OneVsOneResultsScreen component
      // The store will handle the socket events and state updates
      console.log('1v1 rematch is handled directly by the rematch system');
    }
  };

  const handleInviteSuccess = () => {
    // Track successful invitation
    trackEvent('invite_success', { mode: '1v1', category: selectedCategory });
    
    // User has clicked "Continue to Lobby" on InviteSystem
    // The game is already created in the InviteSystem component
    navigate('/lobby');
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
      
      // Track category selection
      trackEvent('category_select', { 
        mode: currentMode, 
        category: category 
      });
      
      if (currentMode === 'solo') {
        try {
          // Show loading state immediately to prevent any other actions
          setGameState('loading');
          
          // Set category, which will load questions
          await setSoloCategory(category);
          
          // Navigate to game page instead of setting state
          navigate('/game');
        } catch (error) {
          console.error('Error setting solo category:', error);
          
          // Track error
          trackEvent('category_select_error', {
            mode: 'solo',
            category,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          // If there's an error, go back to category selection
          navigate('/category');
        }
      } else {
        // 1v1 mode - store selected category and go to invite screen
        setSelectedCategory(category);
        
        if (hasJoinedGame) {
          // Already joined a game (went back from lobby)
          console.log('Already joined game, updating category');
          set1v1Category(category);
          navigate('/lobby');
        } else {
          // New game flow - go to invite system
          console.log('Selected category for new game:', category);
          navigate('/invite');
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
    // Track navigation back to mode selection
    trackEvent('navigation', { 
      action: 'return_to_mode_select',
      from_state: gameState 
    });
    
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
      navigate('/category');
    } else {
      // Otherwise go to welcome screen
      navigate('/welcome');
    }
  };

  const handleBackToCategory = () => {
    // Track navigation back to categories
    trackEvent('navigation', { 
      action: 'back_to_category',
      from_state: gameState,
      mode: currentMode
    });
    
    if (currentMode === 'solo') {
      // Navigate to category selection
      navigate('/category');
    } else {
      // For multiplayer, going back to category is only possible for the host
      const currentPlayer = getCurrentPlayer();
      if (currentPlayer && currentPlayer.isHost) {
        navigate('/category');
      } else {
        // Non-host players would go to lobby instead
        navigate('/lobby');
      }
    }
  };

  // Listen for custom gameEnded event from socket
  useEffect(() => {
    const handleGameEnded = (event: Event) => {
      console.log('Game ended event received, navigating to results');
      navigate('/results');
    };
    
    window.addEventListener('sportiq:gameEnded', handleGameEnded);
    
    return () => {
      window.removeEventListener('sportiq:gameEnded', handleGameEnded);
    };
  }, [navigate]);

  // Listen for custom returnToLobby event for rematch
  useEffect(() => {
    const handleReturnToLobby = () => {
      console.log('Custom returnToLobby event received, navigating to lobby');
      navigate('/lobby');
      
      // Track rematch accepted
      trackEvent('rematch_accepted', {
        mode: '1v1',
        category: selectedCategory
      });
    };
    
    window.addEventListener('sportiq:returnToLobby', handleReturnToLobby);
    
    return () => {
      window.removeEventListener('sportiq:returnToLobby', handleReturnToLobby);
    };
  }, [trackEvent, selectedCategory, navigate]);

  // Listen for the custom game started event
  useEffect(() => {
    const handleGameStarted = () => {
      console.log('Custom game started event received, forcing transition to game');
      navigate('/game');
      
      // Track game start from lobby
      trackEvent('game_started', {
        mode: '1v1',
        category: selectedCategory,
        players_count: multiPlayers.length
      });
    };

    window.addEventListener('sportiq:gameStarted', handleGameStarted);
    
    return () => {
      window.removeEventListener('sportiq:gameStarted', handleGameStarted);
    };
  }, [trackEvent, multiPlayers.length, selectedCategory, navigate]);
  
  // Effect for loading -> game transition
  useEffect(() => {
    if (gameState === 'loading' && (
        (currentMode === 'solo' && isSoloGameStarted) ||
        (currentMode === '1v1' && is1v1GameStarted)
      )) {
      console.log('Game started while in loading screen, transitioning to game screen');
      navigate('/game');
      
      // Track game start from loading screen
      trackEvent('game_started', {
        mode: currentMode,
        category: selectedCategory,
        from_loading: true
      });
    }
  }, [isSoloGameStarted, is1v1GameStarted, currentMode, gameState, trackEvent, selectedCategory, navigate]);
  
  // Specific effect for lobby -> game transition
  useEffect(() => {
    if (location.pathname === '/lobby' && currentMode === '1v1' && is1v1GameStarted && !is1v1GameEnded) {
      console.log('1v1 game started while in lobby state, transitioning to game screen');
      navigate('/game');
      
      // Track multiplayer game start
      trackEvent('game_started', {
        mode: '1v1',
        category: selectedCategory,
        from_lobby: true,
        players_count: multiPlayers.length
      });
    }
  }, [is1v1GameStarted, is1v1GameEnded, currentMode, location.pathname, trackEvent, selectedCategory, multiPlayers.length, navigate]);

  // Track game completion and transition to results
  useEffect(() => {
    if (currentMode === 'solo' && isSoloGameEnded) {
      console.log('Solo game ended, navigating to results page');
      navigate('/results');
      
      // Track solo game completion
      const soloPlayer = soloPlayers[0];
      trackEvent('game_completed', {
        mode: 'solo',
        category: selectedCategory,
        score: soloPlayer?.score || 0,
        correct_answers: soloPlayer?.correctAnswers || 0,
        total_questions: 10
      });
    } else if (currentMode === '1v1' && is1v1GameEnded) {
      console.log('1v1 game ended, navigating to results page');
      navigate('/results');
      
      // Track multiplayer game completion
      const currentPlayer = getCurrentPlayer();
      const opponentPlayer = multiPlayers.find(p => p.id !== currentPlayer?.id);
      
      trackEvent('game_completed', {
        mode: '1v1',
        category: selectedCategory,
        player_score: currentPlayer?.score || 0,
        opponent_score: opponentPlayer?.score || 0,
        correct_answers: currentPlayer?.correctAnswers || 0,
        is_winner: currentPlayer?.score > (opponentPlayer?.score || 0),
        total_questions: 10
      });
    }
  }, [isSoloGameEnded, is1v1GameEnded, currentMode, trackEvent, selectedCategory, soloPlayers, multiPlayers, getCurrentPlayer, navigate]);

  // Socket event listener for game over
  useEffect(() => {
    if (!socket) return;
    
    const handleGameOver = (data: any) => {
      console.log('Game over event received in App.tsx:', data);
      navigate('/results');
    };

    socket.on('gameOver', handleGameOver);
    
    return () => {
      socket.off('gameOver', handleGameOver);
    };
  }, [socket, navigate]);

  // Force transition to results if needed
  useEffect(() => {
    if (currentMode === '1v1' && is1v1GameEnded && location.pathname !== '/results') {
      console.log('Game ended but not on results page, forcing transition');
      
      const timer = setTimeout(() => {
        navigate('/results');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentMode, is1v1GameEnded, location.pathname, navigate]);

  // Handle manual game end for both solo and 1v1 mode
  const handleGameEnd = async () => {
    if (currentMode === 'solo') {
      await endSoloGame();
      navigate('/results');
    } else if (currentMode === '1v1') {
      await end1v1Game();
      // Navigation will happen via socket event
    }
  };

  // Handle rematch for 1v1 mode
  const handle1v1Rematch = () => {
    // This will be called from the results screen
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return;
    
    // Track rematch request
    trackEvent('rematch_requested', {
      mode: '1v1',
      category: selectedCategory,
      player_id: currentPlayer.id
    });
    
    // Just request a rematch using the store function
    requestRematch(currentPlayer.id);
  };

  // Create analytics params object with current state info
  const analyticsParams = {
    mode: currentMode,
    category: selectedCategory || 'none',
    players_solo: soloPlayers.length,
    players_multi: multiPlayers.length,
    is_host: getCurrentPlayer()?.isHost || false,
    game_state: {
      solo_started: isSoloGameStarted,
      solo_ended: isSoloGameEnded,
      multi_started: is1v1GameStarted,
      multi_ended: is1v1GameEnded
    }
  };

  // Handler for navigation to welcome screen from dashboard
  const handleDashboardToWelcome = () => {
    // This sets a special flag indicating we came from Dashboard 
    localStorage.setItem('navigationSource', 'dashboard');
    
    // Ensure username exists
    if (!localStorage.getItem('username')) {
      const user = localStorage.getItem('supabase.auth.token')
        ? JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.user?.user_metadata?.display_name || 'User'
        : 'Guest';
      localStorage.setItem('username', user);
    }
    
    resetSoloGame();
    reset1v1Game();
    
    // Use React Router navigation
    navigate('/welcome');
  };

  return (
    <>
      {/* Enhanced Route Tracker for SPA navigation */}
      <EnhancedRouteTracker 
        currentView={gameState}
        additionalParams={analyticsParams}
      />
      
      <Routes>
        {/* Authentication Routes */}
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/verification" element={<EmailVerification />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard onPlayNewQuiz={handleDashboardToWelcome} />
          </ProtectedRoute>
        } />
        
        <Route path="/history" element={
          <ProtectedRoute>
            <GameHistory />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        {/* Static pages with their own routes */}
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* Game Flow Routes */}
        <Route path="/" element={<Home onStart={handleHomeStart} />} />
        <Route path="/welcome" element={<WelcomeScreen onStart={handleStart} />} />
        <Route path="/category" element={
          <CategorySelect 
            onSelect={handleCategorySelect}
            mode={currentMode}
            onBack={handleReturnToModeSelect}
          />
        } />
        <Route path="/invite" element={
          <InviteSystem 
            onJoinSuccess={handleInviteSuccess} 
            onBackToMode={handleReturnToModeSelect}
            selectedCategory={selectedCategory}
          />
        } />
        <Route path="/lobby" element={
          <MultiplayerLobby 
            onBackToCategory={handleBackToCategory}
            onBackToMode={handleReturnToModeSelect}
          />
        } />
        <Route path="/game" element={
          <QuizGame 
            key={`game-${currentMode}-${soloPlayers[0]?.id || 'solo'}`}
            mode={currentMode} 
            onBackToCategory={handleBackToCategory}
            onBackToMode={handleReturnToModeSelect}
            onGameEnd={handleGameEnd}
          />
        } />
        <Route path="/results" element={
          currentMode === 'solo' 
            ? <SoloResultsScreen onPlayAgain={handlePlayAgain} onHome={handleReturnToModeSelect} /> 
            : <OneVsOneResultsScreen onPlayAgain={handle1v1Rematch} onHome={handleReturnToModeSelect} />
        } />
        
        {/* Fallback route - redirect to home */}
        <Route path="*" element={<Home onStart={handleHomeStart} />} />
      </Routes>
    </>
  );
};

export default App;
