import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Info, Trophy, Users, Zap, Globe } from 'lucide-react';
import { NavigationButton } from './navigation';
import { NAVIGATION_LABELS } from '../constants/navigation';
import { useAnalyticsEvent } from '../hooks/useAnalyticsEvent';
import EnhancedNavBar from './layout/EnhancedNavBar';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const featureVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.25)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const { trackPageView } = useAnalyticsEvent();

  // Track page view
  useEffect(() => {
    document.title = "About SportIQ - The Ultimate Sports Trivia Game";
    trackPageView('/about', 'About Page');
  }, [trackPageView]);

  const handleGoHome = () => {
    navigate('/');
  };

  // Features section
  const features = [
    {
      id: 'feature-1',
      title: 'Multiple Categories',
      description: 'Test your knowledge across Football, Basketball, Tennis, Olympics, and Mixed Sports categories.',
      icon: Globe,
      color: 'bg-green-600/20 text-green-400 border-green-600/30'
    },
    {
      id: 'feature-2',
      title: 'Solo Play',
      description: 'Practice at your own pace to improve your sports knowledge and response time.',
      icon: Trophy,
      color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
    },
    {
      id: 'feature-3',
      title: '1v1 Battles',
      description: 'Challenge friends to real-time quiz battles with shareable game codes.',
      icon: Users,
      color: 'bg-blue-600/20 text-blue-400 border-blue-600/30'
    },
    {
      id: 'feature-4',
      title: 'Speed Bonuses',
      description: 'Earn extra points for quick answers with our tiered bonus system.',
      icon: Zap,
      color: 'bg-purple-600/20 text-purple-400 border-purple-600/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1220] to-[#1a1a2e] py-16 px-4">
      {/* Added EnhancedNavBar */}
      <EnhancedNavBar variant="default" position="top-right" />

      {/* Navigation Button */}
      <div className="fixed bottom-6 left-6 z-10">
        <NavigationButton
          icon={Home}
          label={NAVIGATION_LABELS.HOME}
          onClick={handleGoHome}
        />
      </div>

      <motion.div 
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Info size={32} className="text-blue-400" />
            <h1 className="text-4xl font-bold text-white">About SportIQ</h1>
          </div>
          <p className="text-gray-400 text-lg">
            The ultimate sports trivia experience for casual fans and sports experts alike.
          </p>
          <div className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
        </motion.div>

        {/* Main content */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700/50 mb-10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">What is SportIQ?</h2>
          <p className="text-gray-300 mb-6">
            SportIQ is a web-based sports trivia game designed to test and expand your knowledge of various sports. 
            Whether you're a casual fan or a die-hard sports enthusiast, SportIQ offers an engaging way to challenge 
            yourself and compete with friends.
          </p>
          
          <p className="text-gray-300 mb-6">
            This project was created out of a passion for both sports and web development. The goal was to build something 
            fun that brings together sports fans and offers a chance to learn new facts about favorite sports while 
            enjoying friendly competition.
          </p>

          <p className="text-gray-300">
            SportIQ features categories including Football ⚽, Basketball 🏀, Tennis 🎾, Olympics 🏅, and Mixed Sports 🎯,
            with challenging questions that will test even the most knowledgeable sports fans.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.h2 
          variants={itemVariants}
          className="text-2xl font-bold text-white mb-6 text-center"
        >
          Key Features
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
          variants={containerVariants}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={featureVariants}
              whileHover="hover"
              className={`p-6 rounded-xl ${feature.color} border backdrop-blur-sm flex flex-col items-center text-center`}
            >
              <motion.div 
                className="p-3 rounded-full bg-gray-900/50 mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <feature.icon size={28} />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact section */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700/50 mb-10 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
          <p className="text-gray-300 mb-4">
            Have suggestions for new features or categories? Found a bug or an incorrect question? 
            I'd love to hear your feedback to help improve SportIQ!
          </p>
          <a 
            href="mailto:feedback@sportiq.games" 
            className="inline-block mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Send Feedback
          </a>
        </motion.div>

        {/* Footer */}
        <motion.div 
          variants={itemVariants}
          className="text-center mt-12 text-xs text-gray-500"
        >
          <p>© {new Date().getFullYear()} SportIQ - v2.0.14</p>
          <p className="mt-1">A hobby project created with passion for sports and web development.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutPage;
