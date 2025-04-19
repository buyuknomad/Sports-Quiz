// src/components/analytics/EnhancedRouteTracker.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsEvent } from '../../hooks/useAnalyticsEvent';

interface EnhancedRouteTrackerProps {
  // Optional additional params for enhanced analytics
  additionalParams?: Record<string, any>;
}

export const EnhancedRouteTracker: React.FC<EnhancedRouteTrackerProps> = ({ 
  additionalParams = {} 
}) => {
  const location = useLocation();
  const { trackPageView, trackEvent } = useAnalyticsEvent();

  // Get a descriptive page title from the current path
  const getPageNameFromPath = (path: string): string => {
    if (path === '/') return 'Home Page';
    if (path === '/welcome') return 'Welcome Screen';
    if (path === '/category') return 'Category Selection';
    if (path === '/game') return 'Quiz Game';
    if (path === '/results') return 'Results Screen';
    if (path === '/invite') return 'Invite Friends';
    if (path === '/lobby') return 'Game Lobby';
    if (path === '/about') return 'About Page';
    if (path === '/faq') return 'FAQ Page';
    
    // For dashboard and other paths
    const pathSegments = path.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const mainSegment = pathSegments[0];
      return mainSegment.charAt(0).toUpperCase() + mainSegment.slice(1) + ' Page';
    }
    
    return 'SportIQ Page';
  };

  useEffect(() => {
    // Track the current route with detailed page name
    const pageName = getPageNameFromPath(location.pathname);
    
    // Track as page view
    trackPageView(location.pathname, pageName);
    
    // Also track as event for more detailed analytics
    trackEvent('page_view', {
      page_path: location.pathname,
      page_title: pageName,
      ...additionalParams
    });
    
    // Log for debugging in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📊 Tracked route: ${location.pathname} (${pageName})`, additionalParams);
    }
  }, [location.pathname, trackPageView, trackEvent, additionalParams]);

  return null;
};

export default EnhancedRouteTracker;
