import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function(page: Page, testData: TestData) {
  const taskName = "Vaststellen verblijfstitel aanvrager";
  try {
    console.log(`Looking for task: "${taskName}"`);
    const taskElement = page.getByText(taskName, { exact: true });
    await taskElement.waitFor({ state: 'visible', timeout: 30000 });
    await taskElement.click();
    console.log(`Clicked task: "${taskName}".`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);
    // 2.1 Select "Nee" for "Is de aanvrager Nederlander?"
    console.log('Looking for "Is de aanvrager Nederlander?" radio buttons...');
    const neeRadio = page.getByRole('radio', { name: 'Nee' });
    await neeRadio.waitFor({ state: 'visible', timeout: 10000 });
    await neeRadio.check();
    console.log('Selected "Nee" for "Is de aanvrager Nederlander?"');
    await page.waitForTimeout(2000);
    // 2.2 Wait for dropdown to appear and select option starting with "10"
    console.log('Looking for "Verblijfstitel vaststellen" dropdown...');
    let verblijfstitelDropdown;
    try {
      verblijfstitelDropdown = page.getByRole('combobox', { name: 'Verblijfstitel vaststellen' });
      await verblijfstitelDropdown.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      verblijfstitelDropdown = page.getByRole('combobox', { name: /verblijfstitel/i });
      await verblijfstitelDropdown.waitFor({ state: 'visible', timeout: 5000 });
    }
    await verblijfstitelDropdown.click();
    await page.waitForTimeout(1000);
    // Find the option with code "10"
    let option10;
    try {
      option10 = page.getByRole('option', { name: /^10:/ });
      await option10.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      option10 = page.locator('option, [role="option"]').filter({ hasText: /^10:/ });
      await option10.waitFor({ state: 'visible', timeout: 5000 });
    }
    await option10.click();
    console.log('Selected verblijfstitel option starting with "10".');
    // 2.3 Fill in the textbox labeled "Toelichting" with 3 random words
    const toelichtingText = faker.lorem.words(3);
    let toelichtingBox;
    try {
      toelichtingBox = page.getByRole('textbox', { name: 'Toelichting' });
      await toelichtingBox.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      toelichtingBox = page.getByRole('textbox', { name: /toelichting/i });
      await toelichtingBox.waitFor({ state: 'visible', timeout: 10000 });
    }
    await toelichtingBox.fill(toelichtingText);
    console.log(`Filled "Toelichting" with: "${toelichtingText}"`);
    // 3. Submit the form (click "Indienen")
    const indienenButton = page.getByRole('button', { name: 'Indienen' });
    await indienenButton.waitFor({ state: 'visible', timeout: 10000 });
    await indienenButton.click();
    console.log('Clicked "Indienen" button to submit the form.');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('Vaststellen verblijfstitel aanvrager task completed.');
  } catch (error) {
    console.error(`Failed during "${taskName}" task processing:`, error);
    try {
      await page.screenshot({ path: 'vaststellen-verblijfstitel-aanvrager-error.png', fullPage: true });
      console.log('Screenshot saved as vaststellen-verblijfstitel-aanvrager-error.png');
    } catch (screenshotError) {
      console.error('Failed to save error screenshot:', screenshotError);
    }
    throw error;
  }
} 