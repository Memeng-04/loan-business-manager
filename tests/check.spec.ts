import { test, expect } from '@playwright/test';

test('check page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', exception => {
    errors.push(`Uncaught exception: "${exception}"`);
  });
  page.on('console', msg => {
    if (msg.type() === 'error')
      errors.push(`Console error: "${msg.text()}"`);
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  if (errors.length > 0) {
    console.log("ERRORS FOUND:");
    console.log(errors.join('\n'));
    throw new Error("Page had errors");
  } else {
    console.log("No console errors found!");
  }
});
