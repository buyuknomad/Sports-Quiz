import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const EmailVerification: React.FC = () => {
  const location = useLocation();
  const email = (location.state as any)?.email || 'your email';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#0c1220] to-[#1a1a2e]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-700/50 text-center"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
          className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Mail className="w-10 h-10 text-blue-400" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-4">Verify Your Email</h1>
        
        <p className="text-gray-300 mb-6">
          We've sent a verification link to:
          <span className="block text-blue-400 mt-2 text-lg font-medium">{email}</span>
        </p>

        <div className="bg-gray-700/50 rounded-lg p-4 mb-6 text-left border border-gray-600/50">
          <h3 className="text-white font-medium mb-2">Next Steps:</h3>
          <ol className="text-gray-300 space-y-2 list-decimal list-inside">
            <li>Check your email inbox</li>
            <li>Click the verification link in the email</li>
            <li>Return to SportIQ and sign in with your credentials</li>
          </ol>
        </div>

        <p className="text-gray-400 mb-6">
          Didn't receive an email? Check your spam folder or{' '}
          <Link to="/auth/signup" className="text-blue-400 hover:underline">
            try signing up again
          </Link>
          .
        </p>

        <div className="flex justify-center">
          <Link to="/">
            <motion.button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home size={18} />
              Return to Home
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;