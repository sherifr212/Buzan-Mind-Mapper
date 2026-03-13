import { test, expect } from '@playwright/test';

// Sprint 12 E2E Tests
// AT-ED-020: 'I'm Stuck' button is always visible
// AT-ED-021: Mental Block Panel offers four options
// AT-ED-022: Mini Mind Map burst creates 10-branch association cloud
// AT-LE-050: Arrow tool is accessible from the main toolbar
// AT-LE-053: Code Library panel is accessible and codes are reusable
// AT-LE-054: Hovering a code highlights all branches sharing that code

const SIMPLE_MAP_URL = '/map/test-fixture-simple';

async function openMap(page: import('@playwright/test').Page, url: string) {
  await page.goto(url);
  await page.waitForSelector('[data-testid="canvas-ready"]');
  await page.waitForTimeout(500);
}

// ─── AT-ED-020 ────────────────────────────────────────────────────────────────

test("AT-ED-020: I'm Stuck button is always visible", async ({ page }) => {
  await openMap(page, SIMPLE_MAP_URL);
  const btn = page.locator('[data-testid="stuck-btn"]');
  await expect(btn).toBeVisible({ timeout: 5000 });
  await btn.click();
  await expect(page.locator('[data-testid="mental-block-panel"]')).toBeVisible({ timeout: 1000 });
});

// ─── AT-ED-021 ────────────────────────────────────────────────────────────────

test('AT-ED-021: Mental Block Panel offers four options', async ({ page }) => {
  await openMap(page, SIMPLE_MAP_URL);
  await page.locator('[data-testid="stuck-btn"]').click();
  const panel = page.locator('[data-testid="mental-block-panel"]');
  await expect(panel).toBeVisible({ timeout: 3000 });
  await expect(page.locator('[data-testid="mb-add-blank-lines"]')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('[data-testid="mb-show-boi"]')).toBeVisible();
  await expect(page.locator('[data-testid="mb-random-image"]')).toBeVisible();
  await expect(page.locator('[data-testid="mb-pivot-branch"]')).toBeVisible();
  const text = await panel.textContent();
  expect(text).toContain('blank lines');
  expect(text).toContain('BOI');
  expect(text).toContain('random');
  expect(text).toContain('Pivot');
});

// ─── AT-ED-022 ────────────────────────────────────────────────────────────────

