const { test, expect } = require('@playwright/test');

const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+XfXK2wAAAABJRU5ErkJggg==', 'base64');

async function stabilizeImages(page) {
  await page.route('https://drive.google.com/**', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: transparentPng }));
}

test.beforeEach(async ({ page }) => {
  await stabilizeImages(page);
});

test('customer storefront translates internal Designer Review status', async ({ page }) => {
  await page.goto('/index.html#collection', { waitUntil: 'domcontentloaded' });
  const orbita = page.locator('.piece[data-piece-id="VIDA 004"]');
  await expect(orbita).toContainText('PRIVATE PREVIEW');
  await expect(orbita).not.toContainText('DESIGNER REVIEW');
});

test('product availability is not populated with the price', async ({ page }) => {
  await page.goto('/product.html?id=VIDA%20001', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#genericPrice')).toHaveText('$5,000');
  await expect(page.locator('#genericStatus')).toHaveText('One of One');
  await expect(page.locator('#genericAvailability')).toHaveText('Private inquiry');

  await page.goto('/product.html?id=VIDA%20004', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#genericStatus')).toHaveText('Private Preview');
  await expect(page.locator('#genericAvailability')).toHaveText('Private preview');
});

test('Creator removal requires confirmation and cancel preserves the piece', async ({ page }) => {
  await page.goto('/creator.html', { waitUntil: 'domcontentloaded' });
  const pieces = page.locator('.creator-piece');
  const before = await pieces.count();
  expect(before).toBeGreaterThan(1);

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Remove Piece' }).click();
  await expect(pieces).toHaveCount(before);

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Remove Piece' }).click();
  await expect(pieces).toHaveCount(before - 1);
});

test('Creator reset requires confirmation', async ({ page }) => {
  await page.goto('/creator.html', { waitUntil: 'domcontentloaded' });
  const name = page.locator('#pieceName');
  const original = await name.inputValue();
  await name.fill('Temporary Audit Name');
  await name.dispatchEvent('input');

  await page.getByRole('button', { name: 'Review & Publish' }).click();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Reset to Live Baseline' }).click();
  await page.getByRole('button', { name: 'Collection' }).click();
  await expect(name).toHaveValue('Temporary Audit Name');

  await page.getByRole('button', { name: 'Review & Publish' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset to Live Baseline' }).click();
  await page.getByRole('button', { name: 'Collection' }).click();
  await expect(name).toHaveValue(original);
});

test('Creator image source selection cannot silently conflict', async ({ page }) => {
  await page.goto('/creator.html', { waitUntil: 'domcontentloaded' });
  const library = page.locator('#pieceImage');
  const custom = page.locator('#pieceImageUrl');

  await custom.fill('https://example.com/custom-ring.jpg');
  await custom.dispatchEvent('input');
  await expect(library).toHaveValue('');

  await library.selectOption({ label: 'Flor de Vida • clean primary' });
  await expect(custom).toHaveValue('');
});

test('standalone Preview dock stays inside Preview mode', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'standalone', { configurable: true, value: true });
    localStorage.setItem('vida_creator_preview_v2', JSON.stringify({
      version: 2,
      publishedAt: new Date().toISOString(),
      pieces: [{ id: 'VIDA 999', name: 'Preview Piece', status: 'Private', visibility: 'public', price: 'Private', materials: '14K gold', story: 'Preview.', image: 'assets/orbit-opal-ring.svg' }],
      site: { heroTitle: 'Preview Home' }
    }));
  });
  await page.goto('/index.html?preview=1', { waitUntil: 'domcontentloaded' });
  const dock = page.locator('.pwa-dock');
  await expect(dock).toBeVisible();
  await expect(dock.getByRole('link', { name: 'Home' })).toHaveAttribute('href', 'index.html?preview=1');
  await expect(dock.getByRole('link', { name: 'Collection' })).toHaveAttribute('href', 'index.html?preview=1#collection');
  await expect(dock.getByRole('link', { name: 'Private Inquiry' })).toHaveAttribute('href', 'index.html?preview=1#inquire');
});

test('draft product Preview cannot expose native Share Piece action', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: async () => {} });
    localStorage.setItem('vida_creator_preview_v2', JSON.stringify({
      version: 2,
      publishedAt: new Date().toISOString(),
      pieces: [{ id: 'VIDA 999', name: 'Unreleased Preview', status: 'Private', visibility: 'public', price: 'Private', materials: '14K gold', story: 'Draft only.', image: 'assets/orbit-opal-ring.svg' }],
      site: {}
    }));
  });
  await page.goto('/product.html?id=VIDA%20999&preview=1', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: 'Share Piece' })).toHaveCount(0);
});
