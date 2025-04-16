// Enhanced production server with improved CORS and Socket.IO configuration
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'PORT',
  'NODE_ENV'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Question cache with 5-minute expiration
const questionCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Initialize Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Security middleware with updated CSP to allow Google Analytics
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "ws:", "*", "https://www.google-analytics.com"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://www.googletagmanager.com", 
        "https://www.google-analytics.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// CORS configuration with Netlify domain
const corsOrigins = process.env.NODE_ENV === 'production'
  ? ['https://gilded-gnome-a3cf62.netlify.app', 'https://quiz-render-tests.onrender.com']
  : ['http://localhost:5173'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling']
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Express middleware
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Also ensure you're serving the static files properly:
if (process.env.NODE_ENV === 'production') {
  // Serve static files
 app.use(express.static(join(__dirname, 'dist')));
  
  // For any unknown routes, serve the index.html
 app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});
}
// Debug endpoint to check server status
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    environment: process.env.NODE_ENV,
    connections: io.engine.clientsCount,
    uptime: process.uptime()
  });
});

const activeGames = new Map();

const sampleQuestions = [
  {
    id: nanoid(),
    category: 'football',
    question: 'Which country won the 2022 FIFA World Cup?',
    options: ['France', 'Brazil', 'Argentina', 'Germany'],
    correctAnswer: 'Argentina'
  },
  {
    id: nanoid(),
    category: 'football',
    question: 'Who holds the record for most goals in World Cup history?',
    options: ['Pelé', 'Miroslav Klose', 'Ronaldo', 'Just Fontaine'],
    correctAnswer: 'Miroslav Klose'
  },
  {
    id: nanoid(),
    category: 'basketball',
    question: 'Which NBA team has won the most championships?',
    options: ['Los Angeles Lakers', 'Boston Celtics', 'Chicago Bulls', 'Golden State Warriors'],
    correctAnswer: 'Boston Celtics'
  },
  {
    id: nanoid(),
    category: 'basketball',
    question: 'Who holds the NBA record for most points in a single game?',
    options: ['Michael Jordan', 'Kobe Bryant', 'Wilt Chamberlain', 'LeBron James'],
    correctAnswer: 'Wilt Chamberlain'
  },
  {
    id: nanoid(),
    category: 'tennis',
    question: 'Who has won the most Grand Slam singles titles in tennis history?',
    options: ['Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Serena Williams'],
    correctAnswer: 'Novak Djokovic'
  },
  {
    id: nanoid(),
    category: 'tennis',
    question: 'Which Grand Slam tournament is played on clay courts?',
    options: ['Wimbledon', 'US Open', 'French Open', 'Australian Open'],
    correctAnswer: 'French Open'
  },
  {
    id: nanoid(),
    category: 'olympics',
    question: 'Which city hosted the 2020 Summer Olympics (held in 2021)?',
    options: ['Paris', 'Tokyo', 'London', 'Rio de Janeiro'],
    correctAnswer: 'Tokyo'
  },
  {
    id: nanoid(),
    category: 'olympics',
    question: 'Who is the most decorated Olympian of all time?',
    options: ['Usain Bolt', 'Michael Phelps', 'Simone Biles', 'Carl Lewis'],
    correctAnswer: 'Michael Phelps'
  },
  {
    id: nanoid(),
    category: 'mixed',
    question: 'In which sport would you perform a "slam dunk"?',
    options: ['Volleyball', 'Basketball', 'Tennis', 'Football'],
    correctAnswer: 'Basketball'
  },
  {
    id: nanoid(),
    category: 'mixed',
    question: 'What is the diameter of a basketball hoop in inches?',
    options: ['16 inches', '18 inches', '20 inches', '24 inches'],
    correctAnswer: '18 inches'
  }
];

// Function to get questions based on category with randomization
const getQuestionsForCategory = (category) => {
  // First, filter by category or use all for mixed
  let filteredQuestions = category === 'mixed' 
    ? [...sampleQuestions] 
    : sampleQuestions.filter(q => q.category === category);
  
  // Ensure we have at least 10 questions
  if (filteredQuestions.length < 10 && category !== 'mixed') {
    const remainingCount = 10 - filteredQuestions.length;
    const mixedQuestions = sampleQuestions.filter(q => q.category !== category);
    filteredQuestions = [...filteredQuestions, ...mixedQuestions.slice(0, remainingCount)];
  }
  
  // Randomize the questions order
  const randomizedQuestions = [...filteredQuestions].sort(() => Math.random() - 0.5);
  
  // Return exactly 10 questions
  return randomizedQuestions.slice(0, 10);
};

