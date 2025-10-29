import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function inangsdatumTask(page: Page, testData: TestData) {
  const firstTaskName = 'Vaststellen aanvangsdatum';
  const secondTaskName = 'Vaststellen Ingangsdatum';

  try {
    // Complete "Vaststellen aanvangsdatum"
    console.log(`Looking for task: "${firstTaskName}"`);
    const firstTask = page.getByText(firstTaskName, { exact: true });
    try {
      await firstTask.waitFor({ state: 'visible', timeout: 30000 });
    } catch (timeoutError) {
      console.warn(`Task "${firstTaskName}" not visible within timeout, refreshing and retrying...`);
      await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.getByText(firstTaskName, { exact: true }).waitFor({ state: 'visible', timeout: 20000 });
    }
    console.log(`Task "${firstTaskName}" is visible.`);

    await firstTask.click();
    console.log(`Clicked task: "${firstTaskName}".`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Clicking "Afronden" button for Vaststellen aanvangsdatum...');
    await page.getByRole('button', { name: 'Afronden' }).click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log(`Task "${firstTaskName}" completed.`);

    // Complete "Vaststellen Ingangsdatum"
    console.log(`Looking for task: "${secondTaskName}"`);
    const secondTask = page.getByText(secondTaskName, { exact: true });
    try {
      await secondTask.waitFor({ state: 'visible', timeout: 30000 });
    } catch (timeoutError) {
      console.warn(`Task "${secondTaskName}" not visible within timeout, refreshing and retrying...`);
      await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.getByText(secondTaskName, { exact: true }).waitFor({ state: 'visible', timeout: 20000 });
    }
    console.log(`Task "${secondTaskName}" is visible.`);

    await secondTask.click();
    console.log(`Clicked task: "${secondTaskName}".`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const toelichting = faker.lorem.sentence();
    console.log(`Filling "Toelichting" with: "${toelichting}"`);
    await page.getByRole('textbox', { name: 'Toelichting' }).fill(toelichting);

    console.log('Clicking "Indienen" button for Vaststellen Ingangsdatum...');
    await page.getByRole('button', { name: 'Indienen' }).click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log(`Task "${secondTaskName}" completed.`);
  } catch (error) {
    console.error('Failed during inangsdatum task processing:', error);
    try {
      await page.screenshot({ path: 'inangsdatum-error.png', fullPage: true });
      console.log('Screenshot saved as inangsdatum-error.png');
    } catch (screenshotError) {
      console.error('Failed to save error screenshot:', screenshotError);
    }
    throw error;
  }
}
