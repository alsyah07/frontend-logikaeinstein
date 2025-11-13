import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
      manifest: {
        name: 'Logika Einstein',
        short_name: 'Logika',
        description: 'Belajar interaktif Matematika & Fisika',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#155ea0',
        icons: [
          { src: '/images/logo_logika.png', sizes: '192x192', type: 'image/png' },
          { src: '/images/logo_logika.png', sizes: '512x512', type: 'image/png' },
          { src: '/images/logo_logika.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ]
})
