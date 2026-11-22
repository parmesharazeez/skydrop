import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves this project at /skydrop/, not the domain root.
  base: '/skydrop/',
  plugins: [react()],
  server: { port: 3000 },
});
