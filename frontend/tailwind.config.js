
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#fd160d",    // red
        secondary: "#d4af37",  // gold
        cream: "#fff8e7",      // warm cream
      },
    },
  },
  plugins: [],
};
