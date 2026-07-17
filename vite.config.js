import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiPlugin } from './server/apiPlugin.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
})
