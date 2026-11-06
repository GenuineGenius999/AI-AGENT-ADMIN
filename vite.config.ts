import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend is independent of the backend host.
// Set VITE_API_BASE_URL in frontend/.env (e.g. http://localhost:4000 or your API domain).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
