import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '~backend/client': path.resolve(__dirname, './client'),
      '~backend': path.resolve(__dirname, '../backend'),
    },
  },
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },

  // 🚀 Local Development
  server: {
    port: 5173,
    open: true,
    host: '0.0.0.0',
    allowedHosts: [
      'hic-system.onrender.com',
      'localhost',
      '.onrender.com',
      '0.0.0.0',
    ], // ✅ allows Render & local dev
  },

  // 🌐 Production Preview (Render)
  preview: {
    port: 10000,
    host: '0.0.0.0',
    allowedHosts: ['*'], // ✅ allow all for Render health check
  },

  // 🏗️ Build Configuration
  build: {
    outDir: 'dist',          // output folder for build files
    emptyOutDir: true,       // clear old build before new one
    sourcemap: false,        // no unnecessary mapping in prod
    minify: true,            // smaller, faster build
  },
})
