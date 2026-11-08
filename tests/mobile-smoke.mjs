#!/usr/bin/env node
/**
 * Phone smoke test.
 *
 * Builds nothing itself — `npm run test:mobile` builds first — then serves `dist`
 * with `vite preview` and drives it as an iPhone 13 with touch enabled.
 *
 *   npm run test:mobile                 build, serve, test, shut down
 *   node tests/mobile-smoke.mjs         serve `dist`, test, shut down
 *   SMOKE_URL=http://localhost:5173 node tests/mobile-smoke.mjs   reuse a running server
 *   SMOKE_SHOTS=1 npm run test:mobile   also write screenshots to .smoke-shots/
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, devices } from 'playwright';

const PORT = Number(process.env.SMOKE_PORT ?? 4173);
const BASE = process.env.SMOKE_URL ?? `http://127.0.0.1:${PORT}/`;
const SHOTS = process.env.SMOKE_SHOTS === '1' ? '.smoke-shots' : null;
const HOST = '127.0.0.1';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let failures = 0;
let checks = 0;
const check = (name, ok, extra = '') => {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  ${extra}` : ''}`);
};

const shot = async (page, name) => {
  if (!SHOTS) return;
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: join(SHOTS, `${name}.png`) });
};

const waitForServer = async () => {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await sleep(250);
  }
  throw new Error(`Preview server never answered on ${BASE}`);
};

const startServer = async () => {
  if (process.env.SMOKE_URL) return null;

  const viteBin = join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
  const server = spawn(
    process.execPath,
    [viteBin, 'preview', '--port', String(PORT), '--strictPort', '--host', HOST],
    { stdio: 'ignore' }
  );

  try {
    await waitForServer();
  } catch (error) {
    server.kill('SIGTERM');
    throw error;
  }

  return server;
};

const launchBrowser = async () => {
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    try {
      return await chromium.launch();
    } catch {
      throw new Error(
        'No browser available. Install Chrome, or run: npx playwright install chromium'
      );
    }
  }
};

const openSession = async (browser, options) => {
  const context = await browser.newContext(options);
  await context.addInitScript(() => {
    localStorage.setItem('session-authenticated', 'true');
    localStorage.setItem('current-user', 'Owner');
  });
  return context;
};

const swipeDown = async (context, page, box) => {
  const cdp = await context.newCDPSession(page);
  const x = Math.round(box.x + box.width / 2);
  const startY = Math.round(box.y + 14);

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: startY }] });
  for (let step = 1; step <= 12; step += 1) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: startY + step * 20 }],
    });
    await page.waitForTimeout(12);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(450);
};

const run = async (browser) => {
  const errors = [];
  const context = await openSession(browser, { ...devices['iPhone 13'], locale: 'en-US' });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(String(error)));

  const overflow = () =>
    page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));

  await page.goto(BASE, { waitUntil: 'networkidle' });

  check('phone viewport is 390px', page.viewportSize().width === 390, `${page.viewportSize().width}px`);
  check('shell: bottom tab bar visible', await page.getByRole('navigation', { name: 'Primary' }).isVisible());
  check('shell: desktop sidebar hidden', !(await page.locator('aside').first().isVisible()));
  check(
    'shell: breadcrumb not duplicated',
    !(await page.locator('header').getByText('The Arbiter', { exact: true }).first().isVisible())
  );
  check('shell: no horizontal overflow', (await overflow()) <= 1, `${await overflow()}px`);
  await shot(page, '01-shell');

  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  const sheet = page.getByRole('dialog', { name: 'Navigation' });

  await menu.tap();
  await sheet.waitFor({ state: 'visible' });
  check('sheet: opens on tap', await sheet.isVisible());
  check('sheet: admin sections reachable', await sheet.getByRole('button', { name: 'Game tuner' }).isVisible());
  await shot(page, '02-sheet');

  const sheetBox = await sheet.boundingBox();
  if (!sheetBox) throw new Error('Sheet has no bounding box');
  await swipeDown(context, page, sheetBox);
  check('sheet: swipe down dismisses', !(await sheet.isVisible()));

  await menu.tap();
  await sheet.waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Close navigation menu' }).tap({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(300);
  check('sheet: backdrop closes', !(await sheet.isVisible()));

  const goTo = async (name, heading, slug) => {
    await menu.tap();
    await sheet.waitFor({ state: 'visible' });
    await sheet.getByRole('button', { name, exact: true }).tap();
    await page.waitForTimeout(320);
    const visible = await page.getByRole('heading', { name: heading }).isVisible();
    const of = await overflow();
    check(`${name}: phone layout`, visible && of <= 1, `overflow ${of}px`);
    await shot(page, slug);
  };

  await goTo('Probabilities', 'Probability configuration', '03-probabilities');
  await goTo('Users', 'Users', '04-users');

  const accountCards = page.locator('main button[aria-pressed]');
  const accountCount = await accountCards.count();
  let accountsInside = true;
  for (let i = 0; i < accountCount; i += 1) {
    const box = await accountCards.nth(i).boundingBox();
    if (!box || box.x < 0 || box.x + box.width > 391) accountsInside = false;
  }
  check('users: all three accounts fit the viewport', accountCount === 3 && accountsInside, `${accountCount} cards`);

  await goTo('Game tuner', 'Game tuner', '05-game-tuner');
  await goTo('System control', 'System control', '06-system');

  await page.getByLabel('Broadcast message').fill('Deploy at dawn');
  await page.getByRole('button', { name: 'Update broadcast' }).tap();
  await page.waitForTimeout(500);

  const toastBox = await page.getByText('Global broadcast sent.').boundingBox();
  const navBox = await page.getByRole('navigation', { name: 'Primary' }).boundingBox();
  check(
    'system: toast clears the tab bar',
    Boolean(toastBox && navBox) && toastBox.y + toastBox.height <= navBox.y + 1,
    toastBox && navBox ? `${Math.round(toastBox.y + toastBox.height)} <= ${Math.round(navBox.y)}` : ''
  );

  await page.getByText('Audit log', { exact: true }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  check('audit: entry appears without reload', await page.getByText('Updated broadcast', { exact: true }).isVisible());
  await shot(page, '07-audit-log');

  check('no runtime page errors', errors.length === 0, errors.join(' | ').slice(0, 160));

  const desktopContext = await openSession(browser, { viewport: { width: 1280, height: 900 } });
  const desktop = await desktopContext.newPage();
  await desktop.goto(BASE, { waitUntil: 'networkidle' });
  check('desktop: sidebar visible', await desktop.locator('aside').first().isVisible());
  check('desktop: tab bar hidden', !(await desktop.getByRole('navigation', { name: 'Primary' }).isVisible()));
  await shot(desktop, '08-desktop');
};

let server = null;
let browser = null;

try {
  server = await startServer();
  browser = await launchBrowser();
  await run(browser);
} catch (error) {
  failures += 1;
  console.error(`\nERROR  ${error instanceof Error ? error.message : String(error)}`);
} finally {
  if (browser) await browser.close().catch(() => {});
  if (server) server.kill('SIGTERM');
}

console.log(
  failures === 0
    ? `\nMOBILE SMOKE PASSED (${checks} checks)`
    : `\nMOBILE SMOKE FAILED (${failures} of ${checks} checks)`
);
process.exitCode = failures === 0 ? 0 : 1;
