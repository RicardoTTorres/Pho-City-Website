// Single source of truth for public-facing pages.
// DashboardPage derives "Total Pages" from this list.
// Update here whenever a public route is added or removed in App.tsx.

export const PUBLIC_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
  { path: "/menu", label: "Menu" },
] as const;
