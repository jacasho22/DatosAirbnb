import { test, expect } from '@playwright/test';

test('complete form flow: fill, sign, submit', async ({ page }) => {
  await page.goto('http://localhost:8000/form.html');

  // Seed checkInData in localStorage
  await page.evaluate(() => {
    localStorage.setItem('checkInData', JSON.stringify({ apartment: '1', checkInDate: '2025-09-18', guestsCount: 1, language: 'es' }));
  });

  // Reload so the page picks up the localStorage
  await page.reload();

  // Wait for the guest form and fill minimum required fields
  await page.waitForSelector('.guest-form');
  await page.fill('input[name="full-name"]', 'Test User');
  await page.selectOption('select[name="gender"]', 'male');
  await page.fill('input[name="birth-date"]', '1990-01-01');
  await page.fill('input[name="nationality"]', 'Testland');
  await page.fill('input[name="address"]', 'Calle Test 1');
  await page.fill('input[name="municipality"]', 'Ciudad');
  await page.fill('input[name="postal-code"]', '00000');
  await page.fill('input[name="province"]', 'Provincia');
  await page.fill('input[name="country"]', 'Pais');
  await page.fill('input[name="phone"]', '+34123456789');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.selectOption('select[name="document-type"]', 'passport');
  await page.fill('input[name="document-number"]', 'X1234567');

  // Draw a simple dot on canvas by executing JS in page context
  // Ensure signature canvases are initialized (the page exposes initializeSignatureCanvases)
  await page.evaluate(() => {
    if (window.initializeSignatureCanvases) {
      try { window.initializeSignatureCanvases(); } catch (e) { /* ignore */ }
    }
  });

  // Draw a simple dot on canvas by executing JS in page context
  await page.evaluate(() => {
    const canvas = document.querySelector('.signature-canvas');
    if (canvas) {
      // ensure size for toBlob and draw ops
      canvas.width = canvas.clientWidth || 300;
      canvas.height = canvas.clientHeight || 150;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(10, 10, 2, 2);
    }
  });

  // Enable test mode to avoid Firestore writes
  await page.evaluate(() => { window.__TEST_MODE = true; });

  // Click next (if present) or submit to show confirmation, then confirm
  const nextVisible = await page.isVisible('#next-btn').catch(() => false);
  if (nextVisible) {
    await page.click('#next-btn');
  } else {
    // Use submit button when there's only one guest
    await page.waitForSelector('#submit-btn', { state: 'visible' });
    await page.click('#submit-btn');
  }

  await page.waitForSelector('#confirm-btn', { state: 'visible' });
  await page.click('#confirm-btn');

  // The success modal should appear
  await page.waitForSelector('#success-modal', { state: 'visible' });
  const visible = await page.isVisible('#success-modal');
  expect(visible).toBe(true);
});
