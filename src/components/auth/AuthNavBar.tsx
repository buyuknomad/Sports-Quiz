import React from 'react';
import { motion } from 'framer-motion';
import { User, LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthNavBar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <div className="fixed top-4 right-4 z-50">
      {user ? (
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
            >
              <User size={18} />
              <span className="hidden sm:inline">{profile?.username || 'Dashboard'}</span>
            </motion.div>
          </Link>
          
          <motion.button
            onClick={handleSignOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow-lg transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      ) : (
        <Link to="/auth/signin">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
          >
            <LogIn size={18} />
            <span>Sign In</span>
          </motion.div>
        </Link>
      )}
    </div>
  );
};

export default AuthNavBar;