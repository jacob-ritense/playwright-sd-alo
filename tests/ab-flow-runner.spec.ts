import { test } from '@playwright/test';
import { runAbFlow, type FlowOptions } from './multi-function-ab-flow';

// Tests runner
const scenarios: FlowOptions[] = [
    { API_TEST_REQUEST_FILE: "./api-requests/verzoek-alo-ab-dcm-acc-currency-test.http", INFRA: "alo-test", Scenario: 'A', lastTask: 'vaststellen-persoon-aanvrager' },
    { API_TEST_REQUEST_FILE: "./api-requests/verzoek-alo-ab-dcm-acc-currency-test.http", INFRA: "alo-test", Scenario: 'B', lastTask: 'vaststellen-persoon-aanvrager' },
    { API_TEST_REQUEST_FILE: "./api-requests/verzoek-alo-ab-dcm-acc-currency-test.http", INFRA: "alo-dev", Scenario: 'C', lastTask: 'vaststellen-persoon-aanvrager' },
];

test.describe.parallel('AB Flow scenarios', () => {
    for (const s of scenarios) {
        test(`${s.INFRA} | ${s.Scenario}`, async ({ page }) => {
            await runAbFlow(page, s); // runs strict 1→2A→4A… for that Scenario
        });
    }
});
