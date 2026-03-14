import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// AT-NF-010: All non-canvas UI passes WCAG 2.1 AA (axe-core)
// AT-NF-012: Outline View is screen-reader compatible (ARIA tree/treeitem)

const SIMPLE_MAP_URL = '/map/test-fixture-simple';

// AT-NF-010: Axe-core audit on all non-canvas UI panels
test('AT-NF-010: Home page passes WCAG 2.1 AA accessibility audit', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Buzan Mind Mapper/);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .exclude('.react-flow') // Exclude the React Flow canvas (visual only)
    .analyze();

  const criticalOrSerious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );
  expect(criticalOrSerious).toHaveLength(0);
});

test('AT-NF-010: Map editor toolbar passes WCAG 2.1 AA accessibility audit', async ({
  page,
}) => {
  await page.goto(SIMPLE_MAP_URL);
  await page.waitForSelector('[data-testid="canvas-ready"]');
  await page.waitForTimeout(500);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .exclude('.react-flow') // Exclude React Flow canvas (ARIA not required for canvas)
    .analyze();

  const criticalOrSerious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );

  // Log violations for debugging if any exist
  if (criticalOrSerious.length > 0) {
    console.error('Accessibility violations:');
    criticalOrSerious.forEach((v) => {
      console.error(`  [${v.impact}] ${v.id}: ${v.description}`);
      v.nodes.forEach((n) => console.error(`    - ${n.html}`));
    });
  }

  expect(criticalOrSerious).toHaveLength(0);
});

// AT-NF-012: Outline View has ARIA tree/treeitem roles and is screen-reader compatible
test('AT-NF-012: Hierarchy Outline View has ARIA tree structure', async ({ page }) => {
  await page.goto(SIMPLE_MAP_URL);
  await page.waitForSelector('[data-testid="canvas-ready"]');
  await page.waitForSelector('[data-testid^="branch-label-"]', { timeout: 10000 });
  await page.waitForTimeout(500);

  // Open the Hierarchy Outline panel
  const outlineBtn = page.locator('[data-testid="hierarchy-outline-btn"]');
  await expect(outlineBtn).toBeVisible({ timeout: 5000 });
  await outlineBtn.click();
  await page.waitForTimeout(300);

  // The Hierarchy Outline View panel should be visible
  const outlineView = page.locator('[data-testid="hierarchy-outline-view"]');
  await expect(outlineView).toBeVisible({ timeout: 3000 });

  // Verify ARIA tree role on the container
  const treeContainer = page.locator('[role="tree"]');
  await expect(treeContainer).toBeVisible();
  await expect(treeContainer).toHaveAttribute('aria-label', 'Mind Map Hierarchy');

  // Verify treeitem roles on branch items
  const treeItems = page.locator('[role="treeitem"]');
  const itemCount = await treeItems.count();
  expect(itemCount).toBeGreaterThan(0);

  // Each treeitem should have an aria-label
  const firstItem = treeItems.first();
  await expect(firstItem).toHaveAttribute('aria-label');

  // Run axe-core specifically on the outline view
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .include('[data-testid="hierarchy-outline-view"]')
    .analyze();

  const criticalOrSerious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );

  if (criticalOrSerious.length > 0) {
    console.error('Outline View accessibility violations:');
    criticalOrSerious.forEach((v) => {
      console.error(`  [${v.impact}] ${v.id}: ${v.description}`);
    });
  }

  expect(criticalOrSerious).toHaveLength(0);

  // Verify branch nodes appear in the outline
  const innovationItem = page.locator('[data-testid="outline-item-b1"]');
  await expect(innovationItem).toBeVisible({ timeout: 3000 });

  // Verify sub-branches appear with nested treeitem structure
  const designItem = page.locator('[data-testid="outline-item-b1-1"]');
  await expect(designItem).toBeVisible({ timeout: 3000 });

  // Close the outline
  const closeBtn = page.locator('[data-testid="hierarchy-outline-close"]');
  await expect(closeBtn).toBeVisible();
  await closeBtn.click();
  await page.waitForTimeout(200);
  await expect(outlineView).not.toBeVisible();
});
