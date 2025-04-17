import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Home, HelpCircle } from 'lucide-react';
import { NavigationButton } from './navigation';
import { NAVIGATION_LABELS } from '../constants/navigation';
import { useAnalyticsEvent } from '../hooks/useAnalyticsEvent';
import EnhancedNavBar from './layout/EnhancedNavBar';

// FAQ data - matches the JSON-LD schema in index.html
const faqData = [
  {
    id: 'faq-1',
    question: "How do I play SportIQ?",
    answer: "SportIQ offers two main game modes: Solo Play and 1v1 Multiplayer. In Solo Play, you can practice at your own pace by answering sports trivia questions. In 1v1 mode, you can challenge a friend by creating a game and sharing the invite code, or join an existing game with an invite code."
  },
  {
    id: 'faq-2',
    question: "What sports categories are available in SportIQ?",
    answer: "SportIQ currently offers questions in five categories: Football ⚽, Basketball 🏀, Tennis 🎾, Olympics 🏅, and Mixed Sports 🎯. Each category features challenging trivia questions to test your knowledge."
  },
  {
    id: 'faq-3',
    question: "How does scoring work in SportIQ?",
    answer: "In SportIQ, you earn 10 points for each correct answer. Additionally, you can earn up to 5 bonus points based on how quickly you answer. The faster you respond, the higher your bonus will be, with tiers including Lightning Fast (5 points), Quick (4 points), Normal (3 points), Measured (2 points), and Delayed (1 point)."
  },
  {
    id: 'faq-4',
    question: "Is SportIQ free to play?",
    answer: "Yes, SportIQ is completely free to play. You can enjoy all game modes and features without any cost or in-app purchases."
  },
  {
    id: 'faq-5',
    question: "Can I play SportIQ on my mobile device?",
    answer: "Yes, SportIQ is fully responsive and works on all modern devices including smartphones, tablets, and desktops. Simply visit sportiq.games in your mobile browser to start playing."
  },
  {
    id: 'faq-6',
    question: "How do I challenge a friend to a 1v1 match?",
    answer: "To challenge a friend, select the 'Create 1v1 Game' mode, choose a category, and you'll receive a unique invite code. Share this code with your friend who can then use it to join your game through the 'Join 1v1 Game' option."
  },
  {
    id: 'faq-7',
    question: "Are new questions added regularly?",
    answer: "Yes, we regularly update SportIQ with new trivia questions across all categories to keep the game fresh and challenging for returning players."
  },
  {
    id: 'faq-8',
    question: "How can I share my results?",
    answer: "After completing a quiz, you'll see your results with detailed statistics. You can share your score on social media or via messaging apps directly from the results screen to challenge your friends to beat your score!"
  },
  {
    id: 'faq-9',
    question: "What happens if I lose connection during a game?",
    answer: "In Solo mode, your progress is saved locally, and you can continue where you left off. In 1v1 mode, if you lose connection temporarily, the system will try to reconnect you automatically. If the disconnection persists for too long, you may need to rejoin the game."
  },
  {
    id: 'faq-10',
    question: "How are the questions selected?",
    answer: "Questions are randomly selected from our database based on your chosen category. In the Mixed Sports category, questions are pulled from all sports categories to provide a varied challenge. Our system ensures you get a different set of questions each time you play."
  }
];

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

const FAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const { trackPageView } = useAnalyticsEvent();

  // Track page view
  useEffect(() => {
    document.title = "FAQ - SportIQ - Sports Trivia Quiz Game";
    trackPageView('/faq', 'FAQ Page');
  }, [trackPageView]);

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleGoHome = () => {
    navigate('/');
  };

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
        className="max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle size={32} className="text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Find answers to common questions about SportIQ, the ultimate sports trivia quiz game.
          </p>
          <div className="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
        </motion.div>

        <div className="space-y-4">
          {faqData.map((faq) => (
            <motion.div 
              key={faq.id}
              variants={itemVariants}
              className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
              >
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 text-blue-400"
                >
                  {expandedId === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </motion.div>
              </button>
              
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: expandedId === faq.id ? "auto" : 0,
                  opacity: expandedId === faq.id ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 text-gray-300">
                  <div className="pt-2 border-t border-gray-700/50"></div>
                  <p className="mt-2">{faq.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          variants={itemVariants}
          className="text-center mt-12 text-gray-400"
        >
          <p>Don't see your question here? <a href="mailto:support@sportiq.games" className="text-blue-400 hover:text-blue-300 underline">Contact us</a> for more information.</p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="text-center mt-8 text-xs text-gray-500"
        >
          <p>© {new Date().getFullYear()} SportIQ - v2.0.14 - The Ultimate Sports Trivia Challenge</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FAQPage;
