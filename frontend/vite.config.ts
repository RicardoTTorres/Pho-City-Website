// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dotenv from "dotenv";
dotenv.config(); // import.meta.env doesn't work in this config file, need to import dotenv to access process.env instead

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.LOCAL_BACKEND_URL || "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});