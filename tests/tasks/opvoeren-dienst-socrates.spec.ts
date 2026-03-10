import { Page } from '@playwright/test';
import { openTask  } from '../helper-functions/utils';

export default async function opvoerenDienstSocratesTask(page: Page) {
  const taskName = "opvoeren dienst in socrates";
  await openTask(page, taskName);

  const taskElement = page.getByText(taskName);
  await taskElement.click();
  console.log('Clicking "Overslaan" button...');
  await page.getByRole('button', { name: 'Overslaan' }).click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  console.log(`Successfully completed task "${taskName}"`);
}