import { supabase } from '../lib/supabase-client';
import type { Category, GameMode } from '../types';

interface SaveGameParams {
  userId: string;
  mode: GameMode;
  category: Category;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completionTime?: number;
  opponentId?: string;          // Now optional
  opponentScore?: number;
  result?: 'win' | 'loss' | 'draw';
  questionDetails: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    responseTime: number;
  }[];
}

// Service to save game results to the database
export const saveGameResults = async (params: SaveGameParams) => {
  try {
    // First, prepare the game session data
    const gameSessionData = {
      user_id: params.userId,
      mode: params.mode,
      category: params.category,
      score: params.score,
      correct_answers: params.correctAnswers,
      total_questions: params.totalQuestions,
      completion_time: params.completionTime,
      // Only include opponent_id if it's a valid UUID
      opponent_id: params.opponentId && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.opponentId) 
        ? params.opponentId 
        : null,
      opponent_score: params.opponentScore || null,
      result: params.result || null
    };
    
    console.log("Saving game session with data:", gameSessionData);
    
    // Insert the game session
    const { data: gameSession, error: gameError } = await supabase
      .from('game_sessions')
      .insert(gameSessionData)
      .select()
      .single();
      
    if (gameError) {
      console.error('Supabase error details:', gameError);
      throw gameError;
    }
    
    // Then, insert the question details
    if (params.questionDetails.length > 0) {
      const userAnswers = params.questionDetails.map(detail => ({
        game_session_id: gameSession.id,
        question_id: detail.questionId,
        user_id: params.userId,
        user_answer: detail.userAnswer,
        is_correct: detail.isCorrect,
        response_time: detail.responseTime
      }));
      
      const { error: answersError } = await supabase
        .from('user_answers')
        .insert(userAnswers);
        
      if (answersError) {
        console.error('Error saving question details:', answersError);
        // Not throwing here since we already saved the game session
      }
    }
    
    return { gameSession };
  } catch (error) {
    console.error('Error saving game results:', error);
    return { error };
  }
};

// Get a user's game history
export const getGameHistory = async (userId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      throw error;
    }
    
    return { data };
  } catch (error) {
    console.error('Error fetching game history:', error);
    return { error };
  }
};

// Get details for a specific game
export const getGameDetails = async (gameId: string) => {
  try {
    const { data: gameData, error: gameError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', gameId)
      .single();
      
    if (gameError) {
      throw gameError;
    }
    
    const { data: answersData, error: answersError } = await supabase
      .from('user_answers')
      .select('*, questions(*)')
      .eq('game_session_id', gameId);
      
    if (answersError) {
      throw answersError;
    }
    
    return { 
      game: gameData, 
      answers: answersData 
    };
  } catch (error) {
    console.error('Error fetching game details:', error);
    return { error };
  }
};
