import { defineConfig } from '@playwright/test';

export default defineConfig({
   testDir: './e2e',
   outputDir: './test-results',
   timeout: 45000,
   expect: { timeout: 10000 },
   workers: 2,
   reporter: 'list',
   use: {
      baseURL: 'http://127.0.0.1:5177',
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      reducedMotion: 'reduce',
      launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
   },
   projects: [320, 390, 768, 1440].map(width => ({ name: `${width}px`, use: { browserName: 'chromium', viewport: { width, height: width >= 1024 ? 1000 : 844 }, hasTouch: width < 1024, isMobile: width < 768, deviceScaleFactor: 1 } })),
   webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5177 --strictPort', url: 'http://127.0.0.1:5177', reuseExistingServer: !process.env.CI },
});
