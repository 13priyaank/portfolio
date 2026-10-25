import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // three.js is its own lazily loaded chunk; it is large by nature
  build: { chunkSizeWarningLimit: 600 },
})
