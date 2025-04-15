import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase-client';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // The hash contains access_token, refresh_token etc.
    const handleAuthChange = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      }
    });

    // Process the OAuth callback
    const { hash } = window.location;
    if (hash && hash.includes('access_token')) {
      // The hash will be processed automatically by Supabase Auth
      // but we can manually handle the redirect after processing
      const timeout = setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
      return () => {
        clearTimeout(timeout);
        handleAuthChange.data.subscription.unsubscribe();
      };
    }
    
    return () => {
      handleAuthChange.data.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0c1220] to-[#1a1a2e]">
      <div className="text-center text-white">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl font-medium">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;