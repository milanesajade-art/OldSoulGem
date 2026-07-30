const { test, expect } = require('@playwright/test');

test('homepage hero fallback remains the same featured piece', async ({ page }) => {
  await page.route('https://example.com/**', (route) => route.abort());
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('vida_creator_preview_v2', JSON.stringify({
    version: 2,
    publishedAt: new Date().toISOString(),
    pieces: [{
      id: 'VIDA 001',
      name: 'Flor de Vida',
      status: 'One of One',
      visibility: 'public',
      price: '$5,000',
      materials: '14K yellow gold • opal',
      story: 'Anchor.',
      image: 'https://example.com/missing-flor.jpg'
    }],
    site: {}
  })));
  await page.goto('/index.html?preview=1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hero-art .art-caption strong')).toHaveText('Flor de Vida');
  await expect(page.locator('.hero-art img')).toHaveAttribute('src', 'assets/floral-opal-ring.svg');
});
