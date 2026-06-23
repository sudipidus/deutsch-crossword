import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/deutsch-crossword/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Deutsch Crossword',
        short_name: 'Deutsch',
        description: 'German vocabulary crosswords (A1–B1) — English clues, German answers.',
        lang: 'de',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        // base-relative so it resolves correctly under /deutsch-crossword/
        scope: '/deutsch-crossword/',
        start_url: '/deutsch-crossword/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // cache the app shell + data so it works fully offline once loaded
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
        navigateFallback: '/deutsch-crossword/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
