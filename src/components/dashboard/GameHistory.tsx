import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase-client';
import { 
  Calendar, Clock, Filter, ChevronLeft, ChevronRight,
  ArrowLeft, Search, Download, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

// Filter options
type FilterOption = 'all' | 'solo' | '1v1';
type SortOption = 'newest' | 'oldest' | 'highest-score' | 'accuracy';

const GameHistory: React.FC = () => {
  const { user } = useAuth();
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modeFilter, setModeFilter] = useState<FilterOption>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  
  // *** FIX #3: Add a reference to track if data has been fetched ***
  const hasDataBeenFetched = useRef(false);
  
  const itemsPerPage = 10;

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchGameHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // *** IMPROVEMENT: Get the total count of all games ***
      const { count, error: countError } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (countError) {
        console.error('Error fetching game count:', countError);
      } else if (count !== null) {
        setTotalCount(count);
      }
      
      // Get all game history
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
          
      if (error) {
        throw error;
      }
      
      // *** FIX #4: Log the number of 1v1 games for debugging ***
      const oneVsOneGames = data?.filter(game => game.mode === '1v1') || [];
      console.log(`Found ${oneVsOneGames.length} 1v1 games in history`);
      
      setGameHistory(data || []);
      
      // Mark that data has been fetched
      hasDataBeenFetched.current = true;
    } catch (error) {
      console.error('Error fetching game history:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch user's game history - only once or when user changes
  useEffect(() => {
    if (!hasDataBeenFetched.current && user) {
      fetchGameHistory();
    }
  }, [user, fetchGameHistory]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...gameHistory];
    
    // Apply mode filter
    if (modeFilter !== 'all') {
      result = result.filter(game => game.mode === modeFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(game => game.category === categoryFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(game => 
        game.category.toLowerCase().includes(query) ||
        game.mode.toLowerCase().includes(query) ||
        (game.result && game.result.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest-score':
        result.sort((a, b) => b.score - a.score);
        break;
      case 'accuracy':
        result.sort((a, b) => {
          // *** FIX #2: Properly calculate accuracy with null/zero checks ***
          const accuracyA = a.total_questions > 0 ? ((a.correct_answers || 0) / a.total_questions) : 0;
          const accuracyB = b.total_questions > 0 ? ((b.correct_answers || 0) / b.total_questions) : 0;
          return accuracyB - accuracyA;
        });
        break;
    }
    
    setFilteredHistory(result);
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [gameHistory, modeFilter, categoryFilter, sortBy, searchQuery]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredHistory.slice(startIndex, endIndex);
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
  
  // Generate CSV export
  const exportToCSV = () => {
    // Create CSV headers
    const headers = [
      'Date', 
      'Mode', 
      'Category', 
      'Score', 
      'Correct Answers', 
      'Total Questions', 
      'Accuracy', 
      'Completion Time',
      'Result'
    ].join(',');
    
    // Create CSV rows
    const rows = filteredHistory.map(game => [
      new Date(game.created_at).toLocaleDateString(),
      game.mode,
      game.category,
      game.score,
      game.correct_answers || 0, // *** FIX: Handle null values ***
      game.total_questions,
      game.total_questions > 0 ? `${Math.round(((game.correct_answers || 0) / game.total_questions) * 100)}%` : '0%',
      game.completion_time ? `${game.completion_time.toFixed(1)}s` : 'N/A',
      game.result || 'N/A'
    ].join(','));
    
    // Combine headers and rows
    const csv = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sportiq-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Manual refresh function
  const handleRefresh = () => {
    hasDataBeenFetched.current = false;
    fetchGameHistory();
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(gameHistory.map(game => game.category))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1220] to-[#1a1a2e] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <motion.button
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={20} />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Game History</h1>
              <p className="text-gray-400">View and analyze your past quizzes</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Added refresh button */}
            <motion.button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh data"
            >
              <RefreshCw size={18} />
              Refresh
            </motion.button>
            
            <motion.button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={filteredHistory.length === 0}
              title={filteredHistory.length === 0 ? "No data to export" : "Export as CSV"}
            >
              <Download size={18} />
              Export CSV
            </motion.button>
          </div>
        </div>
        
        {/* Total count display */}
        <div className="mb-3 text-gray-400 text-sm">
          Total games: <span className="text-white font-medium">{totalCount}</span>
        </div>
        
        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg border border-gray-700/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games..."
                  className="w-full p-2 pl-9 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Mode</label>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value as FilterOption)}
                className="p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="all">All Modes</option>
                <option value="solo">Solo</option>
                <option value="1v1">1v1</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="all">All Categories</option>
                {categories.filter(cat => cat !== 'all').map((category) => (
                  <option key={category} value={category} className="capitalize">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest-score">Highest Score</option>
                <option value="accuracy">Best Accuracy</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Game history list */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700/50 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-2">No game history found</p>
              {searchQuery || modeFilter !== 'all' || categoryFilter !== 'all' ? (
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
              ) : (
                <Link to="/welcome" className="text-blue-400 hover:text-blue-300">
                  Play your first game now!
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-6 gap-2 bg-gray-700/50 px-6 py-3 text-sm font-semibold text-gray-300 border-b border-gray-700">
                <div className="col-span-2 md:col-span-3">Game Details</div>
                <div className="hidden md:block">Date</div>
                <div className="text-center">Score</div>
                <div className="text-center">Accuracy</div>
                <div className="text-center hidden sm:block">Time</div>
              </div>
              
              {/* Table rows */}
              <div className="divide-y divide-gray-700">
                {getCurrentPageItems().map((game) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.2)' }}
                    className="grid grid-cols-6 gap-2 px-6 py-4 items-center text-sm"
                  >
                    <div className="col-span-2 md:col-span-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getCategoryEmoji(game.category)}</span>
                        <div>
                          <h3 className="text-white font-medium capitalize">
                            {game.mode} - {game.category}
                          </h3>
                          <div className="block md:hidden text-xs text-gray-500">
                            {formatDate(game.created_at)}
                          </div>
                        </div>
                      </div>
                      {game.mode === '1v1' && (
                        <div className="ml-7 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            game.result === 'win' ? 'bg-green-600/20 text-green-400' : 
                            game.result === 'loss' ? 'bg-red-600/20 text-red-400' : 
                            'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            {game.result === 'win' ? 'Win' : 
                             game.result === 'loss' ? 'Loss' : 
                             'Draw'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="hidden md:flex items-center text-gray-400 text-xs">
                      <Calendar size={14} className="mr-1" /> 
                      {formatDate(game.created_at)}
                    </div>
                    
                    <div className="text-center font-bold text-green-400">
                      {game.score}
                    </div>
                    
                    <div className="text-center font-medium text-blue-400">
                      {/* *** FIX #2: Properly handle null/zero values for accuracy *** */}
                      {game.total_questions > 0 
                        ? Math.round(((game.correct_answers || 0) / game.total_questions) * 100) 
                        : 0}%
                    </div>
                    
                    <div className="text-center text-gray-300 hidden sm:block">
                      {game.completion_time ? `${game.completion_time.toFixed(1)}s` : 'N/A'}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} games
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center px-4 bg-gray-700 rounded-lg text-white">
                      {currentPage} / {totalPages}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Import RefreshCw icon
import { RefreshCw } from 'lucide-react';

export default GameHistory;
