import { test, expect } from '@playwright/test';

// ─── Sprint 7 E2E Enforcement Tests ───────────────────────────────────────────
// AT-LE-001: New map is blocked without a Central Image
// AT-LE-002: Plain-text central node shows coaching message
// AT-LE-010: Warning when 8+ branches exist with zero inline images
// AT-LE-060a: Multi-word input triggers Clarity Modal
// AT-LE-060b: Split option creates sibling branches for each word
// AT-LE-062: Portrait orientation is blocked
// AT-LE-067: Warning fires on imageless map with 12+ branches

const EMPTY_MAP_URL = '/map/test-fixture-empty';
const SIMPLE_MAP_URL = '/map/test-fixture-simple';
const TEXT_CENTRAL_URL = '/map/test-fixture-text-central';
const MANY_BRANCHES_URL = '/map/test-fixture-many-branches';
const NEW_MAP_URL = '/map/new';

async function openMap(page: import('@playwright/test').Page, url: string) {
  await page.goto(url);
  await page.waitForSelector('[data-testid="canvas-ready"]');
  await page.waitForTimeout(800);
}

async function getBranchCount(page: import('@playwright/test').Page): Promise<number> {
  const text = await page.locator('[data-testid="branch-count"]').textContent();
  const match = text?.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/** Click a branch by label text, wait for selectedBranchId to populate. */
async function selectBranchByLabel(page: import('@playwright/test').Page, label: string) {
  const node = page
    .locator('[data-testid^="branch-label-"]')
    .filter({ hasText: new RegExp(label, 'i') })
    .first();
  await node.click({ force: true });
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="selected-branch-id"]');
      return !!(el && el.textContent && el.textContent.trim().length > 0);
    },
    { timeout: 5000 }
  );
  await page.waitForTimeout(200);
}

// ─── AT-LE-001: Branch creation blocked without Central Image ─────────────────

