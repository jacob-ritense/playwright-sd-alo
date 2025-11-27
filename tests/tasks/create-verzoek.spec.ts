// tasks/create-verzoek.spec.ts
import { Page } from '@playwright/test';
import { createVerzoek } from '../helper-functions/ApiClient';
import type { TestData } from '../automatic-ab-flow';
import { DEFAULT_INFRA, DEFAULT_API_TEST_REQUEST_FILE } from '../helper-functions/env'; // adjust path

const apiRequestConfigFile = (process.env.API_REQUEST_CONFIG_FILE ?? '').trim();

export default async function (page: Page, testData: TestData) {
    const infra = (testData.options?.INFRA ?? DEFAULT_INFRA);

    // Scenario flow can pre-fill this on testData.options.API_TEST_REQUEST_FILE.
    const apiTestRequestFile =
        testData.options?.API_TEST_REQUEST_FILE ?? DEFAULT_API_TEST_REQUEST_FILE;

    try {
        console.log('Using configuration:', {
            apiTestRequestFile,
            apiRequestConfigFile,
            infra,
        });

        const response = await createVerzoek(
            testData.lastName,
            apiTestRequestFile,
            apiRequestConfigFile,
            infra,
        );

        console.log('Create verzoek response:', JSON.stringify(response, null, 2));
        if (!response) throw new Error('API response should not be null');
        if (!response.id) throw new Error('Verzoek should have an ID');

        testData.requestId = response.id;
        console.log('Created verzoek with ID:', testData.requestId);
    } catch (error) {
        console.error('Failed to create verzoek:', error);
        throw error;
    }
}

