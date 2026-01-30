import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // Questo è l'equivalente del --poll che hai nel backend
    },
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'app.dike.cloud',
      'localhost'
    ],
    strictPort: true,
  },
})
