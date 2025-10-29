import { Page } from '@playwright/test';
import { createVerzoek } from '../ApiClient';

const infra: string = (process.env.INFRA === undefined) ? 'alo-dev' : process.env.INFRA;
const apiTestRequestFile = process.env.API_TEST_REQUEST_FILE ?? '';
const apiRequestConfigFile = process.env.API_REQUEST_CONFIG_FILE ?? '';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function(page: Page, testData: TestData) {
  try {
    console.log('Using configuration:', {
      apiTestRequestFile,
      apiRequestConfigFile,
      infra
    });
    const response = await createVerzoek(testData.lastName, apiTestRequestFile, apiRequestConfigFile, infra);
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