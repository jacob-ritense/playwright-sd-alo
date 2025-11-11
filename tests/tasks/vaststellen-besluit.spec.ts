import { Page } from '@playwright/test';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function vaststellenBesluitTask(page: Page, testData: TestData) {
  const flowTaskName = 'vaststellen-besluit';
  const taskName = 'Vaststellen besluit';

  try {
    console.log(`[${flowTaskName}] Looking for task: "${taskName}"`);
    const taskElement = page.getByText(taskName, { exact: true });
    try {
      await taskElement.waitFor({ state: 'visible', timeout: 30000 });
    } catch (timeoutError) {
      console.warn(`[${flowTaskName}] Task "${taskName}" not visible within timeout, refreshing and retrying...`);
      await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.getByText(taskName, { exact: true }).waitFor({ state: 'visible', timeout: 20000 });
    }
    console.log(`[${flowTaskName}] Task "${taskName}" is visible.`);

    await taskElement.click();
    console.log(`[${flowTaskName}] Clicked task: "${taskName}".`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log(`[${flowTaskName}] Selecting "Toekennen" radio option...`);
    const toekennenRadio = page.getByRole('radio', { name: /^Toekennen$/i });
    await toekennenRadio.waitFor({ state: 'visible', timeout: 20000 });
    await toekennenRadio.check();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(1000);

    console.log(`[${flowTaskName}] Selecting bijstandsvorm "Lening"...`);
    const bijstandsvormDropdown = page.locator('.choices > div').first();
    await bijstandsvormDropdown.waitFor({ state: 'visible', timeout: 20000 });
    await bijstandsvormDropdown.click();

    const leningOption = page.getByRole('option', { name: 'Lening' }).first();
    await leningOption.waitFor({ state: 'visible', timeout: 10000 });
   await leningOption.click();
   await page.waitForLoadState('networkidle', { timeout: 15000 });
   await page.waitForTimeout(1000);

    console.log(`[${flowTaskName}] Uploading besluit document...`);
    const dropZoneText = 'Kies een bestand, of sleep het hier naartoe';
    const dropZone = page.getByText(dropZoneText, { exact: false }).first();
    await dropZone.waitFor({ state: 'visible', timeout: 30000 });
    await dropZone.click({ force: true });

    const filePath = 'context-files/test-beschikking.txt';
    let fileInput = dropZone.locator('xpath=ancestor::div[contains(@class,"formio-component")]//input[@type="file"]').first();
    if (!(await fileInput.count())) {
      fileInput = page.locator('input[type="file"]').first();
    }
    await fileInput.setInputFiles(filePath);
    console.log(`[${flowTaskName}] Document "${filePath}" selected, confirming upload...`);

    const opslaanButton = page.getByRole('button', { name: /^Opslaan$/i }).first();
    await opslaanButton.waitFor({ state: 'visible', timeout: 15000 });
    await opslaanButton.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(1000);

    console.log(`[${flowTaskName}] Clicking "Indienen" button...`);
    await page.getByRole('button', { name: 'Indienen' }).click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log(`[${flowTaskName}] Task "${taskName}" completed.`);
  } catch (error) {
    console.error(`[${flowTaskName}] Failed during task processing:`, error);
    try {
      await page.screenshot({ path: 'vaststellen-besluit-error.png', fullPage: true });
      console.log(`[${flowTaskName}] Screenshot saved as vaststellen-besluit-error.png`);
    } catch (screenshotError) {
      console.error(`[${flowTaskName}] Failed to save error screenshot:`, screenshotError);
    }
    throw error;
  }
}
