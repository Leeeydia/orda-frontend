import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
  host: true,
  allowedHosts: ["untrivial-uncausatively-shaun.ngrok-free.dev"],
  proxy: {
    '/api': 'http://localhost:8080'  // 이거 추가
  }
},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
