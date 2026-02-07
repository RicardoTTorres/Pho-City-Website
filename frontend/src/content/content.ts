// src/content/content.ts
import type { MenuData, RestaurantContent } from "./content.types";

const defaultMenu: MenuData = {
  categories: [
    {
      id: "pho",
      name: "Pho",
      items: [
        { id: "pho-tai", name: "Pho Tai", description: "Rare beef pho with fresh herbs and lime", price: "$12.95", visible: true },
        { id: "pho-ga", name: "Pho Ga", description: "Traditional chicken pho with aromatic broth", price: "$11.95", visible: true },
        { id: "pho-chay", name: "Pho Chay", description: "Vegetarian pho with tofu and vegetables", price: "$10.95", visible: true },
      ],
    },
    {
      id: "appetizers",
      name: "Appetizers",
      items: [
        { id: "spring-rolls", name: "Fresh Spring Rolls", description: "Rice paper rolls with shrimp, lettuce, and herbs", price: "$8.95", visible: true },
        { id: "fried-rolls", name: "Fried Spring Rolls", description: "Crispy rolls filled with pork and vegetables", price: "$7.95", visible: true },
      ],
    },
  ],
};

export const defaultContent = {
  hero: {
    title: "Authentic Vietnamese Cuisine",
    subtitle:
      "Experience authentic Vietnamese flavors in the heart of Sacramento. From traditional pho to modern Vietnamese fusion, every dish is crafted with passion and tradition.",
    ctaText: "View Our Menu",
  },
  about: {
    title: "About Pho City",
    content:
      "Welcome to Pho City, Sacramento's go-to destination for authentic Vietnamese flavors! We proudly serve a wide range of dishes with dine-in, takeout, and delivery options to fit your lifestyle. Our menu features vegan and vegetarian choices, ensuring something for everyone.\n\nAs an Asian and women-owned restaurant, we celebrate culture, inclusivity, and community. We also support our veterans with a military discount as a token of gratitude.\n\nAt Pho City, every dish is crafted with tradition, passion, and care.",
  },
  contact: {
    address: "6175 Stockton Blvd #200, Sacramento, CA 95824",
    phone: "(916) 754-2143",
    hours: {
      Monday: "9:00 AM - 8:00 PM",
      Tuesday: "Closed",
      Wednesday: "9:00 AM - 8:00 PM",
      Thursday: "9:00 AM - 8:00 PM",
      Friday: "9:00 AM - 8:00 PM",
      Saturday: "9:00 AM - 8:00 PM",
      Sunday: "9:00 AM - 8:00 PM",
    },
  },
  menuPublic: defaultMenu,
  menuAdmin: defaultMenu,
  onlineOrder: {
    pickupUrl: "https://order.toasttab.com/online/pho-city-6175-stockton-boulevard-200",
    deliveryUrl: "https://www.doordash.com/store/pho-city-sacramento-30636201/41947147/?pickup=false",
  },
  dashboard: {
    numMenuItems: 7,
    numMenuCategories: 3
  },
  footer: {
    brand: {
      name: "Pho City",
      logo: "/logo.png",
    },
    navLinks: [
      { label: "Home", path: "/" },
      { label: "Menu", path: "/menu" },
      { label: "Contact", path: "/contact" },
      { label: "About", path: "/about" },
    ],
    instagram: {
      url: "https://www.instagram.com/phocity_vietnamesecuisine/",
      icon: "/instagram_icon.png",
    },
    contact: {
      address: "6175 Stockton Blvd #200, Sacramento, CA 95824",
      cityZip: "Sacramento, CA 95824",
      phone: "(916) 754-2143",
    },
  }
  
  
} satisfies RestaurantContent;
