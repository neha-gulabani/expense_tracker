import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
           
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
          
            // Forward the authorization header
            const authHeader = req.headers.authorization;
            if (authHeader) {
              proxyReq.setHeader('authorization', authHeader);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
           
          });
        },
      }
    }
  }
})
