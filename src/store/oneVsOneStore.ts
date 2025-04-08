import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { nanoid } from 'nanoid';
import type { Category, Player, Question, ChatMessage } from '../types';

// Debug flag
const DEBUG = true;

// Add global window properties for socket management
declare global {
  interface Window {
    _globalSocket?: Socket;
    _lastGameCreationTime?: number;
    _socketInitializeAttempt?: number;
    _gameCreationPromise?: Promise<void>;
  }
}

// Get the server URL based on environment
const getServerUrl = () => {
  if (import.meta.env.PROD) {
    return window.location.hostname.includes('netlify')
      ? 'https://quiz-render-tests.onrender.com'
      : window.location.origin;
  }
  return 'http://localhost:3000';
};

// Use the global socket if it exists or create a new one
let socket: Socket;
if (window._globalSocket) {
  console.log('Using existing global socket');
  socket = window._globalSocket;
} else {
  socket = io(getServerUrl(), {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    timeout: 60000,
    autoConnect: false,
    path: '/socket.io/'
  });
  window._globalSocket = socket;
}

// Debug logging for socket events
const logSocketEvents = () => {
  if (!DEBUG) return;
  
  // Only set up listeners once
  if (!(socket as any)._debugEventsAttached) {
    (socket as any)._debugEventsAttached = true;
    
    const originalOn = socket.on.bind(socket);
    socket.on = function(event, listener) {
      console.log(`[SOCKET-DEBUG] Adding listener for: ${event}`);
      return originalOn(event, listener);
    };
    
    const originalEmit = socket.emit.bind(socket);
    socket.emit = function(event, ...args) {
      console.log(`[SOCKET-DEBUG] Emitting event: ${event}`, args[0] ? '(with data)' : '(no data)');
      return originalEmit(event, ...args);
    };
    
    socket.onAny((event, ...args) => {
      console.log(`[SOCKET-DEBUG] Received event: ${event}`, args[0] ? '(with data)' : '(no data)');
    });
  }
};

interface OneVsOneState {
  gameId: string;
  category: Category;
  players: Player[];
  currentQuestion: number;
  questions: Question[];
  isGameStarted: boolean;
  isGameEnded: boolean;
  chatMessages: ChatMessage[];
  startCountdown: number | null;
  answeredPlayers: Set<string>;
  finishedPlayers: Set<string>;
  startTime: number;
  questionStartTime: number;
  questionResponseTimes: number[];
  playerResponseTimes: Map<string, number[]>;
  scores: Map<string, number>;
  waitingForPlayers: boolean;
  currentPlayerId: string;
  socket: Socket;
  isConnecting: boolean;
  hasJoinedGame: boolean;
  completionTime?: number;
  isGameCreationInProgress: boolean;
}

interface OneVsOneStore extends OneVsOneState {
  initializeGame: () => Promise<void>;
  createGame: (category: Category) => Promise<void>;
  joinGame: (gameId: string, username: string) => Promise<void>;
  setPlayerReady: () => void;
  submitAnswer: (answer: string, timeRemaining: number, points: number, totalScore: number) => void;
  getCurrentPlayer: () => Player | undefined;
  addChatMessage: (playerId: string, message: string) => void;
  getPlayerResponseTimes: (playerId: string) => number[];
  resetGame: () => void;
  setCategory: (category: Category) => void;
  endGame: () => void;
  requestRematch: (playerId: string) => void;
}

const initialState: OneVsOneState = {
  gameId: '', // Changed from nanoid(6) to empty string
  category: 'mixed',
  players: [],
  currentQuestion: 0,
  questions: [],
  isGameStarted: false,
  isGameEnded: false,
  chatMessages: [],
  startCountdown: null,
  answeredPlayers: new Set(),
  finishedPlayers: new Set(),
  startTime: Date.now(),
  questionStartTime: Date.now(),
  questionResponseTimes: [],
  playerResponseTimes: new Map(),
  scores: new Map(),
  waitingForPlayers: true,
  currentPlayerId: '',
  socket,
  isConnecting: false,
  hasJoinedGame: false,
  isGameCreationInProgress: false
};

