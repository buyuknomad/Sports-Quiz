// src/components/seo/NoIndexTag.tsx
import React, { useEffect } from 'react';

interface NoIndexTagProps {
  noIndex?: boolean;
  noFollow?: boolean;
  canonicalUrl?: string;
}

/**
 * Component to add noindex/nofollow meta tags for routes that shouldn't be indexed
 * Used for dynamic game routes and user-specific content
 */
const NoIndexTag: React.FC<NoIndexTagProps> = ({ 
  noIndex = true, 
  noFollow = false,
  canonicalUrl
}) => {
  useEffect(() => {
    // Set robots meta tag
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    
    const value = `${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`;
    metaRobots.setAttribute('content', value);
    
    // Set canonical URL if provided
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }
    
    // Cleanup function to reset robots and canonical when component unmounts
    return () => {
      if (metaRobots) {
        metaRobots.setAttribute('content', 'index, follow');
      }
      
      if (canonicalUrl && document.querySelector('link[rel="canonical"]')) {
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink) {
          canonicalLink.setAttribute('href', window.location.origin);
        }
      }
    };
  }, [noIndex, noFollow, canonicalUrl]);
  
  return null; // This component doesn't render anything
};

export default NoIndexTag;
