// src/hooks/useAnalyticsEvent.ts
// Custom hook for sending events to Google Analytics with gtag.js
import { useEffect } from 'react';

// Get GA ID from environment variables
const GA_ID = import.meta.env.VITE_GA_ID;

// Add gtag to window object type
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const useAnalyticsEvent = () => {
  useEffect(() => {
    if (!GA_ID) {
      console.warn('Google Analytics ID (VITE_GA_ID) is not set');
      return;
    }

    // Initialize gtag if not already defined
    if (typeof window.gtag !== 'function') {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;

      // Initialize GA with configuration
      gtag('js', new Date());
      gtag('config', GA_ID, {
        send_page_view: true,
        cookie_domain: 'auto',
        anonymize_ip: true
      });
    }
  }, []);

  // Function to track custom events
  const trackEvent = (
    eventName: string,
    eventParams?: {
      category?: string;
      label?: string;
      value?: number;
      [key: string]: any;
    }
  ) => {
    if (!GA_ID || typeof window.gtag !== 'function') return;

    window.gtag('event', eventName, {
      ...eventParams,
      send_to: GA_ID
    });
  };

  // Function to track page views
  const trackPageView = (path: string, title?: string) => {
    if (!GA_ID || typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      send_to: GA_ID
    });
  };

  return { trackEvent, trackPageView };
};
