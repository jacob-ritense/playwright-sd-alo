
// automatic-ab-flow.ts
import { test, expect } from '@playwright/test';
import type { LoginEnvironment } from '../tests/helper-functions/utils';
import {
    setActiveScenario,
    getActiveScenarioSteps,
    getActiveRequestFile,
    SCENARIOS,
    type ScenarioKey,
} from './test-scenario-picker';

import createVerzoekTask from '../tests/tasks/create-verzoek.spec';
import loginTask from '../tests/tasks/login-navigate-case.spec';
import opvoerenDienstSocratesTask from '../tests/tasks/opvoeren-dienst-socrates.spec';
import overwegenInzetHandhavingTask from '../tests/tasks/overwegen-inzet-handhaving.spec';
import uitkomstPoortonderzoekTask from '../tests/tasks/vastleggen-uitkomst-poortonderzoek.spec';
import overwegenUitzettenInfoverzoekTask from '../tests/tasks/overwegen-uitzetten-infoverzoek.spec';
import vaststellenPersoonAanvragerTask from '../tests/tasks/vaststellen-persoon-aanvrager.spec';
import vaststellenPersoonPartnerTask from '../tests/tasks/vaststellen-persoon-partner.spec';
import vaststellenVerblijfadresAanvragerTask from '../tests/tasks/vaststellen-verblijfadres-aanvrager.spec';
import vaststellenVerblijfadresPartnerTask from '../tests/tasks/vaststellen-verblijfadres-partner.spec';
import vaststellenVerblijfstitelAanvragerTask from '../tests/tasks/vaststellen-verblijfstitel-aanvrager.spec';
import vaststellenVerblijfstitelPartnerTask from '../tests/tasks/vaststellen-verblijfstitel-partner.spec';
import vaststellenAanvangsdatumTask from '../tests/tasks/vaststellen-aanvangsdatum.spec';
import vaststellenIngangsdatumTask from '../tests/tasks/vaststellen-ingangsdatum.spec';
import vaststellenLeefWoonsituatieTask from '../tests/tasks/vaststellen-leef-woonsituatie.spec';
import vaststellenWoonsituatieTask from '../tests/tasks/vaststellen-woonsituatie.spec';
import vaststellenLeefsituatieTask from '../tests/tasks/vaststellen-leefsituatie.spec';
import vaststellenBesluitTask from '../tests/tasks/vaststellen-besluit.spec';
import adhocTask from '../tests/tasks/adhoc-tasks/adhoc-tasks.spec';

export type FlowSlug =
    | 'create-verzoek'
    | 'login'
    | 'opvoeren-dienst-socrates'
    | 'overwegen-inzet-handhaving'
    | 'overwegen-uitzetten-infoverzoek'
    | 'vaststellen-persoon-aanvrager'
    | 'vaststellen-persoon-partner'
    | 'vaststellen-verblijfadres-aanvrager'
    | 'vaststellen-verblijfadres-partner'
    | 'vaststellen-verblijfstitel-aanvrager'
    | 'vaststellen-verblijfstitel-partner'
    | 'vaststellen-aanvangsdatum'
    | 'vaststellen-ingangsdatum'
    | 'vaststellen-leef-woonsituatie'
    | 'vaststellen-woonsituatie'
    | 'vastleggen-uitkomst-poortonderzoek'
    | 'vaststellen-leefsituatie'
    | 'vaststellen-besluit'
    | 'adhoc-task';

export type FlowOptions = {
    API_TEST_REQUEST_FILE?: string;
    INFRA: LoginEnvironment;
    Scenario: ScenarioKey;
    lastTask?: FlowSlug;
};

export interface TestData {
    publicReference: string | null;
    requestId: string | null;
    options?: FlowOptions & { API_TEST_REQUEST_FILE: string };
}

const tasks = [
    {name: 'create-verzoek', fn: createVerzoekTask},
    {name: 'login', fn: loginTask},
    {name: 'opvoeren-dienst-socrates', fn: opvoerenDienstSocratesTask},
    {name: 'overwegen-inzet-handhaving', fn: overwegenInzetHandhavingTask},
    {name: 'vastleggen-uitkomst-poortonderzoek', fn: uitkomstPoortonderzoekTask},
    {name: 'overwegen-uitzetten-infoverzoek', fn: overwegenUitzettenInfoverzoekTask},
    {name: 'vaststellen-persoon-aanvrager', fn: vaststellenPersoonAanvragerTask},
    {name: 'vaststellen-persoon-partner', fn: vaststellenPersoonPartnerTask},
    {name: 'vaststellen-verblijfadres-aanvrager', fn: vaststellenVerblijfadresAanvragerTask},
    {name: 'vaststellen-verblijfadres-partner', fn: vaststellenVerblijfadresPartnerTask},
    {name: 'vaststellen-verblijfstitel-aanvrager', fn: vaststellenVerblijfstitelAanvragerTask},
    {name: 'vaststellen-verblijfstitel-partner', fn: vaststellenVerblijfstitelPartnerTask},
    {name: 'vaststellen-aanvangsdatum', fn: vaststellenAanvangsdatumTask},
    {name: 'vaststellen-ingangsdatum', fn: vaststellenIngangsdatumTask},
    {name: 'vaststellen-leef-woonsituatie', fn: vaststellenLeefWoonsituatieTask},
    {name: 'vaststellen-woonsituatie', fn: vaststellenWoonsituatieTask},
    {name: 'vaststellen-leefsituatie', fn: vaststellenLeefsituatieTask},
    {name: 'vaststellen-besluit', fn: vaststellenBesluitTask},
    {name: 'adhoc-task', fn: adhocTask},
] as const;

