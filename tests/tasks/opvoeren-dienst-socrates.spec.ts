import { Page } from '@playwright/test';
import { waitForTask, waitForSpecificTask, completeSpecificTask } from './utils';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function opvoerenDienstSocratesTask(page: Page, testData: TestData) {
  await waitForTask(page, 2000);
  
  const taskName = "Opvoeren dienst in Socrates";
  const taskFound = await waitForSpecificTask(page, taskName);
  if (!taskFound) {
    throw new Error(`Task "${taskName}" did not appear after multiple refresh attempts`);
  }
  
  await completeSpecificTask(page, taskName);
  console.log(`Successfully completed task "${taskName}"`);
} 