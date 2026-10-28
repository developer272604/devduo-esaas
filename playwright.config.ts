import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  use: { baseURL: 'http://localhost:3100', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run build && npx vite preview --port 3100 --strictPort',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
