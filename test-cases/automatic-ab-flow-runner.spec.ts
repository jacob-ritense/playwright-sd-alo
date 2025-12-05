import { test } from '@playwright/test';
import { runAbFlow, type FlowOptions } from './automatic-ab-flow';

// Tests runner
// Fill in INFRA (Environment), Scenario (from test-scenario-picker) and the LastTask if wanted.
const scenarios: FlowOptions[] = [
        { INFRA: 'alo-test', Scenario: 'Default' },
        { INFRA: 'alo-test', Scenario: 'A' },
        { INFRA: 'alo-test', Scenario: 'B' },
        { INFRA: 'alo-test', Scenario: 'C' },
        { INFRA: 'alo-test', Scenario: 'D' },
        { INFRA: 'alo-test', Scenario: 'E' },
        { INFRA: 'alo-test', Scenario: 'F' },
        { INFRA: 'alo-test', Scenario: 'G' },
        { INFRA: 'alo-test', Scenario: 'H' },
        { INFRA: 'alo-test', Scenario: 'I' },
        { INFRA: 'alo-test', Scenario: 'J' },
        { INFRA: 'alo-test', Scenario: 'K' },
        { INFRA: 'alo-test', Scenario: 'L' },
     // { INFRA: 'alo-test', Scenario: 'C', lastTask: 'vaststellen-persoon-aanvrager' },
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



