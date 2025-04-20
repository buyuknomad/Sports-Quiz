import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase-client';
import { 
  Trophy, User, BarChart2, Calendar, Clock, Star, 
  LogOut, Settings, ArrowRight, Target
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// Import ConfirmationDialog
import { ConfirmationDialog } from '../navigation';

// Game session type
interface GameSession {
  id: string;
  mode: string;
  category: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  completion_time: number;
  created_at: string;
  opponent_id: string | null;
  opponent_score: number | null;
  result: string | null;
}

interface DashboardProps {
  onPlayNewQuiz?: () => void; // Add prop for custom navigation
}

const Dashboard: React.FC<DashboardProps> = ({ onPlayNewQuiz }) => {
  const { user, profile, signOut } = useAuth();
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    averageScore: 0,
    highestScore: 0,
    averageAccuracy: 0,
    favoriteCategory: '',
    totalCorrectAnswers: 0
  });
  
  // Add confirmation dialog state
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  
  const navigate = useNavigate();

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchGameHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // *** FIX #1: Get the total count of games separately ***
      const { count, error: countError } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (countError) {
        console.error('Error fetching game count:', countError);
      }
      
      // Get the recent games for display
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
          
      if (error) {
        throw error;
      }
      
      // *** FIX #4: Check for any 1v1 games that weren't saved ***
      // (This is just for logging - the real fix is in oneVsOneStore.ts)
      const oneVsOneGames = data?.filter(game => game.mode === '1v1') || [];
      console.log(`Found ${oneVsOneGames.length} 1v1 games in history`);
      
      setGameHistory(data || []);
      
      // Calculate stats using the available history data
      if (data && data.length > 0) {
        // Category frequency
        const categoryCount: Record<string, number> = {};
        let totalScore = 0;
        let highestScore = 0;
        let totalCorrectAnswers = 0;
        let totalQuestions = 0;
        
        data.forEach(game => {
          categoryCount[game.category] = (categoryCount[game.category] || 0) + 1;
          totalScore += game.score;
          highestScore = Math.max(highestScore, game.score);
          
          // *** FIX #2: Ensure we handle null or undefined values for correct_answers ***
          totalCorrectAnswers += game.correct_answers || 0;
          totalQuestions += game.total_questions || 0;
        });
        
        // Find favorite category
        let favoriteCategory = '';
        let maxCount = 0;
        
        Object.entries(categoryCount).forEach(([category, count]) => {
          if (count > maxCount) {
            maxCount = count;
            favoriteCategory = category;
          }
        });
        
        // *** FIX #1: Use the actual count for totalGames ***
        // *** FIX #2: Ensure we don't divide by zero for accuracy ***
        setStats({
          totalGames: count || data.length, // Use count from separate query
          averageScore: data.length > 0 ? Math.round(totalScore / data.length) : 0,
          highestScore,
          averageAccuracy: totalQuestions > 0 ? Math.round((totalCorrectAnswers / totalQuestions) * 100) : 0,
          favoriteCategory: favoriteCategory.charAt(0).toUpperCase() + favoriteCategory.slice(1),
          totalCorrectAnswers
        });
      }
    } catch (error) {
      console.error('Error fetching game history:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // *** FIX #3: Add a cache reference to avoid unnecessary fetches ***
  const hasInitialFetch = React.useRef(false);
  
  // Fetch user's game history
  useEffect(() => {
    // Only fetch if we haven't fetched yet or if user changes
    if (!hasInitialFetch.current && user) {
      fetchGameHistory();
      hasInitialFetch.current = true;
    }
  }, [user, fetchGameHistory]);

  // Handle sign out button click - show confirmation dialog
  const handleSignOutClick = () => {
    setShowSignOutConfirm(true);
  };

  // Handle confirmed sign out
  const handleConfirmSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setShowSignOutConfirm(false);
    }
  };

  // Function to get category emoji
  const getCategoryEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case 'football': return '⚽';
      case 'basketball': return '🏀';
      case 'tennis': return '🎾';
      case 'olympics': return '🏅';
      case 'mixed': default: return '🎯';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle play new quiz button click
  const handlePlayNewQuiz = () => {
    // Save username before navigation
    if (profile?.username) {
      localStorage.setItem('username', profile.username);
    }
    
    // Use the provided custom handler if available, otherwise use default navigation
    if (onPlayNewQuiz) {
      onPlayNewQuiz();
    } else {
      // Set navigation source to dashboard before redirecting
      localStorage.setItem('navigationSource', 'dashboard');
      navigate('/welcome');
    }
  };

  // Force refresh the history data
  const handleRefreshHistory = () => {
    hasInitialFetch.current = false;
    fetchGameHistory();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1220] to-[#1a1a2e] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              <span className="text-blue-400">Sport</span>
              <span className="text-white">IQ</span> Dashboard
            </h1>
            <p className="text-gray-400">Track your quiz performance and history</p>
          </div>
          
          <div className="flex gap-2">
            <Link to="/settings">
              <motion.button
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings size={20} />
              </motion.button>
            </Link>
            
            <motion.button
              onClick={handleSignOutClick}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700/50"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center">
                <User size={32} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile?.username || 'User'}</h2>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-400" /> Stats Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Games</p>
                    <p className="text-white font-bold text-lg">{stats.totalGames}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Avg Score</p>
                    <p className="text-white font-bold text-lg">{stats.averageScore}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Highest Score</p>
                    <p className="text-white font-bold text-lg">{stats.highestScore}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Avg Accuracy</p>
                    <p className="text-white font-bold text-lg">{stats.averageAccuracy}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Star size={18} className="text-yellow-400" /> Achievements
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-gray-400">Favorite Category</p>
                    <p className="text-white">{stats.favoriteCategory} {getCategoryEmoji(stats.favoriteCategory)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">Correct Answers</p>
                    <p className="text-white">{stats.totalCorrectAnswers}</p>
                  </div>
                </div>
              </div>
              
              {/* Modified to use onClick handler instead of direct Link */}
              <motion.button
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlayNewQuiz}
              >
                <Target size={20} />
                Play New Quiz
              </motion.button>
            </div>
          </motion.div>
          
          {/* Game history section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700/50 lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart2 size={20} className="text-blue-400" />
                Recent Game History
              </h2>
              <div className="flex items-center gap-2">
                {/* Added refresh button */}
                <button onClick={handleRefreshHistory} className="text-blue-400 hover:text-blue-300">
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <RotateCw size={16} />
                  </motion.div>
                </button>
                <Link to="/history" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                  View All <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : gameHistory.length === 0 ? (
              <div className="bg-gray-700/30 rounded-lg p-6 text-center">
                <p className="text-gray-400 mb-3">You haven't played any games yet.</p>
                <button 
                  className="text-blue-400 hover:text-blue-300"
                  onClick={handlePlayNewQuiz}
                >
                  Start your first quiz now!
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {gameHistory.map((game) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-700/30 rounded-lg p-4 border border-gray-700/50"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{getCategoryEmoji(game.category)}</span>
                          <h3 className="text-white font-medium capitalize">{game.mode} - {game.category}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400 flex items-center gap-1">
                            <Calendar size={14} /> {formatDate(game.created_at)}
                          </span>
                          <span className="text-gray-400 flex items-center gap-1">
                            <Clock size={14} /> {game.completion_time ? `${game.completion_time.toFixed(1)}s` : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-gray-400 text-xs">Score</p>
                          <p className="text-green-400 font-bold">{game.score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-xs">Accuracy</p>
                          <p className="text-blue-400 font-bold">
                            {/* *** FIX #2: Proper accuracy calculation with null check *** */}
                            {game.total_questions > 0 
                              ? Math.round(((game.correct_answers || 0) / game.total_questions) * 100)
                              : 0}%
                          </p>
                        </div>
                        {game.mode === '1v1' && (
                          <div className="text-center">
                            <p className="text-gray-400 text-xs">Result</p>
                            <p className={`font-bold ${
                              game.result === 'win' ? 'text-green-400' : 
                              game.result === 'loss' ? 'text-red-400' : 
                              'text-yellow-400'
                            }`}>
                              {game.result === 'win' ? 'Win' : 
                               game.result === 'loss' ? 'Loss' : 
                               'Draw'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showSignOutConfirm}
        onConfirm={handleConfirmSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
        title="Sign Out?"
        message="Are you sure you want to sign out? Any unsaved progress will be lost."
        confirmText="Sign Out"
        cancelText="Cancel"
      />
    </div>
  );
};

// Add the missing RotateCw icon
import { RotateCw } from 'lucide-react';

export default Dashboard;
