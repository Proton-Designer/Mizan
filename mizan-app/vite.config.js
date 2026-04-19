import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/propublica': {
        target: 'https://projects.propublica.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/propublica/, '/nonprofits/api/v2'),
      },
      '/api/irs': {
        target: 'https://efts.irs.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/irs/, '/LATEST'),
      },
    },
  },
})
