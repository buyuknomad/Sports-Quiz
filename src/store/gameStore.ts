// Enhanced game store with correct answers tracking
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { io, Socket } from 'socket.io-client';
import { fetchQuestions } from '../lib/supabase-client';
import type { GameState, GameMode, Category, Player, Question, ChatMessage, GameStore } from '../types';

// Socket.IO configuration
const getServerUrl = () => {
  if (window.location.hostname.includes('webcontainer') || 
      window.location.hostname.includes('stackblitz') || 
      window.location.hostname.includes('codesandbox')) {
    return window.location.origin;
  }
  return import.meta.env.PROD ? window.location.origin : 'http://localhost:3000';
};

const socket: Socket = io(getServerUrl(), {
  transports: ['polling', 'websocket'],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  timeout: 60000,
  autoConnect: false,
  path: '/socket.io/'
});

const initialState: GameState = {
  gameId: '',
  mode: 'solo',
  category: 'mixed',
  players: [],
  currentQuestion: 0,
  questions: [],
  timeRemaining: 15,
  isGameStarted: false,
  isGameEnded: false,
  chatMessages: [],
  startCountdown: null,
  finishedPlayers: new Set<string>(),
  answeredPlayers: new Set<string>(),
  startTime: Date.now(),
  questionStartTimes: [],
  questionResponseTimes: [],
  playerResponseTimes: new Map<string, number[]>(),
  isTransitioning: false,
  waitingForPlayers: true,
  currentPlayerId: nanoid(),
  scores: new Map<string, number>(),
  selectedAnswer: null,
  isAnswerChecked: false,
  isCorrect: false,
  nextQuestionPending: null,
  lastSyncTime: Date.now(),
  questionStartTime: Date.now(),
  socket: socket
};