// Function to fetch questions from database with improved randomization
const fetchQuestionsFromDB = async (category) => {
  try {
    // Check if we have questions in the cache for this category
    const cacheKey = `questions_${category}`;
    const now = Date.now();
    
    // Always clear the cache for the requested category to ensure fresh questions
    questionCache.delete(cacheKey);
    
    // Fetch questions from Supabase
    let query = supabase
      .from('questions')
      .select('*')
      .eq('active', true);
    
    // Filter by category if not 'mixed'
    if (category !== 'mixed') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // If no questions found or not enough questions, use sample questions as fallback
    if (!data || data.length < 5) {
      console.log(`Not enough questions found in database for ${category}, using sample questions`);
      return getQuestionsForCategory(category);
    }
    
    // Format questions to match expected structure
    const formattedQuestions = data.map(q => ({
      id: q.id,
      category: q.category,
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer
    }));
    
    // Add the questions to cache with expiration time
    questionCache.set(cacheKey, {
      questions: formattedQuestions,
      expiration: now + CACHE_DURATION
    });
    
    // Apply a strong randomization to ensure different order each time
    const randomizedQuestions = [...formattedQuestions].sort(() => Math.random() - 0.5);
    
    // Return exactly 10 randomized questions
    return randomizedQuestions.slice(0, 10);
  } catch (error) {
    console.error('Error fetching questions:', error);
    // Fallback to sample questions in case of error
    return getQuestionsForCategory(category);
  }
};

