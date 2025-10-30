import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { RestaurantContent } from '@/content/content.types';
import { defaultContent } from '@/content/content';

interface ContentContextType {
  content: RestaurantContent;
  updateContent: (newContent: Partial<RestaurantContent>) => void;
  resetContent: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<RestaurantContent>(defaultContent);

  //Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('pho-city-content');
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setContent(parsedContent);
      } catch (error) {
        console.error('Error loading saved content:', error);
      }
    }
  }, []);

  //Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pho-city-content', JSON.stringify(content));
  }, [content]);

  const updateContent = (newContent: Partial<RestaurantContent>) => {
    setContent(prev => ({
      ...prev,
      ...newContent
    }));
  };

  const resetContent = () => {
    setContent(defaultContent);
    localStorage.removeItem('pho-city-content');
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, resetContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}