const getTaskBySlug = (slug: (typeof tasks)[number]['name']) => tasks.find(t => t.name === slug)!;

const ts = () => new Date().toISOString();
const log = {
    info:  (m: string, x?: unknown) => console.log(`[${ts()}] INFO  ${m}`, x ?? ''),
    warn:  (m: string, x?: unknown) => console.warn(`[${ts()}] WARN  ${m}`, x ?? ''),
    error: (m: string, x?: unknown) => console.error(`[${ts()}] ERROR ${m}`, x ?? ''),
};

async function runTaskWithLogging(page: import('@playwright/test').Page, testData: any, slug: FlowSlug, label?: string) {
    const title = label ? `${slug} (${label})` : slug;
    await test.step(`Run task: ${title}`, async () => {
        log.info(`Starting task "${title}"`);
        try {
            await getTaskBySlug(slug).fn(page, testData);
            log.info(`Finished task "${title}" OK`);
        } catch (e: any) {
            log.error(`Task "${title}" failed`, e?.stack ?? e);
            const file = `error-${slug}-${Date.now()}.png`;
            await page.screenshot({ path: file, fullPage: true });
            await test.info().attach(`screenshot-${slug}`, { path: file, contentType: 'image/png' });
            throw e;
        }
    });
}

// MAIN TEST FLOW
export async function runAbFlow(page: import('@playwright/test').Page, options: FlowOptions) {
    test.setTimeout(600_000);

    const scenarioKey = options.Scenario;
    setActiveScenario(scenarioKey);
    console.log(`Scenario selected: ${scenarioKey} -> ${SCENARIOS[scenarioKey]}`);

    // Get the request file ("verzoek") to use for the test (from the ab-flow-runner)
    const apiFile = options.API_TEST_REQUEST_FILE ?? getActiveRequestFile();

    const testData: TestData = {
        publicReference: null,
        requestId: null,
        options: { ...options, API_TEST_REQUEST_FILE: apiFile },
    };

    log.info('Flow options', options);

    // 🔹 Always run these two first: Create verzoek and login.
    await runTaskWithLogging(page, testData, 'create-verzoek');
    await runTaskWithLogging(page, testData, 'login');

    // 🔹 Then execute tasks exactly in scenario order
    const steps = getActiveScenarioSteps();
    for (const step of steps) {
        const slug = step.taskId as FlowSlug;

        const task = tasks.find(t => t.name === slug);
        if (!task) {
            throw new Error(
                `Scenario "${scenarioKey}" step #${step.num} -> "${slug}" has no task implementation.`
            );
        }

        await runTaskWithLogging(page, testData, slug, `step ${step.num}${step.option ?? ''}`);

        if (options.lastTask && slug === options.lastTask) {
            log.info(`Stopping early at lastTask="${options.lastTask}"`);
            break;
        }
    }

// Final check, check for "Lopende bezwaartermijn".
    await test.step('Eindcontrole: Lopende bezwaartermijn', async () => {
        log.info('Waiting 5 seconds before navigating to "Voortgang"...');
        await page.waitForTimeout(5_000);

        log.info('Navigating to "Voortgang" tab...');
        await page.getByRole('tab', { name: 'Voortgang' }).click();

        const target = page.getByText('lopende bezwaartermijn', { exact: false });

        try {
            log.info('Expecting "lopende bezwaartermijn" to be visible (first attempt)...');
            await expect(target).toBeVisible({ timeout: 10_000 });
        } catch {
            log.warn('"lopende bezwaartermijn" not found, reloading page and retrying once...');
            await page.reload();

            log.info('Navigating again to "Voortgang" tab...');
            await page.getByRole('tab', { name: 'Voortgang' }).click();

            await expect(target).toBeVisible({ timeout: 5_000 });
        }

        log.info('Navigating back to "Algemeen" tab...');
        await page.getByRole('tab', { name: 'Algemeen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 10000 });
    });

}
