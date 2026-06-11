import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Visualizer sirf production build mein — dev mein browser tabs spam nahi hoga
    mode === "production" && visualizer({
      open:     false,   // auto-open band — manually stats.html kholo
      gzipSize: true,
      filename: "stats.html",
    }),
  ].filter(Boolean),

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },

  build: {
    chunkSizeWarningLimit: 600,
    minify:    "esbuild",
    sourcemap: false,
    target:    "es2020",

    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":    ["react", "react-dom"],
          "vendor-router":   ["react-router-dom"],
          "vendor-query":    ["@tanstack/react-query"],
          "vendor-http":     ["axios"],
          "vendor-icons":    ["lucide-react"],
          "vendor-toast":    ["sonner"],
          "vendor-ui-utils": ["clsx", "tailwind-merge", "class-variance-authority"],
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-toast",
            "@radix-ui/react-tabs",
            "@radix-ui/react-label",
            "@radix-ui/react-slot",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-avatar",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },
  },

  optimizeDeps: {
    include: [
      "react", "react-dom", "react-router-dom",
      "axios", "@tanstack/react-query",
      "lucide-react", "sonner", "clsx", "tailwind-merge",
    ],
  },
}));