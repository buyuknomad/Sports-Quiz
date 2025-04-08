// src/components/transitions/PageTransition.tsx
import React, { useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Direction types for transitions
export type TransitionDirection = 'forward' | 'backward' | 'none';

// Context to track transition direction
interface TransitionContextType {
  direction: TransitionDirection;
  setDirection: (direction: TransitionDirection) => void;
}

const TransitionContext = createContext<TransitionContextType>({
  direction: 'none',
  setDirection: () => {}
});

// Provider component to manage transition state
export const TransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [direction, setDirection] = React.useState<TransitionDirection>('none');
  
  return (
    <TransitionContext.Provider value={{ direction, setDirection }}>
      {children}
    </TransitionContext.Provider>
  );
};

// Hook to use transition direction
export const useTransition = () => useContext(TransitionContext);

// Page transition props
interface PageTransitionProps {
  children: React.ReactNode;
  location: string; // Unique identifier for this screen
  className?: string;
}

// Variants for different transition directions
const pageVariants = {
  initial: (direction: TransitionDirection) => ({
    x: direction === 'forward' ? '100%' : direction === 'backward' ? '-100%' : 0,
    opacity: 0,
    scale: direction === 'none' ? 0.95 : 1,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    }
  },
  exit: (direction: TransitionDirection) => ({
    x: direction === 'forward' ? '-100%' : direction === 'backward' ? '100%' : 0,
    opacity: 0,
    scale: direction === 'none' ? 0.95 : 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    }
  })
};

// Main PageTransition component
export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  location,
  className = ""
}) => {
  const { direction } = useTransition();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        custom={direction}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className={`w-full min-h-screen ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Helper component for shared elements that persist across pages
interface SharedElementProps {
  children: React.ReactNode;
  id: string;
  className?: string;
}

export const SharedElement: React.FC<SharedElementProps> = ({ 
  children, 
  id,
  className = ""
}) => {
  return (
    <motion.div
      layoutId={id}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered container for elements that appear in sequence
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerTime?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = "",
  delay = 0.2,
  staggerTime = 0.1
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerTime
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Staggered child element
interface StaggerItemProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
  customVariants?: any;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = "",
  customVariants
}) => {
  const defaultVariants = {
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

  return (
    <motion.div
      className={className}
      variants={customVariants || defaultVariants}
    >
      {children}
    </motion.div>
  );
};

// Fade-slide in animation
interface FadeSlideProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  className?: string;
}

export const FadeSlide: React.FC<FadeSlideProps> = ({
  children,
  direction = 'up',
  duration = 0.5,
  delay = 0,
  className = ""
}) => {
  const directionMap = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 }
  };

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0,
        ...directionMap[direction]
      }}
      animate={{ 
        opacity: 1,
        x: 0,
        y: 0
      }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.div>
  );
};