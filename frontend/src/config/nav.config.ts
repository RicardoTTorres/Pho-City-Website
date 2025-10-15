export const navConfig = {
  brand: { name: "Pho City", logo: "/src/assets/logo.svg" },
  nav: [
    { label: "About", id: "about" },
    { label: "Menu", id: "menu" },
    { label: "Contact", id: "contact" },
  ] as const,
} as const;

export type NavItem = (typeof navConfig)["nav"][number];
