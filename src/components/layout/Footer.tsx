import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Info, HelpCircle, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="py-6 px-4 mt-auto bg-gray-900/50 backdrop-blur-sm"
    >
      <div className="max-w-6xl mx-auto">
        {/* Upper section with logo and navigation */}
        <div className="flex flex-col items-center mb-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🏆</span>
            <span className="font-bold text-xl">
              <span className="text-blue-400">Sport</span>
              <span className="text-white">IQ</span>
            </span>
            <span className="text-2xl">🧠</span>
          </div>

          {/* Navigation links in a row */}
          <div className="flex items-center gap-8">
            <Link to="/faq" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <HelpCircle size={16} className="text-blue-400 group-hover:text-blue-300" />
              </motion.div>
              <span>FAQ</span>
            </Link>
            
            <Link to="/about" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Info size={16} className="text-blue-400 group-hover:text-blue-300" />
              </motion.div>
              <span>About</span>
            </Link>
            
            <a href="mailto:contact@sportiq.games" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Mail size={16} className="text-blue-400 group-hover:text-blue-300" />
              </motion.div>
              <span>Contact</span>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4"></div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500">
          <p>© {currentYear} SportIQ - The Ultimate Sports Trivia Challenge</p>
          <p className="mt-1">v2.0.14</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;