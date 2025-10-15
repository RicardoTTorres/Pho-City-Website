import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define the content structure
export interface RestaurantContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    backgroundImage?: string;
  };
  about: {
    title: string;
    content: string;
  };
  contact: {
    address: string;
    phone: string;
    hours: {
      [key: string]: string;
    };
  };
  menu: {
    categories: MenuCategory[];
  };
  onlineOrder: {
    pickupUrl: string;
    deliveryUrl: string;
  };
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
}

// Default content
const defaultContent: RestaurantContent = {
  hero: {
    title: "Authentic Vietnamese Cuisine",
    subtitle: "Experience authentic Vietnamese flavors in the heart of Sacramento. From traditional pho to modern Vietnamese fusion, every dish is crafted with passion and tradition.",
    ctaText: "View Our Menu"
  },
  about: {
    title: "Authentic Vietnamese Cuisine",
    content: "Welcome to Pho City, Sacramento's go-to destination for authentic Vietnamese flavors! We proudly serve a wide range of dishes, with dine-in, takeout, and delivery options to fit your lifestyle. Our menu also features vegan and vegetarian choices, ensuring something for everyone.\n\nAs an Asian and women-owned restaurant, we celebrate culture, inclusivity, and community. We're also honored to support our veterans with a military discount as a token of gratitude.\n\nAt Pho City, every dish is crafted with tradition, passion, and care. Join us and experience Vietnamese cuisine that truly transcends expectations."
  },
  contact: {
    address: "6175 Stockton Blvd #200, Sacramento, CA 95824",
    phone: "(916) 754-2143",
    hours: {
      "Monday": "9:00 AM - 8:00 PM",
      "Tuesday": "Closed",
      "Wednesday": "9:00 AM - 8:00 PM",
      "Thursday": "9:00 AM - 8:00 PM",
      "Friday": "9:00 AM - 8:00 PM",
      "Saturday": "9:00 AM - 8:00 PM",
      "Sunday": "9:00 AM - 8:00 PM"
    }
  },
  menu: {
    categories: [
      {
        id: "pho",
        name: "Pho",
        items: [
          {
            id: "pho-tai",
            name: "Pho Tai",
            description: "Rare beef pho with fresh herbs and lime",
            price: "$12.95"
          },
          {
            id: "pho-ga",
            name: "Pho Ga",
            description: "Traditional chicken pho with aromatic broth",
            price: "$11.95"
          },
          {
            id: "pho-chay",
            name: "Pho Chay",
            description: "Vegetarian pho with tofu and vegetables",
            price: "$10.95"
          }
        ]
      },
      {
        id: "appetizers",
        name: "Appetizers",
        items: [
          {
            id: "spring-rolls",
            name: "Fresh Spring Rolls",
            description: "Rice paper rolls with shrimp, lettuce, and herbs",
            price: "$8.95"
          },
          {
            id: "fried-rolls",
            name: "Fried Spring Rolls",
            description: "Crispy rolls filled with pork and vegetables",
            price: "$7.95"
          }
        ]
      },
      {
        id: "rice-dishes",
        name: "Rice Dishes",
        items: [
          {
            id: "com-ga",
            name: "Com Ga Nuong",
            description: "Grilled chicken with jasmine rice",
            price: "$13.95"
          },
          {
            id: "com-thit",
            name: "Com Thit Nuong",
            description: "Grilled pork with jasmine rice",
            price: "$13.95"
          }
        ]
      }
    ]
  },
  onlineOrder: {
    pickupUrl: "https://order.toasttab.com/online/pho-city-6175-stockton-boulevard-200",
    deliveryUrl: "https://www.doordash.com/store/pho-city-sacramento-30636201/41947147/?pickup=false"
  }
};

interface ContentContextType {
  content: RestaurantContent;
  updateContent: (newContent: Partial<RestaurantContent>) => void;
  resetContent: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<RestaurantContent>(defaultContent);

  // Load content from localStorage on mount
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

  // Save content to localStorage whenever it changes
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