// Enhanced game store with correct answers tracking and removed multiplayer logic
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { fetchQuestions } from '../lib/supabase-client';
import type { GameState, GameMode, Category, Player, Question, ChatMessage, GameStore } from '../types';

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
  waitingForPlayers: false,
  currentPlayerId: nanoid(),
  scores: new Map<string, number>(),
  selectedAnswer: null,
  isAnswerChecked: false,
  isCorrect: false,
  nextQuestionPending: null,
  lastSyncTime: Date.now(),
  questionStartTime: Date.now(),
  socket: null
};

export const useGameStore = create<GameStore>((set, get) => {
  let transitionTimeout: NodeJS.Timeout | null = null;

  const clearTimeouts = () => {
    if (transitionTimeout) clearTimeout(transitionTimeout);
  };

  return {
    ...initialState,

    resetGame: () => {
      clearTimeouts();
      set({
        ...initialState,
        startTime: Date.now(),
        questionStartTime: Date.now(),
        currentPlayerId: nanoid()
      });
    },

    initializeGame: async (mode: GameMode) => {
      // Only handle solo mode initialization
      if (mode !== 'solo') {
        console.log('Non-solo mode requested, deferring to oneVsOneStore');
        return Promise.resolve();
      }

      clearTimeouts();
      const playerId = nanoid();
      
      set({
        ...initialState,
        mode,
        currentPlayerId: playerId,
        startTime: Date.now(),
        questionStartTime: Date.now(),
        waitingForPlayers: false,
        isGameStarted: false
      });
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
          correctAnswers: 0,
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
      
      // Only handle solo mode
      if (state.mode !== 'solo') {
        console.log('Non-solo mode requested, deferring to oneVsOneStore');
        return Promise.resolve();
      }
      
      if ((state as any)._categoryFetchInProgress) {
        console.log('Category fetch already in progress, ignoring duplicate request');
        return;
      }
      
      if (state.category === category && state.questions.length > 0) {
        console.log('Category already set and questions loaded. Skipping duplicate fetch.');
        
        if (!state.isGameStarted) {
          setTimeout(() => {
            set({ isGameStarted: true });
          }, 50);
        }
        return;
      }
      
      try {
        set(state => ({ ...state, _categoryFetchInProgress: true }));
        set(state => ({ ...state, category }));
        
        const questions = await fetchQuestions(category);
        console.log('Fetched questions for category:', category, questions);
        
        set(state => ({
          ...state,
          questions,
          currentQuestion: 0,
          timeRemaining: 15,
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
            correctAnswers: 0,
            isReady: false,
            hasFinished: false
          })),
          _categoryFetchInProgress: false
        }));
        
        setTimeout(() => {
          set({ isGameStarted: true });
        }, 50);
      } catch (error) {
        set(state => ({ ...state, _categoryFetchInProgress: false }));
        console.error('Error in setCategory:', error);
        throw error;
      }
    },

    getCurrentPlayer: () => {
      const state = get();
      return state.players.find(p => p.id === state.currentPlayerId);
    },

    startGame: () => {
      // Solo mode only
      const state = get();
      if (state.mode === 'solo') {
        set({ isGameStarted: true });
      }
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
      }
    },

    setPlayerReady: () => {
      // Solo mode doesn't use this
    },

    addChatMessage: () => {
      // Solo mode doesn't use chat
    },

    setIsTransitioning: (value: boolean) => {
      set({ isTransitioning: value });
    },

    handleRematch: () => {
      // Solo mode doesn't use rematch
    },

    getPlayerResponseTimes: (playerId: string) => {
      const state = get();
      if (playerId === state.currentPlayerId) {
        return state.questionResponseTimes;
      }
      return state.playerResponseTimes.get(playerId) || [];
    },

    joinGame: () => {
      // Solo mode doesn't use this
      return Promise.resolve();
    }
  };
});