// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   base: '/OP3_MMA/login/',
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0',
//     port: 5175
//   }
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/OP3_MMA/login/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5175,
    // 🌟 เพิ่มส่วนการตั้งค่า Proxy ด้านล่างนี้
    proxy: {
      '/web_upload': {
        target: 'http://localhost:8080', // ชี้ไปที่พอร์ต Docker Backend ของคุณ
        changeOrigin: true,
        secure: false,
      }
    }
  }
})