export const useOneVsOneStore = create<OneVsOneStore>((set, get) => {
  // Enable debug logging
  if (DEBUG) {
    logSocketEvents();
  }
  
  // Socket event handlers
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    set(state => ({ 
      ...state, 
      currentPlayerId: socket.id,
      isConnecting: false
    }));
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    set(state => ({ 
      ...state, 
      isConnecting: false,
      isGameCreationInProgress: false 
    }));
  });

  socket.on('gameCreated', (data) => {
    console.log('Game created:', data);
    set(state => ({
      ...state,
      gameId: data.gameId,
      category: data.category,
      questions: data.questions,
      players: data.players,
      waitingForPlayers: true,
      hasJoinedGame: true,
      isGameCreationInProgress: false,
      playerResponseTimes: new Map(),
      scores: new Map(data.players.map((p: Player) => [p.id, p.score || 0]))
    }));
  });

  socket.on('gameUpdated', (data) => {
    console.log('Game updated:', data);
    
    // Check if this player is in the game
    const isInGame = data.players.some((p: any) => p.id === socket.id);
    
    set(state => {
      // Create a new response times map preserving existing times
      const updatedResponseTimes = new Map(state.playerResponseTimes);
      data.players.forEach((player: Player) => {
        if (player.responseTimes) {
          updatedResponseTimes.set(player.id, player.responseTimes);
        }
      });

      // Create a new scores map
      const updatedScores = new Map(data.players.map((p: Player) => [p.id, p.score || 0]));

      return {
        ...state,
        players: data.players,
        category: data.category,
        questions: data.questions || state.questions,
        waitingForPlayers: data.waitingForPlayers,
        startCountdown: data.startCountdown,
        hasJoinedGame: isInGame || state.hasJoinedGame,
        playerResponseTimes: updatedResponseTimes,
        scores: updatedScores,
        isGameCreationInProgress: false
      };
    });
  });

  socket.on('playerReadyUpdate', (data) => {
    console.log('Player ready update:', data);
    set(state => ({
      ...state,
      players: data.players,
      startCountdown: data.startCountdown
    }));
  });

  socket.on('gameStarted', (data) => {
    console.log('Game started:', data);
    set(state => ({
      ...state,
      isGameStarted: true,
      startTime: Date.now(),
      questionStartTime: Date.now(),
      waitingForPlayers: false,
      startCountdown: null,
      category: data.category,
      questions: data.questions,
      playerResponseTimes: new Map(),
      scores: new Map(data.players.map((p: Player) => [p.id, p.score || 0]))
    }));
    
    // Force navigation to game screen via a custom event
    window.dispatchEvent(new CustomEvent('sportiq:gameStarted'));
  });

  socket.on('scoreUpdate', (data) => {
    console.log('Score update received:', data);
    const { playerId, score, responseTime, correctAnswers } = data;
    
    set(state => {
      // Update scores map
      const newScores = new Map(state.scores);
      newScores.set(playerId, score);

      // Update response times
      const newResponseTimes = new Map(state.playerResponseTimes);
      const currentTimes = newResponseTimes.get(playerId) || [];
      newResponseTimes.set(playerId, [...currentTimes, responseTime]);

      // Update player scores in players array
      const updatedPlayers = state.players.map(p => {
        if (p.id === playerId) {
          return { 
            ...p, 
            score, 
            responseTimes: [...currentTimes, responseTime],
            correctAnswers: correctAnswers !== undefined ? correctAnswers : p.correctAnswers
          };
        }
        return p;
      });

      return {
        ...state,
        scores: newScores,
        playerResponseTimes: newResponseTimes,
        players: updatedPlayers
      };
    });
  });

  socket.on('nextQuestion', (data) => {
    console.log('Next question:', data);
    set(state => ({
      ...state,
      currentQuestion: data.currentQuestion,
      questionStartTime: Date.now(),
      answeredPlayers: new Set()
    }));
  });

  socket.on('gameOver', (data) => {
    console.log('Game over:', data);
    const endTime = Date.now();
    const startTime = get().startTime;
    const completionTime = (endTime - startTime) / 1000;
    
    set(state => {
      // Ensure we have the final scores and response times
      const finalScores = new Map(data.players.map((p: Player) => [p.id, p.score || 0]));
      const finalResponseTimes = new Map(state.playerResponseTimes);
      
      data.players.forEach((player: Player) => {
        if (player.responseTimes) {
          finalResponseTimes.set(player.id, player.responseTimes);
        }
      });

      return {
        ...state,
        isGameStarted: false,
        isGameEnded: true,
        scores: finalScores,
        playerResponseTimes: finalResponseTimes,
        players: data.players,
        completionTime
      };
    });
  });

  socket.on('categoryUpdated', (data) => {
    console.log('Category updated:', data);
    set(state => ({
      ...state,
      category: data.category,
      questions: data.questions
    }));
  });

  socket.on('playerAnswered', (data) => {
    console.log('Player answered:', data);
    const { playerId, score, responseTime, isCorrect, correctAnswers } = data;
    
    set(state => {
      // Update response times for the player
      const newResponseTimes = new Map(state.playerResponseTimes);
      const currentTimes = newResponseTimes.get(playerId) || [];
      newResponseTimes.set(playerId, [...currentTimes, responseTime]);

      // Update scores
      const newScores = new Map(state.scores);
      newScores.set(playerId, score);

      // Update player in players array
      const updatedPlayers = state.players.map(p => {
        if (p.id === playerId) {
          // Use correctAnswers from server if available, otherwise keep existing
          const newCorrectAnswers = correctAnswers !== undefined 
            ? correctAnswers 
            : (p.correctAnswers !== undefined 
                ? (isCorrect ? p.correctAnswers + 1 : p.correctAnswers) 
                : 0);

          return { 
            ...p, 
            score, 
            responseTimes: [...currentTimes, responseTime],
            correctAnswers: newCorrectAnswers
          };
        }
        return p;
      });

      return {
        ...state,
        playerResponseTimes: newResponseTimes,
        scores: newScores,
        players: updatedPlayers,
        answeredPlayers: new Set([...state.answeredPlayers, playerId])
      };
    });
  });
  
  // Add rematch event listeners
  socket.on('rematchRequested', (data) => {
    console.log('Rematch requested by player:', data.playerId);
    
    set(state => {
      // Update the player who requested rematch
      const updatedPlayers = state.players.map(p => {
        if (p.id === data.playerId) {
          return { ...p, rematchReady: true };
        }
        return p;
      });
      
      return {
        ...state,
        players: updatedPlayers
      };
    });
  });
  
  socket.on('goToLobby', (data) => {
    console.log('Going back to lobby with new game data:', data);
    
    set(state => ({
      ...state,
      isGameStarted: false,
      isGameEnded: false,
      currentQuestion: 0,
      questions: data.questions,
      players: data.players,
      scores: new Map(data.players.map((p: Player) => [p.id, p.score || 0])),
      questionResponseTimes: [],
      playerResponseTimes: new Map(),
      finishedPlayers: new Set(),
      answeredPlayers: new Set(),
      startCountdown: null
    }));
    
    // Trigger custom event to navigate back to lobby
    window.dispatchEvent(new CustomEvent('sportiq:returnToLobby'));
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    set(state => ({ 
      ...state, 
      isConnecting: false,
      isGameCreationInProgress: false 
    }));
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
    set(state => ({ 
      ...state, 
      isConnecting: false,
      isGameCreationInProgress: false
    }));
  });

  return {
    ...initialState,
    socket,

    initializeGame: async () => {
      const state = get();
      
      // Check for global initialize attempt lock
      const now = Date.now();
      if (window._socketInitializeAttempt && now - window._socketInitializeAttempt < 5000) {
        console.log('Socket initialization attempted recently, using existing socket');
        
        if (socket.connected) {
          set(state => ({
            ...state,
            currentPlayerId: socket.id,
            isConnecting: false
          }));
          return Promise.resolve();
        }
      }
      
      window._socketInitializeAttempt = now;
      
      // If initialization is already in progress, return the existing promise
      if ((state as any)._initializationPromise) {
        console.log('Initialization already in progress, returning existing promise');
        return (state as any)._initializationPromise;
      }
      
      // If we're already connected, don't try to reconnect
      if (socket.connected) {
        console.log('Socket already connected, skipping initialization');
        
        // Update the state with the socket ID if needed
        if (state.currentPlayerId !== socket.id) {
          set({
            currentPlayerId: socket.id,
            isConnecting: false
          });
        }
        
        return Promise.resolve();
      }
      
      console.log('Initializing game, connecting socket...');
      set({ isConnecting: true });
    
      // Create a promise for the initialization
      const initPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          socket.off('connect', handleConnect);
          socket.off('connect_error', handleError);
          set(state => ({ 
            ...state, 
            isConnecting: false,
            _initializationPromise: null
          }));
          reject(new Error('Socket connection timeout'));
        }, 10000);
    
        const handleConnect = () => {
          console.log('Socket connected for 1v1 game with ID:', socket.id);
          clearTimeout(timeout);
          socket.off('connect', handleConnect);
          socket.off('connect_error', handleError);
          
          // Store the socket globally
          window._globalSocket = socket;
          
          set({
            ...initialState,
            socket,
            currentPlayerId: socket.id,
            isConnecting: false,
            gameId: '', // Empty string, not nanoid()
            hasJoinedGame: false,
            playerResponseTimes: new Map(),
            scores: new Map(),
            _initializationPromise: null
          });
          resolve();
        };
    
        const handleError = (error: Error) => {
          console.error('Socket connection error:', error);
          clearTimeout(timeout);
          socket.off('connect', handleConnect);
          socket.off('connect_error', handleError);
          set(state => ({ 
            ...state, 
            isConnecting: false,
            _initializationPromise: null,
            isGameCreationInProgress: false
          }));
          reject(error);
        };
    
        if (socket.connected) {
          handleConnect();
        } else {
          socket.once('connect', handleConnect);
          socket.once('connect_error', handleError);
          socket.connect();
        }
      });
    
      // Store the promise in the state
      set(state => ({ 
        ...state, 
        _initializationPromise: initPromise
      }));
    
      return initPromise;
    },

    createGame: async (category: Category) => {
      const username = localStorage.getItem('username') || 'Guest';
      const state = get();
      
      // Check if game creation is already in progress
      if (state.isGameCreationInProgress) {
        console.log('Game creation already in progress, ignoring duplicate request');
        return Promise.resolve();
      }
      
      // Check if we already have joined a game
      if (state.hasJoinedGame) {
        console.log('Already joined a game, updating category instead');
        get().setCategory(category);
        return Promise.resolve();
      }
      
      // Set flag to prevent duplicate creation
      set(state => ({ ...state, isGameCreationInProgress: true }));
      
      try {
        if (!socket.connected) {
          console.log('Socket not connected, attempting to connect before creating game');
          try {
            await get().initializeGame();
          } catch (error) {
            console.error('Failed to initialize socket connection:', error);
            set(state => ({ ...state, isGameCreationInProgress: false }));
            throw new Error('Failed to connect to game server');
          }
        }
    
        console.log('Creating game with category:', category, 'Socket connected:', socket.connected);
        
        // Use a global promise to track game creation
        if (window._gameCreationPromise) {
          console.log('Game creation already in progress globally');
          return window._gameCreationPromise;
        }
        
        const createPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            socket.off('gameCreated');
            window._gameCreationPromise = undefined;
            set(state => ({ ...state, isGameCreationInProgress: false }));
            reject(new Error('Game creation timeout'));
          }, 5000);
    
          socket.once('gameCreated', () => {
            clearTimeout(timeout);
            window._gameCreationPromise = undefined;
            set(state => ({
              ...state,
              hasJoinedGame: true,
              isGameCreationInProgress: false
            }));
            resolve();
          });
    
          console.log('Emitting createGame event:', { 
            mode: '1v1', 
            category,
            username
            // No gameId - let server generate it
          });
          
          socket.emit('createGame', { 
            mode: '1v1', 
            category,
            username
            // No gameId - let server generate it
          });
        });
        
        window._gameCreationPromise = createPromise;
        return createPromise;
        
      } catch (error) {
        window._gameCreationPromise = undefined;
        set(state => ({ ...state, isGameCreationInProgress: false }));
        throw error;
      }
    },

    joinGame: async (gameId: string, username: string) => {
      try {
        if (!socket.connected) {
          await get().initializeGame();
        }

        return new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            socket.off('gameUpdated');
            reject(new Error('Join game timeout'));
          }, 5000);

          const handleGameUpdated = (data: any) => {
            const isInGame = data.players.some((p: any) => p.id === socket.id);
            if (isInGame) {
              // The player is in the game, update state
              set(state => ({
                ...state,
                gameId: gameId.trim(),
                hasJoinedGame: true,
                players: data.players,
                scores: new Map(data.players.map((p: Player) => [p.id, p.score || 0])),
                playerResponseTimes: new Map()
              }));
              
              clearTimeout(timeout);
              socket.off('gameUpdated', handleGameUpdated);
              resolve();
            }
          };

          socket.on('gameUpdated', handleGameUpdated);

          console.log('Joining game:', gameId);
          socket.emit('joinGame', { 
            gameId: gameId.trim(),
            username 
          });
        });
      } catch (error) {
        console.error('Error joining game:', error);
        throw error;
      }
    },

    setPlayerReady: () => {
      const { gameId } = get();
      if (!gameId || !socket.connected) return;
      socket.emit('playerReady', { gameId });
    },

    submitAnswer: (answer: string, timeRemaining: number, points: number, totalScore: number) => {
      const state = get();
      const currentPlayer = state.getCurrentPlayer();
      if (!currentPlayer || !socket.connected) return;

      const responseTime = 15 - timeRemaining;
      const newResponseTimes = [...state.questionResponseTimes, responseTime];
      
      // Check if answer is correct
      const currentQuestion = state.questions[state.currentQuestion];
      const isCorrect = currentQuestion && currentQuestion.correctAnswer === answer;
      
      // Calculate new correctAnswers count
      const currentCorrectAnswers = currentPlayer.correctAnswers || 0;
      const newCorrectAnswers = isCorrect ? currentCorrectAnswers + 1 : currentCorrectAnswers;

      socket.emit('submitAnswer', {
        gameId: state.gameId,
        playerId: currentPlayer.id,
        answer,
        timeRemaining,
        points,
        totalScore,
        responseTime,
        allResponseTimes: newResponseTimes,
        isCorrect,
        correctAnswers: newCorrectAnswers
      });

      // Update local state
      set(state => {
        // Update player response times map
        const updatedPlayerResponseTimes = new Map(state.playerResponseTimes);
        updatedPlayerResponseTimes.set(currentPlayer.id, newResponseTimes);
        
        // Update player scores
        const updatedScores = new Map(state.scores);
        updatedScores.set(currentPlayer.id, totalScore);

        // Update players array
        const updatedPlayers = state.players.map(p => 
          p.id === currentPlayer.id 
            ? { 
                ...p, 
                score: totalScore,
                responseTimes: newResponseTimes,
                correctAnswers: newCorrectAnswers
              } 
            : p
        );

        return {
          ...state,
          questionResponseTimes: newResponseTimes,
          playerResponseTimes: updatedPlayerResponseTimes,
          scores: updatedScores,
          players: updatedPlayers,
          answeredPlayers: new Set([...state.answeredPlayers, currentPlayer.id])
        };
      });
    },

    getCurrentPlayer: () => {
      const state = get();
      return state.players.find(p => p.id === state.currentPlayerId);
    },

    getPlayerResponseTimes: (playerId: string) => {
      const state = get();
      const player = state.players.find(p => p.id === playerId);
      
      // First try to get times from player object
      if (player?.responseTimes?.length) {
        return player.responseTimes;
      }
      
      // Then try from the response times map
      const timesFromMap = state.playerResponseTimes.get(playerId);
      if (timesFromMap?.length) {
        return timesFromMap;
      }
      
      // If no times found, return empty array
      return [];
    },

    addChatMessage: (playerId: string, message: string) => {
      const { gameId } = get();
      if (!gameId || !socket.connected) return;
      
      // Get the player name
      const player = get().players.find(p => p.id === playerId);
      if (!player) return;
      
      socket.emit('chatMessage', { gameId, message });
      
      // Add message to local state as well for immediate feedback
      const newMessage = {
        id: nanoid(),
        playerId,
        playerName: player.username,
        message,
        timestamp: Date.now()
      };
      
      set(state => ({
        ...state,
        chatMessages: [...state.chatMessages, newMessage]
      }));
    },

    resetGame: () => {
      if (socket.connected) {
        socket.disconnect();
      }
      set(initialState);
    },
    
    endGame: () => {
      const { gameId, socket } = get();
      if (!gameId || !socket.connected) return;
      
      console.log('Manually ending game:', gameId);
      
      // Emit gameOver event to the server
      socket.emit('gameOver', { gameId });
      
      // Set local state as well in case the server response is delayed
      const endTime = Date.now();
      const startTime = get().startTime;
      const completionTime = (endTime - startTime) / 1000;
      
      set({
        isGameStarted: false,
        isGameEnded: true,
        completionTime
      });
    },

    setCategory: (category: Category) => {
      const state = get();
      const currentPlayer = state.getCurrentPlayer();
      
      if (!currentPlayer?.isHost) {
        console.warn('Only host can change category');
        return;
      }

      if (!socket.connected) {
        console.error('Socket not connected');
        return;
      }

      console.log('Setting category to:', category);
      socket.emit('updateCategory', { 
        gameId: state.gameId, 
        category 
      });

      set(state => ({ ...state, category }));
    },
    
    // Add requestRematch function
    requestRematch: (playerId: string) => {
      const { gameId, socket } = get();
      if (!gameId || !socket.connected) return;
      
      console.log('Requesting rematch:', { gameId, playerId });
      socket.emit('requestRematch', { gameId, playerId });
      
      // Update local state to mark player as rematch ready
      set(state => {
        const updatedPlayers = state.players.map(p => {
          if (p.id === playerId) {
            return { ...p, rematchReady: true };
          }
          return p;
        });
        
        return {
          ...state,
          players: updatedPlayers
        };
      });
    }
  };
});