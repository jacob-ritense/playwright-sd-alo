import {Page} from '@playwright/test';
import {login, waitForAngular, navigateToAlgemeneBijstandAanvraag, openCreatedCase} from './utils';
import {TestData} from '../multi-function-ab-flow';

export default async function loginTask(page: Page, testData: TestData) {
    await login(page, testData.options.INFRA);
    await navigateToAlgemeneBijstandAanvraag(page);
    await openCreatedCase(page, testData.lastName);
}
