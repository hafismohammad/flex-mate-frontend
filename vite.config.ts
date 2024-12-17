import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // This plugin allows fast SWC-based React development with Vite

export default defineConfig({
  plugins: [react()],
});
