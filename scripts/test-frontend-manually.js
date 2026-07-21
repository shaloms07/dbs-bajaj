import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = '/home/atharv/.gemini/antigravity-cli/brain/c9fe773b-f51b-485e-9669-9701e6844671';
const screenshotDir = path.join(artifactDir, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Inline mock data to keep the test runner self-contained
const mockLookupData = {
  MH31AB1234: {
    regNo: 'MH31AB1234',
    vehicleType: 'Private Car',
    score: 290,
    band: 'EXEMPLARY',
    severityIndex: 8,
    recentTrend: 'Up',
    challanStatus: 'Clear',
    tpLoading: 0,
    violations: [
      { type: 'Wrong Parking', date: '2026-02-11', location: 'Pune', thz: 'L', status: 'Paid', impact: 10 }
    ]
  },
  DL8CAF9012: {
    regNo: 'DL8CAF9012',
    vehicleType: 'Goods Vehicle',
    score: 190,
    band: 'AT_RISK',
    severityIndex: 55,
    recentTrend: 'Stable',
    challanStatus: 'Pending',
    tpLoading: 3600,
    violations: [
      { type: 'Overspeeding', date: '2026-01-25', location: 'Delhi', thz: 'H', status: 'Paid', impact: 80 },
      { type: 'Vehicle Modification', date: '2025-12-12', location: 'Delhi', thz: 'L', status: 'Paid', impact: 20 },
      { type: 'Wrong Parking', date: '2025-10-03', location: 'Delhi', thz: 'L', status: 'Paid', impact: 10 }
    ]
  }
};

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Starting local dev server...');
  const devServer = spawn('npm', ['run', 'dev'], { cwd: rootDir, stdio: 'inherit' });

  // Give dev server some time to start up
  await wait(4000);

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Enable request interception to mock staging APIs
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();
      const method = request.method();

      // Handle CORS preflight OPTIONS requests
      if (method === 'OPTIONS' && url.includes('dbscore.in')) {
        request.respond({
          status: 200,
          headers: {
            'access-control-allow-origin': 'http://127.0.0.1:3000',
            'access-control-allow-methods': 'GET, POST, OPTIONS, PUT, DELETE',
            'access-control-allow-headers': 'content-type, authorization',
            'access-control-allow-credentials': 'true'
          }
        });
        return;
      }

      if (url.includes('/auth/login')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'access-control-allow-origin': 'http://127.0.0.1:3000',
            'access-control-allow-credentials': 'true'
          },
          body: JSON.stringify({
            user: { name: 'Demo Insurer', username: 'bgil.admin', insurer: 'Bajaj' }
          })
        });
      } else if (url.includes('/dashboard/lookup/MH31AB1234')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'access-control-allow-origin': 'http://127.0.0.1:3000',
            'access-control-allow-credentials': 'true'
          },
          body: JSON.stringify(mockLookupData.MH31AB1234)
        });
      } else if (url.includes('/dashboard/lookup/DL8CAF9012')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'access-control-allow-origin': 'http://127.0.0.1:3000',
            'access-control-allow-credentials': 'true'
          },
          body: JSON.stringify(mockLookupData.DL8CAF9012)
        });
      } else if (url.includes('/v1/status') || url.includes('/status')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'access-control-allow-origin': 'http://127.0.0.1:3000',
            'access-control-allow-credentials': 'true'
          },
          body: JSON.stringify({ status: 'ok', uptime: 99.94, apiCallsToday: 124, quotaLimit: 5000 })
        });
      } else if (url.includes('dbscore.in')) {
        // Intercept any other API requests to avoid CORS / 401 session resets
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'access-control-allow-origin': 'http://127.0.0.1:3000',
            'access-control-allow-credentials': 'true'
          },
          body: JSON.stringify([])
        });
      } else {
        request.continue();
      }
    });

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.toString()));

    // 1. Test Landing Page
    console.log('Navigating to Landing Page...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotDir, '01_landing_page.png') });
    console.log('Saved 01_landing_page.png');

    // 2. Test Login Page
    console.log('Navigating to Login Page...');
    await page.goto('http://127.0.0.1:3000/login', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotDir, '02_login_page.png') });
    console.log('Saved 02_login_page.png');

    // 3. Perform Login
    console.log('Entering login credentials...');
    await page.type('input[placeholder="Email address"]', 'bgil.admin@example.com');
    await page.type('input[placeholder="Password"]', 'somepassword');
    await page.screenshot({ path: path.join(screenshotDir, '03_login_filled.png') });
    
    console.log('Submitting login form...');
    await page.click('button[type="submit"]');
    await wait(2000); // Wait for navigation and state updates

    // 4. Verify Lookup Page
    console.log('Arrived at Dashboard / Lookup page.');
    await page.screenshot({ path: path.join(screenshotDir, '04_lookup_empty.png') });
    console.log('Saved 04_lookup_empty.png');

    // 5. Look up vehicle
    console.log('Testing score lookup for vehicle MH31AB1234...');
    // Type registration number
    await page.type('input[id="reg-number-input"]', 'MH31AB1234');
    await wait(500);
    // Find the fetch button and click it
    await page.click('form.lookup-input-group button.lookup-btn');
    await wait(3000); // Wait for scoring calculation and gauge rendering
    await page.screenshot({ path: path.join(screenshotDir, '05_lookup_result.png') });
    console.log('Saved 05_lookup_result.png');

    // 6. Test Portfolio Analytics Page
    console.log('Navigating to Portfolio page...');
    await page.goto('http://127.0.0.1:3000/portfolio', { waitUntil: 'networkidle2' });
    await wait(2000);
    await page.screenshot({ path: path.join(screenshotDir, '06_portfolio_page.png') });
    console.log('Saved 06_portfolio_page.png');

    console.log('Verification finished successfully.');
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    console.log('Closing browser and server...');
    await browser.close();
    devServer.kill();
  }
}

run();
