import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/OP3_MMA/test_utilization/',
  plugins: [react()],
})
