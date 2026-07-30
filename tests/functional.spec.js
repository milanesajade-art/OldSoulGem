const { test, expect } = require('@playwright/test');

const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+XfXK2wAAAABJRU5ErkJggg==', 'base64');

async function stabilizeImages(page) {
  await page.route('https://drive.google.com/**', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: transparentPng }));
}

async function setPreview(page, payload) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate((data) => localStorage.setItem('vida_creator_preview_v2', JSON.stringify(data)), payload);
}

test.beforeEach(async ({ page }) => {
  await stabilizeImages(page);
});

test('normal storefront ignores saved Creator preview state', async ({ page }) => {
  await setPreview(page, {
    version: 2,
    publishedAt: new Date().toISOString(),
    pieces: [{ id: 'VIDA 999', name: 'PREVIEW ONLY', status: 'Private', visibility: 'public', price: 'Private', materials: '14K gold', story: 'Preview state.', image: 'assets/orbit-opal-ring.svg' }],
    site: { heroTitle: 'PREVIEW ONLY TITLE' }
  });

  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hero-copy h1')).toHaveText('Made to be remembered.');
  await expect(page.locator('.creator-preview-bar')).toHaveCount(0);
  await expect(page.getByText('PREVIEW ONLY', { exact: true })).toHaveCount(0);
});

test('explicit Preview URL uses saved Creator preview state', async ({ page }) => {
  await setPreview(page, {
    version: 2,
    publishedAt: new Date().toISOString(),
    pieces: [{ id: 'VIDA 999', name: 'PREVIEW ONLY', status: 'Private', visibility: 'public', price: 'Private', materials: '14K gold', story: 'Preview state.', image: 'assets/orbit-opal-ring.svg' }],
    site: { heroTitle: 'PREVIEW ONLY TITLE' }
  });

  await page.goto('/index.html?preview=1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hero-copy h1')).toHaveText('PREVIEW ONLY TITLE');
  await expect(page.locator('.creator-preview-bar')).toBeVisible();
  await expect(page.getByText('PREVIEW ONLY', { exact: true }).first()).toBeVisible();
});

test('general inquiry requires an intentional interest selection', async ({ page }) => {
  await page.goto('/index.html#inquire', { waitUntil: 'domcontentloaded' });
  const select = page.locator('#interestSelect');
  expect(await select.evaluate((el) => el.required)).toBe(true);
  await expect(select).toHaveValue('');
  await expect(select.locator('option').first()).toHaveText('Choose an option');
});

test('product inquiry preserves exact product context', async ({ page }) => {
  await page.goto('/product.html?id=VIDA%20004', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#genericName')).toHaveText('Órbita');
  await page.locator('#productInquiry').click();
  await expect(page).toHaveURL(/index\.html\?interest=%C3%93rbita#inquire$/);
  await expect(page.locator('#interestSelect')).toHaveValue('Órbita');
});

test('hidden product links fail safely', async ({ page }) => {
  await page.goto('/product.html?id=VIDA%20006', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Piece unavailable' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to Collection' })).toHaveAttribute('href', 'index.html#collection');
});

test('known production gallery renders and mismatched preview gallery is suppressed', async ({ page }) => {
  await page.goto('/product.html?id=VIDA%20004', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.product-gallery-button')).toHaveCount(3);

  await setPreview(page, {
    version: 2,
    publishedAt: new Date().toISOString(),
    pieces: [{ id: 'VIDA 004', name: 'Órbita', status: 'Designer Review', visibility: 'public', price: 'Private', materials: '14K yellow gold', story: 'Changed visual.', image: 'assets/orbit-opal-ring.svg' }],
    site: {}
  });
  await page.goto('/product.html?id=VIDA%20004&preview=1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.product-gallery-button')).toHaveCount(0);
});

test('homepage hero follows visible collection state in Preview mode', async ({ page }) => {
  await setPreview(page, {
    version: 2,
    publishedAt: new Date().toISOString(),
    pieces: [
      { id: 'VIDA 001', name: 'Flor de Vida', status: 'One of One', visibility: 'public', price: '$5,000', materials: '14K yellow gold • opal', story: 'Anchor.', image: 'assets/floral-opal-ring.svg' },
      { id: 'VIDA 004', name: 'Órbita', status: 'Designer Review', visibility: 'hidden', price: 'Private', materials: '14K yellow gold', story: 'Hidden.', image: 'assets/orbit-opal-ring.svg' }
    ],
    site: {}
  });
  await page.goto('/index.html?preview=1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hero-art .art-caption strong')).toHaveText('Flor de Vida');
  await expect(page.locator('.hero-art img')).toHaveAttribute('src', 'assets/floral-opal-ring.svg');
});

test('Creator blocks stale workspaces from publishing', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('vida_creator_workspace_v2', JSON.stringify({
      baselineFingerprint: 'old-build',
      pieces: [{ id: 'VIDA 001', name: 'Flor de Vida', status: 'One of One', visibility: 'public', price: '$5,000', materials: '14K yellow gold • opal', story: 'Anchor.', image: 'assets/floral-opal-ring.svg' }],
      site: {}
    }));
  });
  await page.goto('/creator.html#review', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#previewState')).toHaveText('STALE');
  await expect(page.locator('#publishLive')).toBeDisabled();
});

test('Creator blocks incomplete public pieces from publishing', async ({ page }) => {
  await page.goto('/creator.html', { waitUntil: 'domcontentloaded' });
  await page.locator('#pieceStory').fill('');
  await page.locator('#pieceStory').dispatchEvent('input');
  await page.locator('button[data-view="review"]').click();
  await expect(page.locator('#previewState')).toHaveText('BLOCKED');
  await expect(page.locator('#publishLive')).toBeDisabled();
  await expect(page.locator('#previewSummary')).toContainText('required publish');
});
