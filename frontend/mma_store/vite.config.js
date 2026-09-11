import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Base path สำหรับการดึงไฟล์ JS/CSS บน Xampp Server
  base: '/OP3_MMA/mma_store/',
  plugins: [react()],
  
  // Proxy นี้จะทำงานเฉพาะตอนรัน npm run dev เท่านั้น
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost', // ชี้ไปที่ Xampp บนเครื่อง dev
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/OP3_MMA/api/mma_store'),
      },
    },
  },
})