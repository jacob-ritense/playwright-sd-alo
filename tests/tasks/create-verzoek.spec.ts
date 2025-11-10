import { Page } from '@playwright/test';
import { createVerzoek } from '../ApiClient';
import { resolveFlowEnvironment, type FlowEnvironment } from './utils';

const apiTestRequestFile = (process.env.API_TEST_REQUEST_FILE ?? '').trim();
const apiRequestConfigFile = (process.env.API_REQUEST_CONFIG_FILE ?? '').trim();

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function(page: Page, testData: TestData) {
  const infra = resolveInfra();

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

function resolveInfra() {
  const env = resolveFlowEnvironment();
  const envKey = env.toUpperCase();
  const specific = process.env[`INFRA_${envKey}` as keyof NodeJS.ProcessEnv];
  const fallback = defaultInfraByEnvironment[env];
  const base = (specific ?? process.env.INFRA ?? fallback).trim();
  return base || fallback;
}

const defaultInfraByEnvironment: Record<FlowEnvironment, string> = {
  dev: 'alo-dev',
  test: 'alo-test',
  acc: 'alo-acc',
};
