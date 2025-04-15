// Client-side Supabase configuration with authentication functions
import { createClient, Session, User } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { Category } from '../types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Please check your .env file and ensure you have:');
  console.error('  VITE_SUPABASE_URL=your_supabase_url');
  console.error('  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  throw new Error('Missing required Supabase configuration');
}

// Create Supabase client with retries
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      headers: {
        'X-Client-Info': 'sports-quiz-app'
      }
    }
  }
);

// Determine app URL based on current environment
export const getAppUrl = () => {
  const hostname = window.location.hostname;
  
  // Netlify testing deployment
  if (hostname.includes('netlify.app')) {
    return 'https://' + hostname;
  }
  
  // Render production deployment
  if (hostname.includes('onrender.com')) {
    return 'https://' + hostname;
  }
  
  // Custom domain, if you have one
  if (hostname === 'sportiq.games' || hostname === 'www.sportiq.games') {
    return 'https://' + hostname;
  }
  
  // Local development
  return window.location.origin;
};

// Authentication Functions
export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username
      }
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getAppUrl()}/auth/callback`
    }
  });
  return { data, error };
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/auth/reset-password`,
  });
  return { error };
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  return { error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

export const onAuthStateChange = (callback: (session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((_, session) => {
    callback(session);
  });
};

// Cache for questions
const questionCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add a pending requests tracker to avoid duplicate simultaneous fetches
const pendingRequests = new Map<string, Promise<any>>();

// Local fallback questions by category
const fallbackQuestions = {
  football: [
    {
      id: 'fb1',
      category: 'football',
      question: 'Which country won the 2022 FIFA World Cup?',
      options: ['France', 'Brazil', 'Argentina', 'Germany'],
      correctAnswer: 'Argentina'
    },
    {
      id: 'fb2',
      category: 'football',
      question: 'Who holds the record for most goals in World Cup history?',
      options: ['Pelé', 'Miroslav Klose', 'Ronaldo', 'Just Fontaine'],
      correctAnswer: 'Miroslav Klose'
    },
    {
      id: 'fb3',
      category: 'football',
      question: 'Which team has won the most UEFA Champions League titles?',
      options: ['Real Madrid', 'AC Milan', 'Bayern Munich', 'Liverpool'],
      correctAnswer: 'Real Madrid'
    },
    {
      id: 'fb4',
      category: 'football',
      question: 'Which player has won the most Ballon d\'Or awards?',
      options: ['Cristiano Ronaldo', 'Lionel Messi', 'Michel Platini', 'Johan Cruyff'],
      correctAnswer: 'Lionel Messi'
    },
    {
      id: 'fb5',
      category: 'football',
      question: 'Which club has won the most Premier League titles?',
      options: ['Liverpool', 'Arsenal', 'Chelsea', 'Manchester United'],
      correctAnswer: 'Manchester United'
    }
  ],
  basketball: [
    {
      id: 'bb1',
      category: 'basketball',
      question: 'Which NBA team has won the most championships?',
      options: ['Los Angeles Lakers', 'Boston Celtics', 'Chicago Bulls', 'Golden State Warriors'],
      correctAnswer: 'Boston Celtics'
    },
    {
      id: 'bb2',
      category: 'basketball',
      question: 'Who holds the NBA record for most points in a single game?',
      options: ['Michael Jordan', 'Kobe Bryant', 'Wilt Chamberlain', 'LeBron James'],
      correctAnswer: 'Wilt Chamberlain'
    },
    {
      id: 'bb3',
      category: 'basketball',
      question: 'Who is the NBA\'s all-time leading scorer?',
      options: ['Kareem Abdul-Jabbar', 'LeBron James', 'Michael Jordan', 'Karl Malone'],
      correctAnswer: 'LeBron James'
    },
    {
      id: 'bb4',
      category: 'basketball',
      question: 'Which player has the most NBA MVP awards?',
      options: ['Michael Jordan', 'Kareem Abdul-Jabbar', 'LeBron James', 'Bill Russell'],
      correctAnswer: 'Kareem Abdul-Jabbar'
    },
    {
      id: 'bb5',
      category: 'basketball',
      question: 'How many points is a standard field goal worth in basketball?',
      options: ['1', '2', '3', '4'],
      correctAnswer: '2'
    }
  ],
  tennis: [
    {
      id: 'tn1',
      category: 'tennis',
      question: 'Who has won the most Grand Slam singles titles in tennis history?',
      options: ['Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Serena Williams'],
      correctAnswer: 'Novak Djokovic'
    },
    {
      id: 'tn2',
      category: 'tennis',
      question: 'Which Grand Slam tournament is played on clay courts?',
      options: ['Wimbledon', 'US Open', 'French Open', 'Australian Open'],
      correctAnswer: 'French Open'
    },
    {
      id: 'tn3',
      category: 'tennis',
      question: 'Who holds the record for most Wimbledon singles titles?',
      options: ['Roger Federer', 'Novak Djokovic', 'Pete Sampras', 'Björn Borg'],
      correctAnswer: 'Roger Federer'
    },
    {
      id: 'tn4',
      category: 'tennis',
      question: 'Which of these players is known as the "King of Clay"?',
      options: ['Andy Murray', 'Roger Federer', 'Rafael Nadal', 'Novak Djokovic'],
      correctAnswer: 'Rafael Nadal'
    },
    {
      id: 'tn5',
      category: 'tennis',
      question: 'How many Grand Slam singles titles has Serena Williams won?',
      options: ['20', '23', '25', '19'],
      correctAnswer: '23'
    }
  ],
  olympics: [
    {
      id: 'ol1',
      category: 'olympics',
      question: 'Which city hosted the 2020 Summer Olympics (held in 2021)?',
      options: ['Paris', 'Tokyo', 'London', 'Rio de Janeiro'],
      correctAnswer: 'Tokyo'
    },
    {
      id: 'ol2',
      category: 'olympics',
      question: 'Who is the most decorated Olympian of all time?',
      options: ['Usain Bolt', 'Michael Phelps', 'Simone Biles', 'Carl Lewis'],
      correctAnswer: 'Michael Phelps'
    },
    {
      id: 'ol3',
      category: 'olympics',
      question: 'Which country has won the most Summer Olympic medals?',
      options: ['Soviet Union', 'United States', 'China', 'Germany'],
      correctAnswer: 'United States'
    },
    {
      id: 'ol4',
      category: 'olympics',
      question: 'Which of these sports is NOT in the Summer Olympics?',
      options: ['Archery', 'Cricket', 'Skateboarding', 'Breakdancing'],
      correctAnswer: 'Cricket'
    },
    {
      id: 'ol5',
      category: 'olympics',
      question: 'In which year were the first modern Olympic Games held?',
      options: ['1886', '1896', '1900', '1904'],
      correctAnswer: '1896'
    }
  ],
  mixed: [
    {
      id: 'mx1',
      category: 'mixed',
      question: 'Which sport uses a shuttlecock?',
      options: ['Tennis', 'Badminton', 'Cricket', 'Hockey'],
      correctAnswer: 'Badminton'
    },
    {
      id: 'mx2',
      category: 'mixed',
      question: 'In which sport would you perform a slam dunk?',
      options: ['Volleyball', 'Basketball', 'Tennis', 'Football'],
      correctAnswer: 'Basketball'
    },
    {
      id: 'mx3',
      category: 'mixed',
      question: 'What is the diameter of a basketball hoop in inches?',
      options: ['16 inches', '18 inches', '20 inches', '24 inches'],
      correctAnswer: '18 inches'
    },
    {
      id: 'mx4',
      category: 'mixed',
      question: 'Which of these sports does NOT use a ball?',
      options: ['Hockey', 'Polo', 'Volleyball', 'Badminton'],
      correctAnswer: 'Badminton'
    },
    {
      id: 'mx5',
      category: 'mixed',
      question: 'How many players are there in a standard baseball team?',
      options: ['9', '11', '5', '7'],
      correctAnswer: '9'
    }
  ]
};

// Function to get questions for a specific category
function getFallbackQuestions(category: Category) {
  if (category === 'mixed') {
    // For mixed category, take 2-3 questions from each category
    const questions = [];
    const categories: Category[] = ['football', 'basketball', 'tennis', 'olympics'];
    
    // Get 2-3 random questions from each category
    for (const cat of categories) {
      const categoryQuestions = fallbackQuestions[cat];
      const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
      questions.push(...shuffled.slice(0, 2));
    }
    
    // Add some mixed questions
    questions.push(...fallbackQuestions.mixed);
    
    // Shuffle all questions and take 10
    return questions
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .map(q => ({ ...q, category: 'mixed' as Category }));
  }
  
  // For specific categories, use those questions first
  const categoryQuestions = [...fallbackQuestions[category]];
  
  // If we need more questions, get them from other categories
  if (categoryQuestions.length < 10) {
    const remainingNeeded = 10 - categoryQuestions.length;
    const otherQuestions = Object.entries(fallbackQuestions)
      .filter(([cat]) => cat !== category)
      .flatMap(([, questions]) => questions)
      .sort(() => Math.random() - 0.5)
      .slice(0, remainingNeeded)
      .map(q => ({ ...q, category })); // Set the category to match the selected one
    
    categoryQuestions.push(...otherQuestions);
  }
  
  // Return exactly 10 questions with the correct category
  return categoryQuestions
    .slice(0, 10)
    .map(q => ({ ...q, category }));
}

export async function fetchQuestions(category: Category) {
  console.log(`Fetching questions for category: ${category}`);
  
  // Check if there's already a request in progress for this category
  const pendingKey = `pending_${category}`;
  if (pendingRequests.has(pendingKey)) {
    console.log('Request already in progress for category:', category);
    return pendingRequests.get(pendingKey);
  }
  
  // Check cache first
  const cacheKey = `questions_${category}`;
  const cached = questionCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached questions for category:', category);
    return cached.data;
  }

  // Create the promise for fetching questions
  const fetchPromise = (async () => {
    try {
      // Try to fetch from Supabase
      console.log('Fetching questions from Supabase...');
      let query = supabase.from('questions').select('*').eq('active', true);
      
      if (category !== 'mixed') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('No questions found in Supabase, using fallback questions');
        const questions = getFallbackQuestions(category);
        
        // Cache the fallback results
        questionCache.set(cacheKey, {
          data: questions,
          timestamp: Date.now()
        });
        
        return questions;
      }
      
      // Transform and randomize questions
      const questions = data
        .map(q => ({
          id: q.id,
          category: q.category as Category, 
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer
        }))
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
      
      // Cache the results
      questionCache.set(cacheKey, {
        data: questions,
        timestamp: Date.now()
      });
      
      return questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      
      // Use fallback questions on error
      const questions = getFallbackQuestions(category);
      
      // Cache the fallback results
      questionCache.set(cacheKey, {
        data: questions,
        timestamp: Date.now()
      });
      
      return questions;
    } finally {
      // Remove the pending request once completed
      pendingRequests.delete(pendingKey);
    }
  })();
  
  // Store the promise in the pending requests map
  pendingRequests.set(pendingKey, fetchPromise);
  
  return fetchPromise;
}

export function clearQuestionCache() {
  questionCache.clear();
  console.log('Question cache cleared');
}

// Profile management functions
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
};

export const updateUserProfile = async (userId: string, updates: { username?: string, avatar_url?: string }) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
};

// Game history functions
export const getGameHistory = async (userId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching game history:', error);
    return { data: null, error };
  }
};

export const getGameDetails = async (gameId: string) => {
  try {
    const { data: gameData, error: gameError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', gameId)
      .single();
      
    if (gameError) throw gameError;
    
    const { data: answersData, error: answersError } = await supabase
      .from('user_answers')
      .select('*, questions(*)')
      .eq('game_session_id', gameId);
      
    if (answersError) throw answersError;
    
    return { 
      game: gameData, 
      answers: answersData,
      error: null
    };
  } catch (error) {
    console.error('Error fetching game details:', error);
    return { game: null, answers: null, error };
  }
};

export default supabase;