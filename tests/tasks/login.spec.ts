import { Page } from '@playwright/test';
import { loginLocal, waitForAngular, navigateToAlgemeneBijstandAanvraag, openCreatedCase } from './utils';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function loginTask(page: Page, testData: TestData) {
  await loginLocal(page);
  await waitForAngular(page);
  await navigateToAlgemeneBijstandAanvraag(page);
  await openCreatedCase(page, testData.lastName);
} 