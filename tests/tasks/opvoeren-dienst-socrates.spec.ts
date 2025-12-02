import { Page } from '@playwright/test';
import { openTask  } from '../helper-functions/utils';

export default async function opvoerenDienstSocratesTask(page: Page) {
  const taskName = "Opvoeren dienst in Socrates";
  await openTask(page, taskName);

  const taskElement = page.getByText(taskName, { exact: true });
  await taskElement.click();
  console.log('Clicking "De dienst is opgevoerd in Socrates" button...');
  await page.getByRole('button', { name: 'De dienst is opgevoerd in Socrates' }).click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  console.log(`Successfully completed task "${taskName}"`);
} 