import { Page } from '@playwright/test';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function vaststellenLeefWoonsituatieTask(page: Page, testData: TestData) {
  const flowTaskName = 'vaststellen-leef-woonsituatie';
  const taskName = 'Vaststellen leef- en woonsituatie';

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

    console.log(`[${flowTaskName}] Clicking "Afronden" button...`);
    await page.getByRole('button', { name: 'Afronden' }).click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log(`[${flowTaskName}] Task completed successfully.`);
  } catch (error) {
    console.error(`[${flowTaskName}] Failed during task processing:`, error);
    try {
      await page.screenshot({ path: 'vaststellen-leef-woonsituatie-error.png', fullPage: true });
      console.log(`[${flowTaskName}] Screenshot saved as vaststellen-leef-woonsituatie-error.png`);
    } catch (screenshotError) {
      console.error(`[${flowTaskName}] Failed to save error screenshot:`, screenshotError);
    }
    throw error;
  }
}
