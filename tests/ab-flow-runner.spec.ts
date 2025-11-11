import { test } from '@playwright/test';
import { runAbFlow } from './ab-flow.spec';
import type { FlowEnvironment } from './tasks/utils';

const requestedEnvironments = parseRequestedEnvironments(process.env.AB_FLOW_ENV ?? 'test');

for (const environment of requestedEnvironments) {
  test.describe(`Algemene bijstand Flow (${environment.toUpperCase()})`, () => {
    test(`complete aanvraag process [${environment}]`, async ({ page }) => {
      test.setTimeout(300000);
      process.env.AB_FLOW_ENV_CURRENT = environment;
      await runAbFlow(page, { environment });
    });
  });
}

function parseRequestedEnvironments(input: string): FlowEnvironment[] {
  const tokens = input.split(',').map((token) => token.trim().toLowerCase()).filter(Boolean);
  const normalized = tokens
    .map<FlowEnvironment | null>((token) => {
      if (token === 'dev') return 'dev';
      if (token === 'test') return 'test';
      if (token === 'acc') return 'acc';
      console.warn(`Unknown AB flow environment "${token}" - skipping.`);
      return null;
    })
    .filter((value): value is FlowEnvironment => value !== null);

  return normalized.length ? normalized : ['dev'];
}
