import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/OP3_MMA/fec/',
  plugins: [react()],
})