test('AT-ED-022: Mini Mind Map burst creates 10-branch association cloud', async ({ page }) => {
  await openMap(page, SIMPLE_MAP_URL);

  // Select branch b1
  await page.locator('[data-testid="branch-label-b1"]').click({ force: true });
  await page.waitForTimeout(200);

  // Open mental block panel and pivot
  await page.locator('[data-testid="stuck-btn"]').click();
  await page.waitForTimeout(200);
  await page.locator('[data-testid="mb-pivot-branch"]').click();
  await page.waitForTimeout(300);

  // Mini burst modal appears
  const modal = page.locator('[data-testid="mini-burst-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  // Should have 10 text inputs
  const inputs = modal.locator('input[type="text"]');
  await expect(inputs).toHaveCount(10);

  // Type an association and import it
  await inputs.nth(0).fill('Alpha');
  await page.waitForTimeout(100);

  const countEl = page.locator('[data-testid="branch-count"]');
  const before = parseInt((await countEl.textContent())?.match(/\d+/)?.[0] ?? '0', 10);

  const importBtn = page.locator('[data-testid="burst-import-0"]');
  await expect(importBtn).toBeVisible({ timeout: 3000 });
  await importBtn.click();
  await page.waitForTimeout(400);

  const after = parseInt((await countEl.textContent())?.match(/\d+/)?.[0] ?? '0', 10);
  expect(after).toBeGreaterThan(before);
});

// ─── AT-LE-050 ────────────────────────────────────────────────────────────────

test('AT-LE-050: Arrow tool is accessible from main toolbar', async ({ page }) => {
  await openMap(page, SIMPLE_MAP_URL);

  const arrowBtn = page.locator('[data-testid="draw-arrow-tool"]');
  await expect(arrowBtn).toBeVisible({ timeout: 5000 });

  // Activate arrow mode
  await arrowBtn.click();
  await expect(arrowBtn).toHaveAttribute('aria-pressed', 'true');

  // Deactivate
  await arrowBtn.click();
  await expect(arrowBtn).toHaveAttribute('aria-pressed', 'false');
});

// ─── AT-LE-053 ────────────────────────────────────────────────────────────────

test('AT-LE-053: Code Library panel is accessible and codes are reusable', async ({ page }) => {
  await openMap(page, SIMPLE_MAP_URL);

  // Open code library
  const codeLibBtn = page.locator('[data-testid="code-library-btn"]');
  await expect(codeLibBtn).toBeVisible({ timeout: 5000 });
  await codeLibBtn.click();

  const panel = page.locator('[data-testid="code-library-panel"]');
  await expect(panel).toBeVisible({ timeout: 3000 });

  // Create code 'Action' with star symbol
  await page.locator('[data-testid="code-name-input"]').fill('Action');
  await page.locator('[data-testid="code-symbol-input"]').fill('★');
  // Set color (using JS to change value since color inputs need special handling)
  await page.locator('[data-testid="code-color-input"]').evaluate((el: HTMLInputElement) => {
    el.value = '#E53935';
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('[data-testid="add-code-btn"]').click();
  await page.waitForTimeout(200);

  // Code appears in library
  const codeEntry = page.locator('[data-testid="code-entry-Action"]');
  await expect(codeEntry).toBeVisible({ timeout: 3000 });

  // Select b1 branch (click without closing panel - panel is fixed position)
  await page.locator('[data-testid="branch-label-b1"]').click({ force: true });
  await page.waitForTimeout(200);

  // Apply code
  const applyBtn = page.locator('[data-testid="apply-code-Action"]');
  await expect(applyBtn).toBeVisible({ timeout: 3000 });
  await applyBtn.click();
  await page.waitForTimeout(200);

  // Branch should show code symbol
  const branchCode = page.locator('[data-testid="branch-code-b1"]');
  await expect(branchCode).toBeVisible({ timeout: 3000 });
});

// ─── AT-LE-054 ────────────────────────────────────────────────────────────────

test('AT-LE-054: Hovering a code highlights all branches sharing that code', async ({ page }) => {
  await openMap(page, SIMPLE_MAP_URL);

  // Open code library
  await page.locator('[data-testid="code-library-btn"]').click();

  // Create code 'Priority'
  await page.locator('[data-testid="code-name-input"]').fill('Priority');
  await page.locator('[data-testid="code-symbol-input"]').fill('!');
  await page.locator('[data-testid="add-code-btn"]').click();
  await page.waitForTimeout(200);

  // Apply to b1
  await page.locator('[data-testid="branch-label-b1"]').click({ force: true });
  await page.waitForTimeout(200);
  await page.locator('[data-testid="apply-code-Priority"]').click();
  await page.waitForTimeout(200);

  // Apply to b2
  await page.locator('[data-testid="branch-label-b2"]').click({ force: true });
  await page.waitForTimeout(200);
  await page.locator('[data-testid="apply-code-Priority"]').click();
  await page.waitForTimeout(200);

  // Hover the code entry
  const codeEntry = page.locator('[data-testid="code-entry-Priority"]');
  await codeEntry.hover();
  await page.waitForTimeout(300);

  // b1 and b2 should be highlighted
  await expect(page.locator('[data-testid="branch-label-b1"]')).toHaveAttribute('data-code-highlighted', 'true');
  await expect(page.locator('[data-testid="branch-label-b2"]')).toHaveAttribute('data-code-highlighted', 'true');

  // b3 should NOT be highlighted
  const b3Highlighted = await page.locator('[data-testid="branch-label-b3"]').getAttribute('data-code-highlighted');
  expect(b3Highlighted).toBeNull();
});
