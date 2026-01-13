// tasks/login-navigate-case.spec.ts
import { Page } from '@playwright/test';
import { login, waitForDashboard, navigateToAlgemeneBijstandAanvraag, openCreatedCase } from '../helper-functions/utils';
import type { TestData } from '../../test-cases/automatic-ab-flow'; // scenario flow
import { DEFAULT_INFRA } from '../helper-functions/env'; // adjust path
import { claimCase } from '../helper-functions/utils';

export default async function loginTask(page: Page, testData: TestData) {
    const infra = (testData.options?.INFRA ?? DEFAULT_INFRA);

    await login(page, infra);
    //await waitForAngular(page);
    await waitForDashboard(page);
    await navigateToAlgemeneBijstandAanvraag(page);
    if (!testData.publicReference) {
        throw new Error('Missing publicReference on testData; create-verzoek task should populate it.');
    }
    console.log('Searching for case with public_reference:', testData.publicReference);
    await openCreatedCase(page, testData.publicReference);

    try {
        await claimCase(page);
    } catch (err) {
        console.warn(`Could not claim case, continuing without claiming.`, err);
    }
}
