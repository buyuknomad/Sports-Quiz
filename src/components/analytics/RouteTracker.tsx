// src/components/analytics/EnhancedRouteTracker.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsEvent } from '../../hooks/useAnalyticsEvent';

interface EnhancedRouteTrackerProps {
  currentView: string;  // The current view/gameState
  additionalParams?: Record<string, any>;  // Optional params like category, mode, etc.
}

export const EnhancedRouteTracker: React.FC<EnhancedRouteTrackerProps> = ({ 
  currentView,
  additionalParams = {} 
}) => {
  const location = useLocation();
  const { trackPageView } = useAnalyticsEvent();

  useEffect(() => {
    // Track traditional URL changes
    trackPageView(location.pathname);
  }, [location, trackPageView]);

  useEffect(() => {
    // Track state-based view changes as virtual pageviews
    if (currentView) {
      trackPageView(`/view/${currentView}`, `${currentView.charAt(0).toUpperCase() + currentView.slice(1)} View`);
      
      // Log for debugging
      console.log(`Tracked virtual pageview: ${currentView}`, additionalParams);
    }
  }, [currentView, additionalParams, trackPageView]);

  return null;
};