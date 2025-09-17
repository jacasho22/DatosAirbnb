import { test, expect } from '@playwright/test';

test('form page loads and shows guest-forms-container', async ({ page }) => {
  await page.goto('http://localhost:8000/form.html');
  const container = await page.locator('#guest-forms-container');
  await expect(container).toBeVisible();
});
