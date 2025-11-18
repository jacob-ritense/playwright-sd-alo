import { test } from '@playwright/test';
import { runAbFlow, type FlowOptions } from './multi-function-ab-flow';

// Tests runner
// Fill in INFRA (Environment), Scenario (from test-scenario-picker) and the LastTask if wanted.
const scenarios: FlowOptions[] = [
    { INFRA: 'alo-test', Scenario: 'A'},
    { INFRA: 'alo-test', Scenario: 'B', lastTask: 'vaststellen-woonsituatie' },
    { INFRA: 'alo-test', Scenario: 'C', lastTask: 'vaststellen-persoon-aanvrager' },
];

test.describe.parallel('AB Flow scenarios', () => {
    for (const s of scenarios) {
        test(`${s.INFRA} | ${s.Scenario}`, async ({ page }) => {
            await runAbFlow(page, s); // runs strict 1→2A→4A… for that Scenario
        });
    }
});
