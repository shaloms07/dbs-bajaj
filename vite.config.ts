import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// Automatically setup env file based on git branch
try {
  execSync('node scripts/setup-env.js', { stdio: 'inherit' });
} catch (err) {
  console.error('[vite.config.ts] Failed to run setup-env.js script:', err);
}

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '127.0.0.1',
    port: 3000
  }
});
