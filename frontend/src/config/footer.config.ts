
import { navConfig } from "./nav.config";

export const footerConfig = {
  brand: {
    name: "Pho City",
  },
  // reuse the shared nav items (if footer needs additional links, extend here)
  navLinks: [
    // include a Home link plus the shared nav items
    { label: "Home", href: "#home" },
    ...navConfig.nav,
    { label: "Order", href: "https://toasttab.com/your-store", external: true },
  ],
  instagram: { href: "https://instagram.com/" },
  contact: {
    address: "6175 Stockton Blvd #200",
    cityZip: "Sacramento, CA 95824",
    phone: "(916) 754-2143",
  },
} as const;
