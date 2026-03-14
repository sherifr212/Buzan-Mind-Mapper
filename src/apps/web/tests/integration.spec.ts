import { test, expect } from '@playwright/test';

const SIMPLE_MAP_URL = '/map/test-fixture-simple';

async function openMap(page: import('@playwright/test').Page, url: string) {
  await page.goto(url);
  await page.waitForSelector('[data-testid="canvas-ready"]');
  await page.waitForTimeout(500);
}

// AT-NF-004: Map is fully editable offline
test('AT-NF-004: Map is editable offline and edits persist in local store', async ({ page, context }) => {
  await openMap(page, SIMPLE_MAP_URL);

  // Get initial branch count
  const countEl = page.locator('[data-testid="branch-count"]');
  const beforeText = await countEl.textContent();
  const before = parseInt(beforeText?.match(/\d+/)?.[0] ?? '0', 10);

  // Go offline
  await context.setOffline(true);
  await page.waitForTimeout(200);

  // Offline indicator should appear
  const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
  await expect(offlineIndicator).toBeVisible({ timeout: 3000 });

  // Select a branch and add children (offline)
  await page.locator('[data-testid="branch-label-b1"]').click({ force: true });
  await page.waitForTimeout(200);

  // Add 3 branches using the toolbar
  await page.locator('[data-testid="add-branch"]').click();
  await page.waitForTimeout(200);
  await page.locator('[data-testid="add-branch"]').click();
  await page.waitForTimeout(200);
  await page.locator('[data-testid="add-branch"]').click();
  await page.waitForTimeout(300);

  // Branches should be added to local state (even offline)
  const afterText = await countEl.textContent();
  const after = parseInt(afterText?.match(/\d+/)?.[0] ?? '0', 10);
  expect(after).toBeGreaterThan(before);

  // Save offline
  const saveBtn = page.locator('[data-testid="save-map-btn"]');
  await saveBtn.click();
  await page.waitForTimeout(200);
  // Dismiss reflection
  const dismissBtn = page.locator('[data-testid="reflection-dismiss"]');
  if (await dismissBtn.isVisible()) await dismissBtn.click();

  // Re-enable network
  await context.setOffline(false);
  await page.waitForTimeout(500);

  // Offline indicator should disappear
  await expect(offlineIndicator).not.toBeVisible({ timeout: 3000 });

  // Branch count should still show our edits (not lost on reconnect)
  const finalText = await countEl.textContent();
  const final = parseInt(finalText?.match(/\d+/)?.[0] ?? '0', 10);
  expect(final).toBeGreaterThanOrEqual(after);
});

// AT-NF-020: No plain HTTP requests to non-localhost origins
test('AT-NF-020: App makes no plain HTTP requests to external origins', async ({ page }) => {
  const httpViolations: string[] = [];

  page.on('request', (request) => {
    const url = request.url();
    if (url.startsWith('http://') && !url.startsWith('http://localhost')) {
      httpViolations.push(url);
    }
  });

  await page.goto('/');
  await page.waitForTimeout(1000);

  // No external plain HTTP requests
  expect(httpViolations).toHaveLength(0);
});