// Helper function to serialize game state
const serializeGameState = (game) => {
  if (!game) return null;
  
  // Create a serializable copy of the game object
  return {
    gameId: game.gameId,
    mode: game.mode,
    category: game.category,
    players: game.players.map(p => ({
      ...p,
      responseTimes: Array.from(p.responseTimes || [])
    })),
    currentQuestion: game.currentQuestion,
    questions: game.questions,
    isGameStarted: game.isGameStarted,
    isGameEnded: game.isGameEnded,
    chatMessages: game.chatMessages,
    startCountdown: game.startCountdown,
    waitingForPlayers: game.players.length < 2,
    answeredPlayers: Array.from(game.answeredPlayers || []),
    finishedPlayers: Array.from(game.finishedPlayers || []),
    questionStartTime: game.questionStartTime
  };
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('createGame', async ({ mode, category, username }) => {
    try {
      const gameId = nanoid(6);
      
      // Fetch questions from database
      const gameQuestions = await fetchQuestionsFromDB(category);
      
      // Ensure we have exactly 10 questions
      const selectedQuestions = gameQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      const game = {
        gameId,
        mode,
        category,
        players: [{
          id: socket.id,
          username,
          score: 0,
          isReady: false,
          hasFinished: false,
          isHost: true,
          rematchReady: false,
          responseTimes: []
        }],
        currentQuestion: 0,
        questions: selectedQuestions,
        isGameStarted: false,
        isGameEnded: false,
        chatMessages: [],
        startCountdown: null,
        answeredPlayers: new Set(),
        finishedPlayers: new Set(),
        scores: new Map([[socket.id, 0]]),
        questionStartTime: Date.now()
      };

      activeGames.set(gameId, game);
      socket.join(gameId);
      
      socket.emit('gameCreated', serializeGameState(game));
      console.log(`Game created: ${gameId} by ${username} (Host) with ${selectedQuestions.length} questions`);
    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('error', { message: 'Failed to create game' });
    }
  });

  socket.on('joinGame', ({ gameId, username }) => {
    const game = activeGames.get(gameId);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const newPlayer = {
      id: socket.id,
      username,
      score: 0,
      isReady: false,
      hasFinished: false,
      isHost: false,
      rematchReady: false,
      responseTimes: []
    };

    game.players.push(newPlayer);
    game.scores.set(socket.id, 0);
    
    socket.join(gameId);
    
    io.to(gameId).emit('gameUpdated', serializeGameState(game));
    console.log(`Player ${username} joined game: ${gameId}`);
  });

  // New leaveGame event handler for explicit navigation
  socket.on('leaveGame', ({ gameId, isHost }) => {
    console.log(`Player ${socket.id} leaving game: ${gameId}, isHost: ${isHost}`);
    
    const game = activeGames.get(gameId);
    if (!game) return;
    
    // If host is leaving, notify other players and delete the game
    if (isHost) {
      // Notify other players the host left
      io.to(gameId).emit('hostLeft', { 
        message: 'The host has left the game. The game will be terminated.',
        gameId 
      });
      
      // Clean up the game
      activeGames.delete(gameId);
      console.log(`Game ${gameId} deleted - host left`);
    } else {
      // Regular player leaving - update player list
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = game.players[playerIndex];
        game.players.splice(playerIndex, 1);
        game.scores.delete(socket.id);
        
        // Notify remaining players
        io.to(gameId).emit('playerLeft', { 
          playerId: socket.id,
          playerName: player.username,
          gameId,
          remainingPlayers: game.players.length
        });
        
        io.to(gameId).emit('gameUpdated', serializeGameState(game));
        console.log(`Player ${socket.id} left game: ${gameId}`);
      }
    }
    
    // Remove player from socket room
    socket.leave(gameId);
  });

  socket.on('requestRematch', async ({ gameId, playerId }) => {
    const game = activeGames.get(gameId);
    if (!game) return;

    const player = game.players.find(p => p.id === playerId);
    if (!player) return;

    player.rematchReady = true;
    io.to(gameId).emit('rematchRequested', { playerId });

    const allRematch = game.mode === '1v1' && 
                      game.players.length === 2 && 
                      game.players.every(p => p.rematchReady);

    if (allRematch) {
      try {
        // Fetch fresh questions from DB for rematch
        const newQuestions = await fetchQuestionsFromDB(game.category);
        
        game.isGameStarted = false;
        game.isGameEnded = false;
        game.currentQuestion = 0;
        game.finishedPlayers = new Set();
        game.answeredPlayers = new Set();
        game.startCountdown = null;
        game.chatMessages = [];
        game.questions = newQuestions;
        game.questionStartTime = Date.now();
        
        game.players.forEach(p => {
          p.score = 0;
          p.isReady = false;
          p.hasFinished = false;
          p.rematchReady = false;
          p.responseTimes = [];
          game.scores.set(p.id, 0);
        });

        io.to(gameId).emit('goToLobby', serializeGameState(game));
        
        console.log(`Game ${gameId} reset for rematch with new questions`);
      } catch (error) {
        console.error('Error setting up rematch:', error);
        io.to(gameId).emit('error', { message: 'Failed to set up rematch' });
      }
    }
  });

  socket.on('updateCategory', async ({ gameId, category }) => {
    const game = activeGames.get(gameId);
    if (!game) return;

    const player = game.players.find(p => p.id === socket.id);
    if (!player || !player.isHost) return;

    try {
      // Fetch fresh questions for the new category
      const newQuestions = await fetchQuestionsFromDB(category);
      
      game.category = category;
      game.questions = newQuestions;

      io.to(gameId).emit('categoryUpdated', serializeGameState(game));
      
      console.log(`Category updated to ${category} in game: ${gameId} with ${game.questions.length} questions`);
    } catch (error) {
      console.error('Error updating category:', error);
      socket.emit('error', { message: 'Failed to update category' });
    }
  });

  socket.on('playerReady', ({ gameId }) => {
    const game = activeGames.get(gameId);
    if (!game) return;

    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;

    player.isReady = true;
    io.to(gameId).emit('gameUpdated', serializeGameState(game));
    
    console.log(`Player ${player.username} ready in game: ${gameId}`);

    const allReady = game.players.length >= 2 && game.players.every(p => p.isReady);
    
    if (allReady && game.startCountdown === null) {
      game.startCountdown = 3;
      io.to(gameId).emit('gameUpdated', serializeGameState(game));

      const countdownInterval = setInterval(() => {
        if (game.startCountdown > 0) {
          game.startCountdown--;
          io.to(gameId).emit('gameUpdated', serializeGameState(game));
        } else {
          clearInterval(countdownInterval);
          game.isGameStarted = true;
          game.startCountdown = null;
          game.questionStartTime = Date.now();
          
          io.to(gameId).emit('gameStarted', serializeGameState(game));
          
          console.log(`Game ${gameId} started with synchronized questions`);
        }
      }, 1000);
    }
  });

  socket.on('submitAnswer', ({ gameId, playerId, answer, timeRemaining, points, totalScore, responseTime, allResponseTimes, isCorrect, correctAnswers }) => {
    const game = activeGames.get(gameId);
    if (!game) return;

    const player = game.players.find(p => p.id === playerId);
    if (!player) return;

    if (!player.responseTimes) {
      player.responseTimes = [];
    }
    
    player.responseTimes.push(responseTime);
    
    player.score = totalScore;
    game.scores.set(playerId, totalScore);
    
    // Update correctAnswers if provided
    if (correctAnswers !== undefined) {
      player.correctAnswers = correctAnswers;
    }
    
    io.to(gameId).emit('scoreUpdate', { 
      playerId, 
      score: totalScore,
      responseTime,
      correctAnswers: player.correctAnswers
    });
    
    io.to(gameId).emit('responseTimeUpdate', {
      playerId,
      responseTimes: player.responseTimes
    });
    
    console.log(`Player ${playerId} score updated to ${totalScore} in game: ${gameId}`);
    console.log(`Player ${playerId} response times updated:`, player.responseTimes);

    game.answeredPlayers.add(playerId);
    
    // Emit playerAnswered event with additional data
    io.to(gameId).emit('playerAnswered', { 
      playerId, 
      score: totalScore,
      responseTime,
      isCorrect,
      correctAnswers: player.correctAnswers
    });
    
    console.log(`Player ${playerId} submitted answer in game: ${gameId}`);

    if (game.answeredPlayers.size === game.players.length) {
      console.log(`All players answered in game: ${gameId}`);
      game.answeredPlayers.clear();
      
      if (game.currentQuestion < 9) {
        console.log('Delaying next question by 1 second...');
        
        setTimeout(() => {
          game.currentQuestion++;
          game.questionStartTime = Date.now();
          
          game.players.forEach(player => {
            io.to(gameId).emit('scoreUpdate', { 
              playerId: player.id, 
              score: player.score,
              correctAnswers: player.correctAnswers
            });
            
            io.to(gameId).emit('responseTimeUpdate', {
              playerId: player.id,
              responseTimes: player.responseTimes || []
            });
          });
          
          io.to(gameId).emit('nextQuestion', serializeGameState(game));
          console.log(`(1v1) After 1s delay, sending nextQuestion #${game.currentQuestion} in game: ${gameId}`);
        }, 1000);
      } else {
        // This was the last question, trigger game over after a delay
        setTimeout(() => {
          game.isGameEnded = true;
          io.to(gameId).emit('gameOver', serializeGameState(game));
          console.log(`Game ${gameId} ended - all questions answered`);
        }, 2000);
      }
    }
  });

  socket.on('playerFinished', ({ gameId, playerId }) => {
    const game = activeGames.get(gameId);
    if (!game) return;

    game.finishedPlayers.add(socket.id);
    io.to(gameId).emit('playerFinished', socket.id);

    if (game.finishedPlayers.size === game.players.length) {
      game.isGameEnded = true;
      io.to(gameId).emit('gameOver', serializeGameState(game));
      console.log(`Game ${gameId} ended - all players finished`);
    }
  });

  socket.on('gameOver', ({ gameId }) => {
    const game = activeGames.get(gameId);
    if (!game) return;
    
    game.isGameEnded = true;
    io.to(gameId).emit('gameOver', serializeGameState(game));
    console.log(`Game ${gameId} manually ended`);
  });

  socket.on('chatMessage', ({ gameId, message }) => {
    const game = activeGames.get(gameId);
    if (!game) return;

    const player = game.players.find(p => p.id === socket.id);
    if (player) {
      const chatMessage = {
        id: nanoid(),
        playerId: socket.id,
        playerName: player.username,
        message,
        timestamp: Date.now()
      };

      game.chatMessages.push(chatMessage);
      io.to(gameId).emit('newChatMessage', chatMessage);
      console.log(`Chat message from ${player.username} in game: ${gameId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    for (const [gameId, game] of activeGames.entries()) {
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
        game.scores.delete(socket.id);
        
        if (game.players.length === 0) {
          activeGames.delete(gameId);
          console.log(`Game ${gameId} deleted - no players remaining`);
        } else {
          io.to(gameId).emit('gameUpdated', serializeGameState(game));
          console.log(`Player removed from game: ${gameId}`);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
