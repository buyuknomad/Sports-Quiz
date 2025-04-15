import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { 
  supabase, 
  signIn, 
  signUp, 
  signOut, 
  signInWithGoogle, 
  getSession, 
  getCurrentUser,
  onAuthStateChange 
} from '../lib/supabase-client';

// Define the shape of our authentication context
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from the profiles table
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Function to refresh the user's profile data
  const refreshProfile = async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // Custom sign up function that includes username
  const handleSignUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await signUp(email, password);
      
      if (error) {
        return { error };
      }

      // If using the trigger approach, the profile will be created automatically
      // Otherwise, we would create the profile here

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Initialize auth state when component mounts
  useEffect(() => {
    // Get the initial session
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Get current session
        const { data: sessionData } = await getSession();
        setSession(sessionData.session);

        // If we have a session, get the user
        if (sessionData.session?.user) {
          setUser(sessionData.session.user);
          
          // Fetch user profile
          const profileData = await fetchProfile(sessionData.session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data } = onAuthStateChange(async (session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

    // Clean up subscription when component unmounts
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Values to provide to consumers of this context
  const value = {
    session,
    user,
    profile,
    loading,
    signUp: handleSignUp,
    signIn: async (email: string, password: string) => {
      const { error } = await signIn(email, password);
      return { error };
    },
    signInWithGoogle: async () => {
      const { error } = await signInWithGoogle();
      return { error };
    },
    signOut: async () => {
      const { error } = await signOut();
      return { error };
    },
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};