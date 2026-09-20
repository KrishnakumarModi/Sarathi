import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The same `@/*` alias the Next.js build used, so every copied import
    // path still resolves unchanged.
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    // The API is same-origin in development too, so cookies and relative
    // fetches behave exactly as they will behind CloudFront in production.
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Recharts is heavy and only the analytics and dashboard pages need
        // it; splitting it keeps it out of the initial payload
        // (00_GLOBAL_RULES.md 13.2).
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
})
