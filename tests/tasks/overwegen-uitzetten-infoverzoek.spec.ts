import { Page } from '@playwright/test';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function(page: Page, testData: TestData) {
  const taskName = "Overwegen uitzetten informatieverzoek";
  try {
    console.log(`Looking for task: "${taskName}"`);
    const taskElement = page.getByText(taskName, { exact: true });
    await taskElement.waitFor({ state: 'visible', timeout: 30000 });
    console.log(`Task "${taskName}" is visible.`);
    await taskElement.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log('Clicking "Nee" radio button...');
    await page.getByRole('radio', { name: 'Nee' }).check();
    console.log('Clicking "Indienen" button...');
    await page.getByRole('button', { name: 'Indienen' }).click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('"Nee" selected and form submitted.');
  } catch (error) {
    console.error('Failed during "Overwegen uitzetten informatieverzoek" task processing:', error);
    try {
      await page.screenshot({ path: 'overwegen-uitzetten-infoverzoek-error.png', fullPage: true });
      console.log('Screenshot saved as overwegen-uitzetten-infoverzoek-error.png');
    } catch (screenshotError) {
      console.error('Failed to save error screenshot:', screenshotError);
    }
    throw error;
  }
} 