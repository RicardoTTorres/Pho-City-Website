// src/content/content.types.ts

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
  price: string;
  image?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
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
  menu: {
    categories: MenuCategory[];
  };
  onlineOrder: {
    pickupUrl: string;
    deliveryUrl: string;
  };
  dashboard: {
    numMenuItems: number;
    numMenuCategories: number;
  };
}
