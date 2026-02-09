// src/content/content.types.ts

export type HeroAPI = {
  id: number | string;
  title: string;
  subtitle: string;
  ctaText: string;
  secondaryCtaText: string;
  imageUrl: string | null;
};

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string | number;
  image?: string;
  visible?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items?: MenuItem[];
}

export interface MenuData {
  categories: MenuCategory[];
}

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
    hours: Record<Weekday, string>;
  };
  menuPublic: MenuData | null;
  menuAdmin: MenuData | null;
  onlineOrder: {
    pickupUrl: string;
    deliveryUrl: string;
  };
  dashboard: {
    numMenuItems: number;
    numMenuCategories: number;
  };
  adminUsers: {
    email: string;
    password: string;
  };
}

export type FooterData = RestaurantContent["footer"];
