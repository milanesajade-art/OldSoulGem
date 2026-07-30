const { test, expect } = require('@playwright/test');

const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+XfXK2wAAAABJRU5ErkJggg==', 'base64');

test.beforeEach(async ({ page }) => {
  await page.route('https://drive.google.com/**', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: transparentPng }));
});

test('homepage primary anchor navigation points to real sections', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  const links = page.locator('.site-header nav a[href^="#"]');
  const count = await links.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    const href = await links.nth(index).getAttribute('href');
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('collection image and Discover link agree on product destination', async ({ page }) => {
  await page.goto('/index.html#collection', { waitUntil: 'domcontentloaded' });
  const cards = page.locator('.collection-grid .piece');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    const card = cards.nth(index);
    const visualHref = await card.locator('.piece-visual').getAttribute('href');
    const discoverHref = await card.locator('.piece-link').getAttribute('href');
    expect(visualHref).toBe(discoverHref);
    expect(visualHref).toMatch(/^product\.html\?id=VIDA%20\d{3}/);
  }
});

test('product return links preserve live and Preview context', async ({ page }) => {
  await page.goto('/product.html?id=VIDA%20004', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'Back to Collection' })).toHaveAttribute('href', 'index.html#collection');

  await page.evaluate(() => localStorage.setItem('vida_creator_preview_v2', JSON.stringify({
    version: 2,
    publishedAt: new Date().toISOString(),
    pieces: [{ id: 'VIDA 004', name: 'Órbita', status: 'Designer Review', visibility: 'public', price: 'Private', materials: '14K gold', story: 'Preview.', image: 'assets/orbit-opal-ring.svg' }],
    site: {}
  })));
  await page.goto('/product.html?id=VIDA%20004&preview=1', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'Back to Collection' })).toHaveAttribute('href', 'index.html?preview=1#collection');
});

test('core customer pages do not create whole-page horizontal overflow on phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/index.html', '/product.html?id=VIDA%20004', '/thanks.html']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
