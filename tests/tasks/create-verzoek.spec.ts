// tasks/create-verzoek.spec.ts
import { Page } from '@playwright/test';
import { createVerzoek } from '../ApiClient';
import { getActiveRequestFile } from '../../test-cases/scenarios/test-scenario-picker';

interface TestData {
    lastName: string;
    requestId: string | null;
    options: {
        INFRA: string;
    };
}

const apiRequestConfigFile = (process.env.API_REQUEST_CONFIG_FILE ?? '').trim();

export default async function (page: Page, testData: TestData) {
    const infra = testData.options.INFRA;              // 🔹 from multi-function-ab-flow
    const apiTestRequestFile = getActiveRequestFile(); // 🔹 from scenario (V1/V2/...)

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

