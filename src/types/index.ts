// Types for the Sports Quiz App with correct answers tracking


// Update GameMode to include the new options
export type GameMode = 'solo' | '1v1' | 'create' | 'join';
export type Category = 'football' | 'basketball' | 'tennis' | 'olympics' | 'mixed';

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export interface Player {
  id: string;
  username: string;
  score: number;
  correctAnswers: number; // Added to track correct answers
  isReady?: boolean;
  hasFinished?: boolean;
  isHost?: boolean;
  rematchReady?: boolean;
  responseTimes?: number[];
}

export interface Question {
  id: string;
  category: Category;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface GameState {
  gameId: string;
  mode: GameMode;
  category: Category;
  players: Player[];
  currentQuestion: number;
  questions: Question[];
  timeRemaining: number;
  isGameStarted: boolean;
  isGameEnded: boolean;
  chatMessages: ChatMessage[];
  startCountdown: number | null;
  finishedPlayers: Set<string>;
  answeredPlayers: Set<string>;
  startTime: number;
  questionStartTimes: number[];
  questionResponseTimes: number[];
  playerResponseTimes: Map<string, number[]>;
  completionTime?: number;
  isTransitioning: boolean;
  waitingForPlayers: boolean;
  currentPlayerId: string;
  scores: Map<string, number>;
  selectedAnswer: string | null;
  isAnswerChecked: boolean;
  isCorrect: boolean;
  nextQuestionPending: number | null;
  lastSyncTime: number;
  questionStartTime: number;
  socket: any;
}

export interface GameStore extends GameState {
  initializeGame: (mode: GameMode, category: Category) => Promise<void>;
  joinGame: (gameId: string, username: string) => void;
  setTimeRemaining: (time: number) => void;
  setCategory: (category: Category) => Promise<void>;
  startGame: () => void;
  endGame: () => void;
  nextQuestion: () => void;
  checkAnswer: (answer: string) => boolean;
  addChatMessage: (playerId: string, message: string) => void;
  setPlayerReady: () => void;
  getCurrentPlayer: () => Player | undefined;
  submitAnswer: (answer: string, timeRemaining: number, points: number, totalScore: number) => void;
  resetGame: () => void;
  setIsTransitioning: (value: boolean) => void;
  handleRematch: (gameId: string, playerId: string) => void;
  getPlayerResponseTimes: (playerId: string) => number[];
  addPlayer: (username: string) => void;
}