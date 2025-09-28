"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}

interface TwitterContextType {
  user: TwitterUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  connectTwitter: () => void;
  disconnectTwitter: () => void;
  postTweet: (text: string) => Promise<{ success: boolean; tweet?: any; error?: string }>;
}

const TwitterContext = createContext<TwitterContextType | undefined>(undefined);

export const TwitterProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<TwitterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/twitter/user');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to check Twitter auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectTwitter = () => {
    window.location.href = '/api/twitter/auth';
  };

  const disconnectTwitter = async () => {
    try {
      // Clear cookies by setting them to expire
      document.cookie = 'twitter_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'twitter_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'twitter_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      setUser(null);
    } catch (error) {
      console.error('Failed to disconnect Twitter:', error);
    }
  };

  const postTweet = async (text: string): Promise<{ success: boolean; tweet?: any; error?: string }> => {
    try {
      const response = await fetch('/api/twitter/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, tweet: data.tweet };
      } else {
        return { success: false, error: data.error || 'Failed to post tweet' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <TwitterContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        connectTwitter,
        disconnectTwitter,
        postTweet,
      }}
    >
      {children}
    </TwitterContext.Provider>
  );
};

export const useTwitter = () => {
  const context = useContext(TwitterContext);
  if (context === undefined) {
    throw new Error('useTwitter must be used within a TwitterProvider');
  }
  return context;
};
