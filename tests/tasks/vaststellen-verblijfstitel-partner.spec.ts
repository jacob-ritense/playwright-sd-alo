import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function verblijfstitelPartnerTask(page: Page, testData: TestData) {
  const taskName = 'Vaststellen verblijfstitel partner';
  try {
    console.log(`Looking for task: "${taskName}"`);
    const taskElement = page.getByText(taskName, { exact: true });
    try {
      await taskElement.waitFor({ state: 'visible', timeout: 30000 });
    } catch (timeoutError) {
      console.warn(`Task "${taskName}" not visible within timeout, refreshing and retrying...`);
      await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.getByText(taskName, { exact: true }).waitFor({ state: 'visible', timeout: 20000 });
    }
    console.log(`Task "${taskName}" is visible.`);

    await taskElement.click();
    console.log(`Clicked task: "${taskName}".`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Selecting "Ja" for nationality question...');
    await page.getByRole('radio', { name: 'Ja' }).check();

    const toelichting = faker.lorem.words(8);
    console.log(`Filling "Toelichting" with: "${toelichting}"`);
    await page.getByLabel('Toelichting').fill(toelichting);

    console.log('Clicking "Indienen" button...');
    await page.getByRole('button', { name: 'Indienen' }).click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('Verblijfstitel partner form submitted successfully.');
  } catch (error) {
    console.error('Failed during "Verblijfstitel partner" task processing:', error);
    try {
      await page.screenshot({ path: 'verblijfstitel-partner-error.png', fullPage: true });
      console.log('Screenshot saved as verblijfstitel-partner-error.png');
    } catch (screenshotError) {
      console.error('Failed to save error screenshot:', screenshotError);
    }
    throw error;
  }
}
