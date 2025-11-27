import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import { URL } from 'url';

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable websocket proxy
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.error('❌ Proxy error:', err.message);
            if (res && !res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
              });
              res.end(
                JSON.stringify({
                  error: 'Backend server không chạy. Vui lòng khởi động backend tại port 3000.',
                  message: 'Hãy chạy: cd RIKA_Quy_TSNT && npm run start:dev',
                })
              );
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`🔄 Proxying ${req.method} ${req.url} -> http://localhost:3000${req.url}`);
          });
        },
      },
    },
  },
});

