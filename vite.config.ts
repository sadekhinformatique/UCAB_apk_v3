import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode (e.g. .env, .env.production)
  // The third parameter '' ensures we load all variables, not just VITE_ ones, 
  // though for client security usually we prefer VITE_.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    define: {
      // This polyfills process.env.API_KEY for the browser
      // It looks for VITE_API_KEY first (Netlify standard), then API_KEY
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || '')
    }
  }
})