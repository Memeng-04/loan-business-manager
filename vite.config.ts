/// <reference types="vitest" />
import { defineConfig } from 'vitest/config' // Change this line
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png'],
      manifest: {
        name: 'LEND - Loan Efficiency through Networked Data',
        short_name: 'LEND',
        description: 'Loan business management progressive web app',
        theme_color: '#012a6a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['*/.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', 
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false, // Sequential is still safer for shared remote DBs
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/E2E/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,playwright}.config.*'
    ],
  },
})