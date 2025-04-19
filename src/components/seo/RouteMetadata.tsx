// src/components/seo/RouteMetadata.tsx
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Define metadata for each route
const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'SportIQ - Test Your Sports Knowledge in Quiz Battles',
    description: 'Challenge your sports knowledge in solo mode or compete against friends in real-time 1v1 battles across football, basketball, tennis, and Olympics categories.'
  },
  '/welcome': {
    title: 'Welcome to SportIQ - Choose Your Game Mode',
    description: 'Select your preferred game mode: play solo to practice or challenge a friend to a 1v1 sports quiz battle in multiple categories.'
  },
  '/category': {
    title: 'Choose a Sports Category - SportIQ Quiz',
    description: 'Select from football, basketball, tennis, Olympics, or mixed sports categories to test your knowledge in our interactive sports quiz.'
  },
  '/game': {
    title: 'SportIQ Quiz Game - Test Your Sports Knowledge',
    description: 'Answer sports trivia questions, earn points for correct answers and quick responses in this interactive sports quiz game.'
  },
  '/results': {
    title: 'Your Quiz Results - SportIQ Sports Trivia',
    description: 'View your performance, accuracy, and score breakdown. Challenge friends to beat your score in our sports trivia quiz.'
  },
  '/invite': {
    title: 'Invite Friends to Play - SportIQ 1v1 Quiz Battle',
    description: 'Share your game code to challenge friends to a 1v1 sports trivia battle in real-time.'
  },
  '/lobby': {
    title: 'Game Lobby - SportIQ Multiplayer Quiz',
    description: 'Wait for your opponent to join and prepare for an exciting 1v1 sports knowledge battle.'
  },
  '/about': {
    title: 'About SportIQ - The Ultimate Sports Trivia Game',
    description: 'Learn about SportIQ, our mission, features, and the different sports categories available in our trivia quiz game.'
  },
  '/faq': {
    title: 'Frequently Asked Questions - SportIQ Sports Quiz',
    description: 'Find answers to common questions about SportIQ - how to play, scoring system, game modes, and more.'
  }
};

// Default metadata as fallback
const defaultMetadata = {
  title: 'SportIQ - Sports Trivia Quiz Game',
  description: 'Test your sports knowledge with SportIQ, the ultimate sports trivia quiz game with solo and multiplayer modes.'
};

const RouteMetadata: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const isMounted = useRef(true);
  
  // Track component mounting state
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    // Skip updates if component is unmounting
    if (!isMounted.current) return;
    
    try {
      // Get metadata for the current path, or use default
      const metadata = routeMetadata[path] || defaultMetadata;
      
      // Update document title
      if (isMounted.current) {
        document.title = metadata.title;
      }
      
      // Perform all updates in a single batch to minimize reflows
      if (isMounted.current) {
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', metadata.description);
        }
        
        // Update Open Graph and Twitter meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const twitterTitle = document.querySelector('meta[property="twitter:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const twitterDescription = document.querySelector('meta[property="twitter:description"]');
        
        if (ogTitle) ogTitle.setAttribute('content', metadata.title);
        if (twitterTitle) twitterTitle.setAttribute('content', metadata.title);
        if (ogDescription) ogDescription.setAttribute('content', metadata.description);
        if (twitterDescription) twitterDescription.setAttribute('content', metadata.description);
        
        // Update canonical URL with additional checks
        const canonicalURL = document.querySelector('link[rel="canonical"]');
        if (canonicalURL) {
          canonicalURL.setAttribute('href', `https://sportiq.games${path}`);
        }
      }
    } catch (error) {
      console.error('Error updating route metadata:', error);
    }
  }, [path]);
  
  return null; // This component doesn't render anything
};

export default RouteMetadata;
