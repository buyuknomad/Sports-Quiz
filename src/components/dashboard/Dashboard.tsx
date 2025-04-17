import React, { useEffect, useState } from 'react';
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

  // Fetch user's game history
  useEffect(() => {
    const fetchGameHistory = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) {
          throw error;
        }
        
        setGameHistory(data || []);
        
        // Calculate stats if we have game history
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
            totalCorrectAnswers += game.correct_answers;
            totalQuestions += game.total_questions;
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
          
          setStats({
            totalGames: data.length,
            averageScore: Math.round(totalScore / data.length),
            highestScore,
            averageAccuracy: Math.round((totalCorrectAnswers / totalQuestions) * 100),
            favoriteCategory: favoriteCategory.charAt(0).toUpperCase() + favoriteCategory.slice(1),
            totalCorrectAnswers
          });
        }
      } catch (error) {
        console.error('Error fetching game history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGameHistory();
  }, [user]);

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
              <Link to="/history" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                View All <ArrowRight size={16} />
              </Link>
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
                            {Math.round((game.correct_answers / game.total_questions) * 100)}%
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

export default Dashboard;
