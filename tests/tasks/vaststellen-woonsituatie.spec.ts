import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function vaststellenWoonsituatieTask(page: Page, testData: TestData) {
  const flowTaskName = 'vaststellen-woonsituatie';
  const taskName = 'Vaststellen woonsituatie';

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

    console.log(`[${flowTaskName}] Filling "Aantal belanghebbenden" with 1...`);
    await page.getByLabel('Aantal belanghebbenden').fill('1');

    console.log(`[${flowTaskName}] Selecting "Zelfstandig wonend" for woonsituatie...`);
    await page.getByRole('radio', { name: 'Zelfstandig wonend' }).check();

    console.log(`[${flowTaskName}] Selecting "Ja" for Art 23.3 van toepassing...`);
    await page.getByRole('radio', { name: 'Ja' }).check();

    const toelichting = faker.lorem.words(8);
    console.log(`[${flowTaskName}] Filling "Toelichting" with: "${toelichting}"`);
    await page.getByLabel('Toelichting').fill(toelichting);

    console.log(`[${flowTaskName}] Clicking "Indienen" button...`);
    await page.getByRole('button', { name: 'Indienen' }).click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log(`[${flowTaskName}] Vaststellen woonsituatie task completed successfully.`);
  } catch (error) {
    console.error(`[${flowTaskName}] Failed during task processing:`, error);
    try {
      await page.screenshot({ path: 'vaststellen-woonsituatie-error.png', fullPage: true });
      console.log(`[${flowTaskName}] Screenshot saved as vaststellen-woonsituatie-error.png`);
    } catch (screenshotError) {
      console.error(`[${flowTaskName}] Failed to save error screenshot:`, screenshotError);
    }
    throw error;
  }
}
