
// multi-function-ab-flow.ts
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
    setActiveScenario,
    getActiveScenarioSteps,
    getOptionForTask,
    SCENARIOS,
    type ScenarioKey,
} from '../test-cases/scenarios/test-scenario-picker';

import createVerzoekTask from './tasks/create-verzoek.spec';
import loginTask from './tasks/login-test.spec';
import opvoerenDienstSocratesTask from './tasks/opvoeren-dienst-socrates.spec';
import overwegenInzetHandhavingTask from './tasks/overwegen-inzet-handhaving.spec';
import uitkomstPoortonderzoekTask from './tasks/vastleggen-uitkomst-poortonderzoek.spec';
import overwegenUitzettenInfoverzoekTask from './tasks/overwegen-uitzetten-infoverzoek.spec';
import vaststellenPersoonAanvragerTask from './tasks/vaststellen-persoon-aanvrager.spec';
import vaststellenPersoonPartnerTask from './tasks/vaststellen-persoon-partner.spec';
import vaststellenVerblijfadresAanvragerTask from './tasks/vaststellen-verblijfadres-aanvrager.spec';
import vaststellenVerblijfadresPartnerTask from './tasks/vaststellen-verblijfadres-partner.spec';
import vaststellenVerblijfstitelAanvragerTask from './tasks/vaststellen-verblijfstitel-aanvrager.spec';
import vaststellenVerblijfstitelPartnerTask from './tasks/vaststellen-verblijfstitel-partner.spec';
import vaststellenAanvangsdatumTask from './tasks/vaststellen-aanvangsdatum.spec';
import vaststellenIngangsdatumTask from './tasks/vaststellen-ingangsdatum.spec';
import vaststellenLeefWoonsituatieTask from './tasks/vaststellen-leef-woonsituatie.spec';
import vaststellenWoonsituatieTask from './tasks/vaststellen-woonsituatie.spec';
import vaststellenLeefsituatieTask from './tasks/vaststellen-leefsituatie.spec';
import vaststellenBesluitTask from './tasks/vaststellen-besluit.spec';
import { resolveFlowEnvironment, type FlowEnvironment } from './tasks/utils';

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
    | 'vaststellen-besluit';

export type FlowOptions = {
    API_TEST_REQUEST_FILE: string;
    INFRA: string;
    Scenario: ScenarioKey;     // required now
    lastTask?: FlowSlug;
};

export interface TestData {
    lastName: string;
    requestId: string | null;
    options: FlowOptions;
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


export async function runAbFlow(page: import('@playwright/test').Page, options: FlowOptions) {
    test.setTimeout(300_000);

    // Only use the test-provided scenario
    const scenarioKey = options.Scenario;
    setActiveScenario(scenarioKey);
    console.log(`Scenario selected: ${scenarioKey} -> ${SCENARIOS[scenarioKey]}`);

    const testData: TestData = {
        lastName: faker.person.lastName(),
        requestId: null,
        options,
    };
    log.info('Flow options', options);

    // Execute exactly in scenario order
    const steps = getActiveScenarioSteps(); // [{num, taskId, option?}] ordered
    for (const step of steps) {
        const slug = step.taskId as FlowSlug;

        const task = tasks.find(t => t.name === slug);
        if (!task) {
            throw new Error(`Scenario "${scenarioKey}" step #${step.num} -> "${slug}" has no task implementation.`);
        }

        // Tasks can call getOptionForTask(slug) to read A/B/C/...
        await runTaskWithLogging(page, testData, slug, `step ${step.num}${step.option ?? ''}`);

        if (options.lastTask && slug === options.lastTask) {
            log.info(`Stopping early at lastTask="${options.lastTask}"`);
            break;
        }
    }

    await test.step('Eindcontrole: “Helemaal bij!” zichtbaar', async () => {
        log.info('Expecting "Helemaal bij!" visible');
        await expect(page.getByText('Helemaal bij!', { exact: false })).toBeVisible({ timeout: 10_000 });
    });
}