import { test } from '@playwright/test';
import { runAbFlow, type FlowOptions } from '../tests/automatic-ab-flow';

// Tests runner
// Fill in INFRA (Environment), Scenario (from test-scenario-picker) and the LastTask if wanted.
const scenarios: FlowOptions[] = [
    { INFRA: 'alo-test', Scenario: 'A' },
    { INFRA: 'alo-test', Scenario: 'B' },
    { INFRA: 'alo-test', Scenario: 'C' },
    { INFRA: 'alo-test', Scenario: 'C', lastTask: 'vaststellen-persoon-aanvrager' },
];

test.describe.parallel('AB Flow scenarios', () => {
    for (const s of scenarios) {
        const name = s.lastTask
            ? `${s.INFRA} | ${s.Scenario} | last: ${s.lastTask}`
            : `${s.INFRA} | ${s.Scenario}`;

        test(name, async ({ page }) => {
            await runAbFlow(page, s);
        });
    }
});



