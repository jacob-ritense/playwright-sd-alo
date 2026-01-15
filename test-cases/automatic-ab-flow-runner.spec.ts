import { test } from '@playwright/test';
import { runAbFlow, type FlowOptions } from './automatic-ab-flow';

// Tests runner
// Fill in INFRA (Environment), Scenario (from test-scenario-picker) and the LastTask if wanted.
const scenarios: FlowOptions[] = [
        { INFRA: 'alo-test', Scenario: 'Default' },
        { INFRA: 'alo-acc', Scenario: 'Default' },
        { INFRA: 'alo-acc', Scenario: 'A' },
        { INFRA: 'alo-acc', Scenario: 'B' },
        { INFRA: 'alo-acc', Scenario: 'C' },
        { INFRA: 'alo-acc', Scenario: 'D' },
        { INFRA: 'alo-acc', Scenario: 'E' },
        { INFRA: 'alo-acc', Scenario: 'F' },
        { INFRA: 'alo-acc', Scenario: 'G' },
        { INFRA: 'alo-acc', Scenario: 'H' },
        { INFRA: 'alo-acc', Scenario: 'I' },
        { INFRA: 'alo-acc', Scenario: 'J' },
        { INFRA: 'alo-acc', Scenario: 'K' },
        { INFRA: 'alo-acc', Scenario: 'L' },
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



