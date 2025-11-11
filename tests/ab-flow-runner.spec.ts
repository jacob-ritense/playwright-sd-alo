import { test } from '@playwright/test';
import type { FlowEnvironment } from './tasks/utils';
import { runAbFlow, type FlowOptions } from './multi-function-ab-flow';

// const requestedEnvironments = parseRequestedEnvironments(process.env.AB_FLOW_ENV ?? 'test');
//
// for (const environment of requestedEnvironments) {
//   test.describe(`Algemene bijstand Flow (${environment.toUpperCase()})`, () => {
//     test(`complete aanvraag process [${environment}]`, async ({ page }) => {
//       test.setTimeout(300000);
//       process.env.AB_FLOW_ENV_CURRENT = environment;
//       await runAbFlow(page, { environment });
//     });
//   });
// }
//
// function parseRequestedEnvironments(input: string): FlowEnvironment[] {
//   const tokens = input.split(',').map((token) => token.trim().toLowerCase()).filter(Boolean);
//   const normalized = tokens
//     .map<FlowEnvironment | null>((token) => {
//       if (token === 'dev') return 'dev';
//       if (token === 'test') return 'test';
//       if (token === 'acc') return 'acc';
//       console.warn(`Unknown AB flow environment "${token}" - skipping.`);
//       return null;
//     })
//     .filter((value): value is FlowEnvironment => value !== null);
//
//   return normalized.length ? normalized : ['dev'];
// }

// Tests runner
const scenarios: FlowOptions[] = [
    { API_TEST_REQUEST_FILE: "./api-requests/verzoek-alo-ab-dcm-acc-currency-test.http", INFRA: "alo-dev", Scenario: 'A', lastTask: 'vaststellen-persoon-aanvrager' },
    { API_TEST_REQUEST_FILE: "./api-requests/verzoek-alo-ab-dcm-acc-currency-test.http", INFRA: "alo-dev", Scenario: 'B', lastTask: 'vaststellen-persoon-aanvrager' },
    { API_TEST_REQUEST_FILE: "./api-requests/verzoek-alo-ab-dcm-acc-currency-test.http", INFRA: "alo-dev", Scenario: 'C', lastTask: 'vaststellen-persoon-aanvrager' },
];

test.describe.parallel('AB Flow scenarios', () => {
    for (const s of scenarios) {
        test(`${s.INFRA} | ${s.Scenario}`, async ({ page }) => {
            await runAbFlow(page, s); // runs strict 1→2A→4A… for that Scenario
        });
    }
});
