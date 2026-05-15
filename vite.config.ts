import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/gitadora-skill/" : "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    // Serve kuromoji dict files as raw octet-stream to prevent browser auto-decompression
    {
      name: "serve-dict-raw",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith("/dict/") && req.url.endsWith(".dat.gz")) {
            const filePath = path.join(__dirname, "public", req.url);
            if (fs.existsSync(filePath)) {
              const data = fs.readFileSync(filePath);
              res.setHeader("Content-Type", "application/octet-stream");
              res.setHeader("Content-Length", data.length);
              res.end(data);
              return;
            }
          }
          next();
        });
      },
    },
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      path: "path-browserify",
      kuromoji: path.resolve(__dirname, "node_modules/kuromoji/build/kuromoji.js"),
    },
  },
}));
