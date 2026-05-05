import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '')
  // System env var (Docker ARG/ENV, CI) takes priority over .env file
  const apiBase = process.env.VITE_API_BASE_URL || fileEnv.VITE_API_BASE_URL
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBase),
    },
  }
})
