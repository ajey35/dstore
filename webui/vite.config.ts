import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { proxyPlugin } from './vite-proxy-plugin';

export default defineConfig({
    plugins: [proxyPlugin(), react()],
    server: {
        host: '0.0.0.0',
        port: 3000,
        middlewareMode: false,
    },
    preview: {
        host: '0.0.0.0',
        port: 4173,
    },
});
