import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/host': 'http://localhost:3001',
      '/join': 'http://localhost:3001',
      '/rooms': 'http://localhost:3001'
    },
  },
  base: process.env.VITE_BASE_PATH || "/"
})
