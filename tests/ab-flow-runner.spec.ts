// ab-flow.spec.ts
import { test } from '@playwright/test';
import { runAbFlow, type FlowOptions } from './multi-function-ab-flow';

const verzoek = "./api-requests/verzoek-alo-ab-dcm-acc-currency-test.http";
const environment = "alo-dev";

const scenarios: FlowOptions[] = [
    //{ API_TEST_REQUEST_FILE: verzoek, INFRA: environment, Scenario: 'A', lastTask: 'vaststellen-woonsituatie' },
    { API_TEST_REQUEST_FILE: verzoek, INFRA: environment, Scenario: 'B', lastTask: 'vaststellen-persoon-aanvrager' },
    //{ API_TEST_REQUEST_FILE: verzoek, INFRA: environment, Scenario: 'C' },
];

test.describe.parallel('AB Flow scenarios', () => {
    for (const s of scenarios) {
        test(`${s.INFRA} | ${s.Scenario}`, async ({ page }) => {
            await runAbFlow(page, s);
        });
    }
});
