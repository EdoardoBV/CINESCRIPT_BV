
declare const process: any;
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  console.log("Build: Loaded GEMINI_API_KEY?", !!env.GEMINI_API_KEY);
  console.log("Build: Loaded API_KEY?", !!env.API_KEY);

  return {
    base: './', // Ensure assets are loaded relatively for Electron
    build: {
      outDir: 'dist_web',
      emptyOutDir: true
    },
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the Google GenAI SDK
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
      // Expose API_KEY to import.meta.env for our service
      'import.meta.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
    },
    server: {
      host: true, // Listen on all local IPs to allow mobile testing
      port: 3000,
    }
  }
})