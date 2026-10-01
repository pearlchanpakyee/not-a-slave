import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/not-a-slave/', // <-- 喺度加呢行（記得最尾有個逗號）
})