test('AT-LE-001: Branch creation blocked without a Central Image', async ({ page }) => {
  await openMap(page, NEW_MAP_URL);

  // Verify no branches yet
  const before = await getBranchCount(page);
  expect(before).toBe(0);

  // Try adding a branch via the "Add Branch" button
  await page.click('[data-testid="add-branch"]');
  await page.waitForTimeout(300);

  // BlockModal should appear
  const modal = page.locator('[data-testid="block-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  // Message contains the required text
  const message = page.locator('[data-testid="block-modal-message"]');
  await expect(message).toContainText('Every Mind Map begins with a Central Image');

  // Help link must be present
  const helpLink = page.locator('[data-testid="block-modal-help-link"]');
  await expect(helpLink).toBeVisible();
  await expect(helpLink).toContainText('Why a Central Image?');

  // Branch count unchanged — creation was blocked
  const after = await getBranchCount(page);
  expect(after).toBe(before);

  // Dismiss and verify no branch was added
  await page.click('[data-testid="block-modal-dismiss"]');
  await page.waitForTimeout(200);
  await expect(modal).not.toBeVisible();

  const final = await getBranchCount(page);
  expect(final).toBe(0);
});

test('AT-LE-001b: Add branch button is visually disabled when no Central Image', async ({ page }) => {
  await openMap(page, EMPTY_MAP_URL);

  const addBtn = page.locator('[data-testid="add-branch"]');
  // Button should exist but show disabled state (opacity/disabled attribute)
  await expect(addBtn).toBeVisible();
  const opacity = await addBtn.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
  expect(opacity).toBeLessThan(1);
});

// ─── AT-LE-002: Plain-text central node shows coaching message ────────────────

test('AT-LE-002: Text-image central node shows coaching message', async ({ page }) => {
  await openMap(page, TEXT_CENTRAL_URL);

  // Coaching message should be visible
  const coaching = page.locator('[data-testid="text-image-coaching"]');
  await expect(coaching).toBeVisible({ timeout: 5000 });

  const msg = page.locator('[data-testid="text-image-coaching-message"]');
  await expect(msg).toContainText('Buzan recommends always using an image at the centre');

  // "Draw an image instead" button must be visible
  const drawBtn = page.locator('[data-testid="draw-image-btn"]');
  await expect(drawBtn).toBeVisible();
  await expect(drawBtn).toContainText('Draw an image instead');
});

// ─── AT-LE-010: Warning when 8+ branches with zero inline images ──────────────

test('AT-LE-010: Warning fires when 9th branch is added and no images exist', async ({ page }) => {
  // fixture-many-branches has 8 branches, no images
  await openMap(page, MANY_BRANCHES_URL);

  const before = await getBranchCount(page);
  expect(before).toBe(8);

  // Add one more branch via the toolbar button
  await page.click('[data-testid="add-blank-line-btn"]', { force: true });

  // Wait for branch count to update
  await page.waitForFunction(
    (expectedCount) => {
      const el = document.querySelector('[data-testid="branch-count"]');
      if (!el) return false;
      const match = el.textContent?.match(/\d+/);
      return match ? parseInt(match[0], 10) >= expectedCount : false;
    },
    9,
    { timeout: 5000 }
  );

  const after = await getBranchCount(page);
  expect(after).toBe(9);

  // WARN toast for LE-010 should appear
  const warnContainer = page.locator('[data-testid="warn-toast-container"]');
  await expect(warnContainer).toBeVisible({ timeout: 5000 });

  const warnMsg = page.locator('[data-testid="warn-toast-message-LE-010"]');
  await expect(warnMsg).toBeVisible({ timeout: 5000 });
  await expect(warnMsg).toContainText('Buzan strongly recommends placing images on branches');

  // Toast includes a link to image insertion tool
  const learnLink = page.locator('[data-testid="warn-toast-learn-LE-010"]');
  await expect(learnLink).toBeVisible();

  // Toast is dismissable
  const dismissBtn = page.locator('[data-testid="warn-toast-dismiss-LE-010"]');
  await dismissBtn.click();
  await page.waitForTimeout(300);
  await expect(warnMsg).not.toBeVisible();
});

// ─── AT-LE-060a: Multi-word input triggers Clarity Modal ─────────────────────

test('AT-LE-060a: Multi-word keyword triggers Clarity Modal', async ({ page }) => {
  await openMap(page, SIMPLE_MAP_URL);
  await page.waitForSelector('[data-testid^="branch-label-"]', { timeout: 10000 });

  // Select a branch then Tab to add a child (puts it in edit mode — mirrors Sprint 6 pattern)
  await selectBranchByLabel(page, 'INNOVATION');
  await page.keyboard.press('Tab');

  // Wait for the edit input to appear on the new branch
  const input = page.locator('[data-testid^="branch-input-"]').first();
  await expect(input).toBeVisible({ timeout: 5000 });

  // Type a multi-word keyword and commit
  await input.fill('good morning');
  await input.press('Enter');
  await page.waitForTimeout(400);

  // Clarity Modal should appear
  const modal = page.locator('[data-testid="clarity-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  const title = page.locator('[data-testid="clarity-modal-title"]');
  await expect(title).toContainText("Buzan's Law: One keyword per branch");

  await expect(modal).toContainText('Each word has thousands of possible associations');

  const splitBtn = page.locator('[data-testid="clarity-split-btn"]');
  const keepBtn = page.locator('[data-testid="clarity-keep-btn"]');
  await expect(splitBtn).toBeVisible();
  await expect(keepBtn).toBeVisible();
  await expect(splitBtn).toContainText('Split into multiple branches');
  await expect(keepBtn).toContainText('Keep as one word');
});

// ─── AT-LE-060b: Split option creates sibling branches for each word ──────────

test('AT-LE-060b: Split option creates sibling branches for each word', async ({ page }) => {
  await openMap(page, SIMPLE_MAP_URL);
  await page.waitForSelector('[data-testid^="branch-label-"]', { timeout: 10000 });

  // Select a branch, Tab to add child (edit mode)
  await selectBranchByLabel(page, 'INNOVATION');
  await page.keyboard.press('Tab');

  const input = page.locator('[data-testid^="branch-input-"]').first();
  await expect(input).toBeVisible({ timeout: 5000 });

  // Record branch count AFTER adding the child (before split)
  const beforeSplit = await getBranchCount(page);

  // Type multi-word keyword and commit
  await input.fill('good morning');
  await input.press('Enter');
  await page.waitForTimeout(400);

  const modal = page.locator('[data-testid="clarity-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  // Click Split
  await page.click('[data-testid="clarity-split-btn"]');
  await page.waitForTimeout(500);

  await expect(modal).not.toBeVisible();

  // Split creates 1 additional branch (original → 'good', new sibling → 'morning')
  // beforeSplit included the new child with 'New', after split same count + 1
  const afterSplit = await getBranchCount(page);
  expect(afterSplit).toBe(beforeSplit + 1);

  // Both keywords visible on canvas
  const goodBranch = page
    .locator('[data-testid^="branch-label-"]')
    .filter({ hasText: /^good$/i });
  const morningBranch = page
    .locator('[data-testid^="branch-label-"]')
    .filter({ hasText: /^morning$/i });
  await expect(goodBranch).toHaveCount(1, { timeout: 5000 });
  await expect(morningBranch).toHaveCount(1, { timeout: 5000 });
});

// ─── AT-LE-062: Portrait orientation is blocked ───────────────────────────────

test('AT-LE-062: Portrait orientation is blocked', async ({ page }) => {
  await openMap(page, SIMPLE_MAP_URL);

  // Canvas orientation should start as LANDSCAPE
  const orientationDisplay = page.locator('[data-testid="orientation-display"]');
  await expect(orientationDisplay).toHaveText('LANDSCAPE');

  // Click the Portrait orientation button
  await page.click('[data-testid="orientation-portrait-btn"]');
  await page.waitForTimeout(300);

  // BlockModal should appear
  const modal = page.locator('[data-testid="block-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  const message = page.locator('[data-testid="block-modal-message"]');
  await expect(message).toContainText('Buzan recommends the horizontal (landscape) orientation');

  // Canvas should remain in LANDSCAPE
  await expect(orientationDisplay).toHaveText('LANDSCAPE');

  // Dismiss
  await page.click('[data-testid="block-modal-dismiss"]');
  await page.waitForTimeout(200);
  await expect(modal).not.toBeVisible();

  // Still LANDSCAPE
  await expect(orientationDisplay).toHaveText('LANDSCAPE');
});

// ─── AT-LE-067: Warning fires on imageless map with 12+ branches ──────────────

test('AT-LE-067: Warning fires when 13th branch is added and no images exist', async ({ page }) => {
  test.setTimeout(90_000);

  // Start with the 8-branch fixture
  await openMap(page, MANY_BRANCHES_URL);

  // Add 5 more branches via toolbar to reach 13
  for (let i = 0; i < 5; i++) {
    await page.click('[data-testid="add-blank-line-btn"]', { force: true });
    await page.waitForTimeout(200);
  }

  // Wait for count to reach at least 12
  await page.waitForFunction(
    (expectedMin) => {
      const el = document.querySelector('[data-testid="branch-count"]');
      if (!el) return false;
      const match = el.textContent?.match(/\d+/);
      return match ? parseInt(match[0], 10) >= expectedMin : false;
    },
    12,
    { timeout: 10000 }
  );

  const count = await getBranchCount(page);
  expect(count).toBeGreaterThanOrEqual(12);

  // WARN toast for LE-067 should eventually appear
  // (fires specifically at 12+ branches with no images)
  const warnMsg = page.locator('[data-testid="warn-toast-message-LE-067"]');
  await expect(warnMsg).toBeVisible({ timeout: 10000 });
  await expect(warnMsg).toContainText('Clarity and visual richness are Buzan laws');

  // Toast includes link to image insertion tool
  const learnLink = page.locator('[data-testid="warn-toast-learn-LE-067"]');
  await expect(learnLink).toBeVisible();
});
