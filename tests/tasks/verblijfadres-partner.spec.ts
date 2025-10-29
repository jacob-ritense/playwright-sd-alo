import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function verblijfadresPartnerTask(page: Page, testData: TestData) {
  const taskName = 'Selecteren verblijfadres partner';
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

    const questionText = 'Welk adres wordt gebruikt voor de woonsituatie?';
    await page.getByText(questionText, { exact: false }).waitFor({ state: 'visible', timeout: 15000 });

    console.log('Selecting "Verblijfadres" option for woonsituatie...');
    const verblijfadresRadio = page.getByRole('radio', { name: 'Verblijfadres' });
    await verblijfadresRadio.waitFor({ state: 'visible', timeout: 15000 });
    if (!await verblijfadresRadio.isChecked()) {
      await verblijfadresRadio.check();
    }

    const toelichting = faker.lorem.words(6);
    console.log(`Filling "Toelichting" with: "${toelichting}"`);
    await page.getByRole('textbox', { name: 'Toelichting' }).fill(toelichting);

    console.log('Clicking "Indienen" button...');
    await page.getByRole('button', { name: 'Indienen' }).click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('Verblijfadres partner form submitted successfully.');
  } catch (error) {
    console.error('Failed during "Verblijfadres partner" task processing:', error);
    try {
      await page.screenshot({ path: 'verblijfadres-partner-error.png', fullPage: true });
      console.log('Screenshot saved as verblijfadres-partner-error.png');
    } catch (screenshotError) {
      console.error('Failed to save error screenshot:', screenshotError);
    }
    throw error;
  }
}
