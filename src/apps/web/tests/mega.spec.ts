import { test, expect } from '@playwright/test';

const MAP_URL = '/map/test-fixture-mega';

async function openMegaMap(page: import('@playwright/test').Page) {
  await page.goto(MAP_URL);
  await page.waitForSelector('[data-testid="canvas-ready"]');
  await page.waitForSelector('[data-testid^="branch-label-"]', { timeout: 10000 });
  await page.waitForTimeout(1000);
}

/** Zoom the canvas by scrolling the mouse wheel at the canvas centre. */
async function wheelZoom(page: import('@playwright/test').Page, steps: number, deltaY: number) {
  const canvas = page.locator('[data-testid="canvas-ready"]');
  const box = await canvas.boundingBox();
  if (!box) return;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, deltaY);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(400);
}

/** Dispatch a right-click contextmenu event on the ReactFlow node containing a branch label. */
async function rightClickBranch(page: import('@playwright/test').Page, branchId: string) {
  await page.evaluate((id) => {
    const label = document.querySelector(`[data-testid="branch-label-${id}"]`);
    if (!label) return;
    const rfNode = label.closest('.react-flow__node') as HTMLElement | null;
    const target = rfNode ?? (label as HTMLElement);
    const rect = target.getBoundingClientRect();
    const evt = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      button: 2,
      buttons: 2,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
    });
    target.dispatchEvent(evt);
  }, branchId);
}

// AT-RE-007: Miniature viewport thumbnail visible when zoomed in
test('AT-RE-007: minimap thumbnail visible at zoom >150%, updates as user pans', async ({
  page,
}) => {
  await openMegaMap(page);

  // ReactFlow minimap: not visible before zooming in
  await expect(page.locator('.react-flow__minimap')).not.toBeVisible();

  // Zoom IN past 150% by scrolling up many times
  await wheelZoom(page, 35, -150); // negative deltaY = zoom in

  // ReactFlow minimap should now be visible (rendered by ZoomAwareMiniMap when zoom >= 1.5)
  await expect(page.locator('.react-flow__minimap')).toBeVisible({ timeout: 5000 });

  // Pan the map — minimap should still be visible and update
  const canvas = page.locator('.react-flow__pane');
  const canvasBounds = await canvas.boundingBox();
  if (canvasBounds) {
    const cx = canvasBounds.x + canvasBounds.width / 2;
    const cy = canvasBounds.y + canvasBounds.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 120, cy + 60);
    await page.mouse.move(cx + 200, cy + 100);
    await page.mouse.up();
    await page.waitForTimeout(400);
  }

  // Minimap still visible after panning (updates in real time)
  await expect(page.locator('.react-flow__minimap')).toBeVisible();
});

// AT-RE-041: Branch Pivot promotes a sub-branch to new centre
test('AT-RE-041: Branch Pivot promotes depth-2 branch to new centre with breadcrumb navigation', async ({
  page,
}) => {
  await openMegaMap(page);

  // Wait for depth-2 Prototype branch to be in the DOM
  await page.waitForSelector('[data-testid="branch-label-bm1-1-1"]', { timeout: 10000 });

  // Dispatch a contextmenu event on the Prototype branch (bm1-1-1, depth 2)
  await rightClickBranch(page, 'bm1-1-1');
  await page.waitForTimeout(400);

  // Context menu should appear with the Pivot option
  const contextMenu = page.locator('[data-testid="node-context-menu"]');
  await expect(contextMenu).toBeVisible({ timeout: 5000 });

  const pivotBtn = page.locator('[data-testid="ctx-pivot-centre"]');
  await expect(pivotBtn).toBeVisible();
  await expect(pivotBtn).toHaveText(/Pivot: Make this the centre/i);

  // Click the pivot option
  await pivotBtn.click();
  await page.waitForTimeout(500);

  // Pivot view should now overlay the canvas
  const pivotView = page.locator('[data-testid="pivot-view"]');
  await expect(pivotView).toBeVisible({ timeout: 3000 });

  // The pivot centre should show "Prototype"
  const pivotCentre = page.locator('[data-testid="pivot-centre"]');
  await expect(pivotCentre).toBeVisible();
  await expect(pivotCentre).toHaveText(/Prototype/i);

  // Breadcrumb navigation should be visible showing the full path
  const breadcrumb = page.locator('[data-testid="pivot-breadcrumb"]');
  await expect(breadcrumb).toBeVisible();

  // Breadcrumb should show: Mega Map > Innovation > Design > Prototype
  const breadcrumbText = await breadcrumb.textContent();
  expect(breadcrumbText).toContain('Mega Map');
  expect(breadcrumbText).toContain('Design');
  expect(breadcrumbText).toContain('Prototype');

  // Children of Prototype (MVP, Test, Iterate) should be visible as BOI tiles
  const pivotChildren = page.locator('[data-testid^="pivot-child-"]');
  await expect(pivotChildren.first()).toBeVisible({ timeout: 3000 });
  const childCount = await pivotChildren.count();
  expect(childCount).toBeGreaterThan(0);

  // Click the root breadcrumb (index 0 = "Mega Map") to navigate back
  const rootCrumb = page.locator('[data-testid="breadcrumb-0"]');
  await expect(rootCrumb).toBeVisible();
  await rootCrumb.click();
  await page.waitForTimeout(300);

  // Pivot view should disappear after navigating back to root
  await expect(pivotView).not.toBeVisible({ timeout: 3000 });
});
