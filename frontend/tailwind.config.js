// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        brand: {
          red: "hsl(356 72% 40%)",
          redHover: "hsl(356 72% 33%)",
          gold: "hsl(42 86% 54%)",
          goldHover: "hsl(42 86% 45%)",
          cream: "hsl(35 100% 97%)",
          charcoal: "hsl(12 12% 12%)",
          herb: "hsl(146 45% 36%)",
        },
      },
    },
  },
  plugins: [],
};
