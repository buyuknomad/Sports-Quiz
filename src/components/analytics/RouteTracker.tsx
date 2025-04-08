// src/components/analytics/RouteTracker.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsEvent } from '../../hooks/useAnalyticsEvent';

export const RouteTracker = () => {
  const location = useLocation();
  const { trackPageView } = useAnalyticsEvent();

  useEffect(() => {
    // Track page view when location changes
    trackPageView(location.pathname);
  }, [location, trackPageView]);

  return null;
};
