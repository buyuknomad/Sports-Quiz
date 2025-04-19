// src/hooks/useCategoryMetadata.ts
import { useEffect } from 'react';
import type { Category } from '../types';

interface CategoryMetadata {
  title: string;
  description: string;
  emoji: string;
  keywords: string;
}

// Category-specific metadata
const categoryMetadata: Record<Category, CategoryMetadata> = {
  football: {
    title: 'Football Quiz - Test Your Soccer Knowledge',
    description: 'Challenge yourself with our football trivia quiz. Test your knowledge of teams, players, and historic matches in solo mode or 1v1 battles.',
    emoji: '⚽',
    keywords: 'football quiz, soccer trivia, football knowledge test, sports quiz'
  },
  basketball: {
    title: 'Basketball Quiz - NBA and International Hoops Trivia',
    description: 'Put your basketball knowledge to the test with questions about NBA legends, championship teams, and international basketball competitions.',
    emoji: '🏀',
    keywords: 'basketball quiz, NBA trivia, basketball knowledge test, hoops quiz'
  },
  tennis: {
    title: 'Tennis Quiz - Grand Slam and Tennis Stars Trivia',
    description: 'Test your knowledge of tennis Grand Slams, legendary players, and historic matches in our challenging tennis trivia quiz.',
    emoji: '🎾',
    keywords: 'tennis quiz, Grand Slam trivia, tennis players quiz, sports trivia'
  },
  olympics: {
    title: 'Olympics Quiz - Test Your Olympic Games Knowledge',
    description: 'Challenge yourself with trivia about Olympic Games history, medal winners, and memorable Olympic moments across summer and winter games.',
    emoji: '🏅',
    keywords: 'Olympics quiz, Olympic Games trivia, medal winners, Olympic history'
  },
  mixed: {
    title: 'Mixed Sports Quiz - Ultimate Sports Knowledge Test',
    description: 'The ultimate sports trivia challenge with questions across football, basketball, tennis, Olympics and more in one exciting quiz.',
    emoji: '🎯',
    keywords: 'sports quiz, mixed sports trivia, multi-sport quiz, sports knowledge test'
  }
};

/**
 * Hook to update document metadata based on the selected sports category
 */
export const useCategoryMetadata = (category: Category | null) => {
  useEffect(() => {
    // Only update metadata if a category is selected
    if (!category) return;
    
    const metadata = categoryMetadata[category];
    
    // Update document title
    document.title = `${metadata.title} - SportIQ`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', metadata.description);
    }
    
    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', metadata.keywords);
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
    
  }, [category]);
  
  return categoryMetadata[category as Category] || null;
};

export default useCategoryMetadata;
