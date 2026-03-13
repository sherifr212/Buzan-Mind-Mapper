import { test, expect } from '@playwright/test';

test('app loads without crashing', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Buzan Mind Mapper/);
  await expect(page.getByRole('heading', { name: /Buzan Mind Mapper/i })).toBeVisible();
});
