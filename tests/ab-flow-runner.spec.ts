import { test } from '@playwright/test';
import { runAbFlow } from './ab-flow.spec';
import type { FlowEnvironment } from './tasks/utils';
import { runAbFlow, type FlowOptions } from './multi-function-ab-flow';

const verzoek = "./api-requests/verzoek-alo-ab-dcm-acc-currency-test.http";
const environment = "alo-dev";

const requestedEnvironments = parseRequestedEnvironments(process.env.AB_FLOW_ENV ?? 'test');
const scenarios: FlowOptions[] = [
    //{ API_TEST_REQUEST_FILE: verzoek, INFRA: environment, Scenario: 'A', lastTask: 'vaststellen-woonsituatie' },
    { API_TEST_REQUEST_FILE: verzoek, INFRA: environment, Scenario: 'B', lastTask: 'vaststellen-persoon-aanvrager' },
    //{ API_TEST_REQUEST_FILE: verzoek, INFRA: environment, Scenario: 'C' },
];

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
test.describe.parallel('AB Flow scenarios', () => {
    for (const s of scenarios) {
        test(`${s.INFRA} | ${s.Scenario}`, async ({ page }) => {
            await runAbFlow(page, s);
        });
    }
});
