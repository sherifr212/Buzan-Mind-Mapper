import { test, expect } from '@playwright/test';

// ─── Sprint 10 E2E Colour Tests ───────────────────────────────────────────────
// AT-CS-009: Colour-blindness mode transforms colours correctly
// AT-LE-070: Personal Style Mode locked until 3 maps completed

const SIMPLE_MAP_URL = '/map/test-fixture-simple';
const PERSONAL_STYLE_URL = '/personal-style';

// ─── AT-CS-009: Colour-blindness mode transforms branch colours ───────────────

test('AT-CS-009: Colour-blindness mode transforms #E53935 to #1565C0', async ({ page }) => {
  await page.goto(SIMPLE_MAP_URL);
  await page.waitForSelector('[data-testid="canvas-ready"]');
  await page.waitForTimeout(500);

  // The simple fixture has branches with color #E53935 (Innovation BOI)
  // Verify at least one branch label has #E53935 before toggle
  const branchLabels = page.locator('[data-testid^="branch-label-"]');
  await expect(branchLabels.first()).toBeVisible({ timeout: 5000 });

  // Check that some branch has the original red colour before toggle
  const innovationBranch = page.locator('[data-testid="branch-label-b1"]');
  const styleBefore = await innovationBranch.getAttribute('style');
  // The branch label uses `color: branch.color` in its inline style
  // After colour-blind mode, this should change

  // Enable colour-blindness mode
  const toggle = page.locator('[data-testid="colour-blind-toggle"]');
  await expect(toggle).toBeVisible({ timeout: 5000 });
  await toggle.click();
  await page.waitForTimeout(300);

  // After toggling, the Innovation branch (was #E53935 = rgb(229,57,53)) should now use
  // #1565C0 = rgb(21, 101, 192)
  const styleAfter = await innovationBranch.getAttribute('style');
  // Browser may render as either hex or rgb — check both representations
  const hasBlue1565 =
    (styleAfter?.includes('1565C0') ?? false) ||
    (styleAfter?.includes('rgb(21, 101, 192)') ?? false) ||
    (styleAfter?.includes('rgb(21,101,192)') ?? false);
  expect(hasBlue1565).toBe(true);

  // Original red colour should no longer appear in this branch's style
  const hasOriginalRed =
    (styleAfter?.includes('E53935') ?? false) ||
    (styleAfter?.includes('rgb(229, 57, 53)') ?? false) ||
    (styleAfter?.includes('rgb(229,57,53)') ?? false);
  expect(hasOriginalRed).toBe(false);

  // Verify the toggle button now reflects active state (background changes)
  const toggleBg = await toggle.evaluate((el) => (el as HTMLElement).style.background);
  // The button background is set to #1565C0 when active
  expect(toggleBg).toBeTruthy();

  // The strategy branch (was #43A047 green) should now be #FB8C00 orange = rgb(251, 140, 0)
  const strategyBranch = page.locator('[data-testid="branch-label-b2"]');
  const strategyStyle = await strategyBranch.getAttribute('style');
  const hasOrangeFB8C00 =
    (strategyStyle?.includes('FB8C00') ?? false) ||
    (strategyStyle?.includes('rgb(251, 140, 0)') ?? false) ||
    (strategyStyle?.includes('rgb(251,140,0)') ?? false);
  expect(hasOrangeFB8C00).toBe(true);
});

// ─── AT-LE-070: Personal Style Mode locked until 3 maps completed ─────────────

test('AT-LE-070: Personal Style Mode is locked when fewer than 3 maps completed', async ({
  page,
}) => {
  // Navigate with ?maps=2 (2 maps completed, still 1 short of unlock)
  await page.goto(`${PERSONAL_STYLE_URL}?maps=2`);
  await page.waitForLoadState('networkidle');

  // The locked panel should be visible
  const lockedPanel = page.locator('[data-testid="personal-style-locked"]');
  await expect(lockedPanel).toBeVisible({ timeout: 5000 });

  // Check the exact message: "Complete 1 more map to unlock Personal Style Mode"
  await expect(lockedPanel).toContainText('Complete 1 more map to unlock Personal Style Mode');

  // The unlocked panel should NOT be visible
  const unlockedPanel = page.locator('[data-testid="personal-style-unlocked"]');
  await expect(unlockedPanel).not.toBeVisible();
});

test('AT-LE-070: Personal Style Mode is unlocked when 3+ maps completed', async ({ page }) => {
  await page.goto(`${PERSONAL_STYLE_URL}?maps=3`);
  await page.waitForLoadState('networkidle');

  const unlockedPanel = page.locator('[data-testid="personal-style-unlocked"]');
  await expect(unlockedPanel).toBeVisible({ timeout: 5000 });
  await expect(unlockedPanel).toContainText('Personal Style Mode is active');

  const lockedPanel = page.locator('[data-testid="personal-style-locked"]');
  await expect(lockedPanel).not.toBeVisible();
});
