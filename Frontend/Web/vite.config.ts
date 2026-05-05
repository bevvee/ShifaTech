import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['@stomp/stompjs', 'sockjs-client'],
    exclude: ['sockjs-client/dist/sockjs', 'sockjs-client/dist/sockjs.js']
  }
});