export const useGameStore = create<GameStore>((set, get) => {
  let transitionTimeout: NodeJS.Timeout | null = null;
  let syncInterval: NodeJS.Timeout | null = null;

  const clearTimeouts = () => {
    if (transitionTimeout) clearTimeout(transitionTimeout);
    if (syncInterval) clearInterval(syncInterval);
  };

  // Socket event handlers
  socket.on('connect', () => {
    console.log('Socket connected with ID:', socket.id);
    set(state => ({
      ...state,
      currentPlayerId: socket.id
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
      waitingForPlayers: true
    }));
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return {
    ...initialState,
    socket,

    resetGame: () => {
      clearTimeouts();
      if (socket.connected) {
        socket.disconnect();
      }
      set({
        ...initialState,
        startTime: Date.now(),
        questionStartTime: Date.now(),
        currentPlayerId: nanoid(),
        socket: socket
      });
    },

    initializeGame: async (mode: GameMode) => {
      clearTimeouts();
      const playerId = nanoid();
      
      set({
        ...initialState,
        mode,
        currentPlayerId: playerId,
        startTime: Date.now(),
        questionStartTime: Date.now(),
        waitingForPlayers: mode !== 'solo',
        socket: socket,
        isGameStarted: false
      });

      if (mode !== 'solo') {
        console.log('Connecting socket for multiplayer game...');
        socket.connect();
      }
    },

    addPlayer: (username: string) => {
      const state = get();
      const playerId = state.currentPlayerId;
      
      set(state => ({
        ...state,
        players: [{
          id: playerId,
          username,
          score: 0,
          correctAnswers: 0, // Initialize correctAnswers
          isReady: false,
          hasFinished: false
        }],
        scores: new Map([[playerId, 0]])
      }));
    },

    setTimeRemaining: (time: number) => {
      set({ timeRemaining: time });
    },

    setCategory: async (category: Category) => {
      const state = get();
      console.log('Setting category:', category, 'Mode:', state.mode);
      
      try {
        // First update the category immediately
        set(state => ({ ...state, category }));
        
        if (state.mode === 'solo') {
          // Then fetch questions for the new category
          const questions = await fetchQuestions(category);
          console.log('Fetched questions for category:', category, questions);
          
          // Update state with new questions and reset game state
          set(state => ({
            ...state,
            questions,
            currentQuestion: 0,
            timeRemaining: 15,
            isGameStarted: true,
            questionResponseTimes: [],
            startTime: Date.now(),
            questionStartTime: Date.now(),
            questionStartTimes: [Date.now()],
            waitingForPlayers: false,
            isGameEnded: false,
            isTransitioning: false,
            selectedAnswer: null,
            isAnswerChecked: false,
            isCorrect: false,
            scores: new Map([[state.currentPlayerId, 0]]),
            players: state.players.map(p => ({
              ...p,
              score: 0,
              isReady: false,
              hasFinished: false
            }))
          }));
        } else {
          const username = state.players[0]?.username || localStorage.getItem('username') || 'Guest';
          console.log('Creating multiplayer game:', {
            mode: state.mode,
            category,
            username
          });
          
          socket.emit('createGame', { 
            mode: state.mode, 
            category, 
            username
          });
        }
      } catch (error) {
        console.error('Error in setCategory:', error);
        throw error;
      }
    },

    getCurrentPlayer: () => {
      const state = get();
      return state.players.find(p => p.id === state.currentPlayerId);
    },

    startGame: () => {
      const state = get();
      socket.emit('startGame', { gameId: state.gameId });
    },

    endGame: () => {
      const state = get();
      if (state.mode === 'solo') {
        const endTime = Date.now();
        const totalTime = (endTime - state.startTime) / 1000;
        
        set({
          isGameStarted: false,
          isGameEnded: true,
          completionTime: totalTime
        });
      } else {
        socket.emit('gameOver', { gameId: state.gameId });
      }
    },

    nextQuestion: () => {
      clearTimeouts();
      set(state => ({
        currentQuestion: state.currentQuestion + 1,
        timeRemaining: 15,
        answeredPlayers: new Set<string>(),
        questionStartTimes: [...state.questionStartTimes, Date.now()],
        isTransitioning: false,
        selectedAnswer: null,
        isAnswerChecked: false,
        isCorrect: false
      }));
    },

    checkAnswer: (answer: string) => {
      const state = get();
      const currentQ = state.questions[state.currentQuestion];
      return currentQ.correctAnswer === answer;
    },

    submitAnswer: (answer: string, timeRemaining: number, points: number, totalScore: number) => {
      const state = get();
      const currentPlayer = state.getCurrentPlayer?.();
      if (!currentPlayer) return;

      const responseTime = 15 - timeRemaining;
      const newResponseTimes = [...state.questionResponseTimes, responseTime];
      const currentQ = state.questions[state.currentQuestion];
      const isCorrect = currentQ.correctAnswer === answer;

      if (state.mode === 'solo') {
        set(state => ({
          ...state,
          questionResponseTimes: newResponseTimes,
          scores: new Map(state.scores).set(currentPlayer.id, totalScore),
          players: state.players.map(p => 
            p.id === currentPlayer.id 
              ? { 
                  ...p, 
                  score: totalScore,
                  correctAnswers: isCorrect ? p.correctAnswers + 1 : p.correctAnswers 
                } 
              : p
          ),
          isTransitioning: true
        }));

        if (transitionTimeout) clearTimeout(transitionTimeout);

        transitionTimeout = setTimeout(() => {
          const currentState = get();
          if (currentState.currentQuestion < currentState.questions.length - 1) {
            set({
              currentQuestion: currentState.currentQuestion + 1,
              timeRemaining: 15,
              isTransitioning: false
            });
          } else {
            set({
              isGameEnded: true,
              completionTime: (Date.now() - currentState.startTime) / 1000
            });
          }
        }, 2000);
      } else {
        socket.emit('submitAnswer', {
          gameId: state.gameId,
          playerId: currentPlayer.id,
          answer,
          timeRemaining,
          points,
          totalScore,
          responseTime,
          allResponseTimes: newResponseTimes,
          isCorrect
        });
      }
    },

    setPlayerReady: () => {
      const state = get();
      if (!state.gameId) return;
      socket.emit('playerReady', { gameId: state.gameId });
    },

    addChatMessage: (playerId: string, message: string) => {
      const state = get();
      socket.emit('chatMessage', { gameId: state.gameId, message });
    },

    setIsTransitioning: (value: boolean) => {
      set({ isTransitioning: value });
    },

    handleRematch: (gameId: string, playerId: string) => {
      socket.emit('requestRematch', { gameId, playerId });
    },

    getPlayerResponseTimes: (playerId: string) => {
      const state = get();
      if (playerId === state.currentPlayerId) {
        return state.questionResponseTimes;
      }
      return state.playerResponseTimes.get(playerId) || [];
    },

    joinGame: (gameId: string, username: string) => {
      clearTimeouts();
      try {
        console.log('Joining game:', gameId, 'as:', username);
        socket.connect();
        socket.emit('joinGame', { gameId, username });
      } catch (error) {
        console.error('Error joining game:', error);
        throw error;
      }
    }
  };
});