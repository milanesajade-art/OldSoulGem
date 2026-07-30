const { test, expect } = require('@playwright/test');

test('hidden unfinished drafts do not block publishing unrelated valid changes', async ({ page }) => {
  await page.goto('/creator.html', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Add Piece' }).click();
  await expect(page.locator('#pieceVisibility')).toHaveValue('hidden');
  await expect(page.locator('#pieceStory')).toHaveValue('');
  await expect(page.locator('#validationBox')).toContainText('Hidden draft has no story yet.');

  await page.getByRole('button', { name: 'Review & Publish' }).click();
  await expect(page.locator('#previewState')).not.toHaveText('BLOCKED');
  await expect(page.locator('#publishLive')).toBeEnabled();
});

test('Creator keeps at least one piece in the workspace', async ({ page }) => {
  await page.goto('/creator.html', { waitUntil: 'domcontentloaded' });
  const pieces = page.locator('.creator-piece');
  while (await pieces.count() > 1) {
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Remove Piece' }).click();
  }
  await expect(pieces).toHaveCount(1);
  await page.getByRole('button', { name: 'Remove Piece' }).click();
  await expect(pieces).toHaveCount(1);
  await expect(page.locator('#saveNote')).toContainText('Keep at least one piece');
});
