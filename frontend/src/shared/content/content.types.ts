// src/shared/content/content.types.ts

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

 
  footer: {
    brand: {
      name: string;
      logo: string;
    };
    navLinks: {
      label: string;
      path: string;
      external?: boolean;
      visible?: boolean;
    }[];
    socialLinks: {
      platform: string;
      url: string;
      icon: string;
    }[];
    contact: {
      address: string;
      cityZip: string;
      phone: string;
    };
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
  adminUsers: AdminUser[];
}

export interface AdminUser {
  id: number;
  email: string;
  role: string;
  created_at: string;
}
export type LocalizedString = {
  en: string;
  [locale: string]: string;
};

export type NavbarCta = {
  enabled: boolean;
  label: LocalizedString;
  href: string;
};

export type NavbarCtas = {
  pickup: NavbarCta;
  delivery: NavbarCta;
};


export type NavbarLink = {
  id: string;
  label: string | { en: string; [locale: string]: string };
  href: string;
  type: "internal" | "external";
  order: number;
  enabled: boolean;
  rolesAllowed?: string[];
};

export type NavbarBrand = {
  name: string;
  logo: string;
};

export type NavbarData = {
  version?: number;
  i18n?: {
    enabled: boolean;
    defaultLocale: string;
    supportedLocales: string[];
  };
  brand?: {
    name: string;
    logo: string;
  };
  links: NavbarLink[];
  ctas?: NavbarCtas;
  updatedAt?: string | null;
  updatedBy?: number | null;
};



export type Navbar = NavbarData;
export type FooterData = RestaurantContent["footer"];
export type Footer = FooterData;

