import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/tanda-rapid-mockup/',
  plugins: [react()],
})
