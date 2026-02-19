// src/shared/config/nav.config.ts
export const navConfig = {
  brand: { name: "Pho City", logo: "/logo.png" },
  nav: [
    { label: "About", path: "about" },
    { label: "Menu", path: "menu" },
    { label: "Contact", path: "contact" },
  ] as const,
} as const;

export type NavItem = (typeof navConfig)["nav"][number];
