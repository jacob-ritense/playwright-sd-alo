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