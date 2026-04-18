import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), svgr()],
  esbuild:
    mode === "production" ? { drop: ["console", "debugger"] } : undefined,
  server: {
    host: true,
    allowedHosts: ["untrivial-uncausatively-shaun.ngrok-free.dev"],
    proxy: {
      "/api": "http://localhost:8080",
      "/uploads": "http://localhost:8080"
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
}));
