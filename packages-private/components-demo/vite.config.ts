import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  server: {
    port: 8989,
  },
  plugins: [react()],
})
