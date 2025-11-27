// tasks/login-navigate-case.spec.ts
import { Page } from '@playwright/test';
import { login, waitForAngular, navigateToAlgemeneBijstandAanvraag, openCreatedCase } from '../helper-functions/utils';
import type { TestData } from '../automatic-ab-flow'; // scenario flow
import { DEFAULT_INFRA } from '../helper-functions/env'; // adjust path

export default async function loginTask(page: Page, testData: TestData) {
    const infra = (testData.options?.INFRA ?? DEFAULT_INFRA);

    await login(page, infra);
    await waitForAngular(page);
    await navigateToAlgemeneBijstandAanvraag(page);
    await openCreatedCase(page, testData.lastName);
}
