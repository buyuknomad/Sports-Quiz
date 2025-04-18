// Enhanced game store with correct answers tracking, user auth and result saving
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { fetchQuestions } from '../lib/supabase-client';
import { saveGameResults } from '../services/GameResultsService';
import type { GameState, GameMode, Category, Player, Question, ChatMessage, GameStore } from '../types';
import { supabase } from '../lib/supabase-client';

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
  socket: null,
  // Add tracking of answers for each question
  userAnswers: []
};

export const useGameStore = create<GameStore>((set, get) => {
  let transitionTimeout: NodeJS.Timeout | null = null;

  const clearTimeouts = () => {
    if (transitionTimeout) clearTimeout(transitionTimeout);
  };

  // Function to get current user from Supabase
  const getCurrentUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  return {
    ...initialState,
    userAnswers: [],

    resetGame: () => {
      clearTimeouts();
      set({
        ...initialState,
        startTime: Date.now(),
        questionStartTime: Date.now(),
        currentPlayerId: nanoid(),
        userAnswers: []
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
        isGameStarted: false,
        userAnswers: []
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
          userAnswers: [],
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

    endGame: async () => {
      const state = get();
      if (state.mode === 'solo') {
        const endTime = Date.now();
        const totalTime = (endTime - state.startTime) / 1000;
        
        // Update the state
        set({
          isGameStarted: false,
          isGameEnded: true,
          completionTime: totalTime
        });
        
        // Return a promise that resolves when state is updated
        return new Promise<void>(resolve => {
          // Small timeout to ensure state update completes
          setTimeout(async () => {
            // Try to get the current authenticated user
            const user = await getCurrentUser();
            
            // If user is logged in, save the results
            if (user) {
              const currentPlayer = state.players[0];
              
              if (currentPlayer) {
                const correctAnswers = currentPlayer.correctAnswers || 0;
                
                // Prepare question details for saving
                const questionDetails = state.userAnswers.map(answer => ({
                  questionId: answer.questionId,
                  userAnswer: answer.answer,
                  isCorrect: answer.isCorrect,
                  responseTime: answer.responseTime
                }));
                
                // Save the results to the database
                try {
                  await saveGameResults({
                    userId: user.id,
                    mode: state.mode,
                    category: state.category,
                    score: currentPlayer.score,
                    correctAnswers,
                    totalQuestions: state.questions.length,
                    completionTime: totalTime,
                    questionDetails
                  });
                  console.log('Game results saved successfully');
                } catch (error) {
                  console.error('Failed to save game results:', error);
                }
              }
            } else {
              console.log('User not logged in, skipping result saving');
            }
            
            resolve();
          }, 50);
        });
      }
      
      return Promise.resolve();
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

      // Save answer details for history and analytics
      const answerData = {
        questionId: currentQ.id,
        questionIndex: state.currentQuestion,
        question: currentQ.question,
        answer,
        correctAnswer: currentQ.correctAnswer,
        isCorrect,
        responseTime,
        timestamp: Date.now()
      };

      if (state.mode === 'solo') {
        set(state => ({
          ...state,
          questionResponseTimes: newResponseTimes,
          scores: new Map(state.scores).set(currentPlayer.id, totalScore),
          userAnswers: [...state.userAnswers, answerData],
          players: state.players.map(p => 
            p.id === currentPlayer.id 
              ? { 
                  ...p, 
                  score: totalScore,
                  correctAnswers: isCorrect ? (p.correctAnswers || 0) + 1 : (p.correctAnswers || 0) 
                } 
              : p
          ),
          isTransitioning: true
        }));

        if (transitionTimeout) clearTimeout(transitionTimeout);

        // Check if this is the last question
        const isLastQuestion = state.currentQuestion >= state.questions.length - 1;
        
        transitionTimeout = setTimeout(() => {
          if (isLastQuestion) {
            // If it's the last question, end the game
            get().endGame();
          } else {
            // Otherwise proceed to the next question
            set({
              currentQuestion: state.currentQuestion + 1,
              timeRemaining: 15,
              isTransitioning: false,
              selectedAnswer: null,
              isAnswerChecked: false,
              isCorrect: false
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
