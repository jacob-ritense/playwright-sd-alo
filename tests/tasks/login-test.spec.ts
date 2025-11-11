import { Page } from '@playwright/test';
import { login, waitForAngular, navigateToAlgemeneBijstandAanvraag, openCreatedCase } from './utils';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function loginTestTask(page: Page, testData: TestData) {
  await login(page, 'test');
  await waitForAngular(page);
  await navigateToAlgemeneBijstandAanvraag(page);
  await openCreatedCase(page, testData.lastName);
}
