import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",

      devOptions: {
        enabled: true
      },

      manifest: {
        name: "CGI Studio",
        short_name: "CGI Studio",

        description:
          "Interactive CGI learning, 3D creation, project management and portfolio studio.",

        start_url: "/",
        scope: "/",

        display: "standalone",

        orientation: "any",

        theme_color: "#070912",
        background_color: "#070912",

        categories: [
          "education",
          "graphics",
          "design",
          "productivity"
        ],

        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ],

        screenshots: [
          {
            src: "/screenshot-wide.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide"
          },
          {
            src: "/screenshot-narrow.png",
            sizes: "540x720",
            type: "image/png"
          }
        ]
      },

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp}"
        ]
      }
    })
  ]
});