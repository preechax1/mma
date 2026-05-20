import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/OP3_MMA/login/', // ตั้งค่า Path สำหรับวางบน Server ในโฟลเดอร์ย่อย
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5175
  }
})