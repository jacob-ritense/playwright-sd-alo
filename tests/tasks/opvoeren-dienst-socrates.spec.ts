import { Page } from '@playwright/test';
import { waitForSpecificTask  } from '../helper-functions/utils';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function opvoerenDienstSocratesTask(page: Page, testData: TestData) {
  const taskName = "Opvoeren dienst in Socrates";
  const taskFound = await waitForSpecificTask(page, taskName);
  if (!taskFound) {
    throw new Error(`Task "${taskName}" did not appear after multiple refresh attempts`);
  }

  const taskElement = page.getByText(taskName, { exact: true });
  await taskElement.click();
  console.log('Clicking "De dienst is opgevoerd in Socrates" button...');
  await page.getByRole('button', { name: 'De dienst is opgevoerd in Socrates' }).click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  console.log(`Successfully completed task "${taskName}"`);
} 