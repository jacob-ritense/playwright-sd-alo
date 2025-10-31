import { Page } from '@playwright/test';
import { createVerzoek } from '../ApiClient';
import type { TestData } from '../multi-function-ab-flow';  // contains .options.{INFRA, API_TEST_REQUEST_FILE, ...}

export default async function createVerzoekTask(page: Page, testData: TestData) {
    try {
        // --- Pull variables directly from the flow’s options ---
        const infra = testData.options.INFRA ?? 'alo-dev';
        const apiTestRequestFile = testData.options.API_TEST_REQUEST_FILE ?? '';
        const apiRequestConfigFile = process.env.API_REQUEST_CONFIG_FILE ?? '';

        console.log('Using configuration:', {
            infra,
            apiTestRequestFile,
            apiRequestConfigFile,
        });

        // --- Execute API call using scenario variables ---
        const response = await createVerzoek(
            testData.lastName,
            apiTestRequestFile,
            apiRequestConfigFile,
            infra
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
