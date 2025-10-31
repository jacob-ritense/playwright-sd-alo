
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

import createVerzoekTask from './tasks/create-verzoek.spec';
import loginTask from './tasks/login.spec';
import opvoerenDienstSocratesTask from './tasks/opvoeren-dienst-socrates.spec';
import overwegenInzetHandhavingTask from './tasks/overwegen-inzet-handhaving.spec';
import overwegenUitzettenInfoverzoekTask from './tasks/overwegen-uitzetten-infoverzoek.spec';
import vaststellenPersoonAanvragerTask from './tasks/vaststellen-persoon-aanvrager.spec';
import vaststellenPersoonPartnerTask from './tasks/vaststellen-persoon-partner.spec';
import vaststellenVerblijfadresAanvragerTask from './tasks/vaststellen-verblijfadres-aanvrager.spec';
import vaststellenVerblijfadresPartnerTask from './tasks/vaststellen-verblijfadres-partner.spec';
import vaststellenVerblijfstitelAanvragerTask from './tasks/vaststellen-verblijfstitel-aanvrager.spec';
import vaststellenVerblijfstitelPartnerTask from './tasks/vaststellen-verblijfstitel-partner.spec';
import vaststellenIngangsdatumTask from './tasks/vaststellen-ingangsdatum.spec';
import vaststellenLeefWoonsituatieTask from './tasks/vaststellen-leef-woonsituatie.spec';
import vaststellenWoonsituatieTask from './tasks/vaststellen-woonsituatie.spec';

export type FlowSlug =
    | 'create-verzoek' | 'login'
    | 'opvoeren-dienst-socrates'
    | 'overwegen-inzet-handhaving'
    | 'overwegen-uitzetten-infoverzoek'
    | 'vaststellen-persoon-aanvrager'
    | 'vaststellen-persoon-partner'
    | 'vaststellen-verblijfadres-aanvrager'
    | 'vaststellen-verblijfadres-partner'
    | 'vaststellen-verblijfstitel-aanvrager'
    | 'vaststellen-verblijfstitel-partner'
    | 'vaststellen-ingangsdatum'
    | 'vaststellen-leef-woonsituatie'
    | 'vaststellen-woonsituatie';

export type FlowOptions = {
    API_TEST_REQUEST_FILE: string;
    INFRA: string;         // e.g. 'DEV' | 'ACC' | 'PROD'
    Scenario: string;      // free-form scenario name
    lastTask?: FlowSlug;   // stop after this task completes
    cycleTimes?: number;   // override default 10
};

export interface TestData {
    lastName: string;
    requestId: string | null;
    options: FlowOptions; // 👈 this is the link
}

const tasks = [
    { name: 'create-verzoek', fn: createVerzoekTask },
    { name: 'login', fn: loginTask },
    { name: 'opvoeren-dienst-socrates', fn: opvoerenDienstSocratesTask },
    { name: 'overwegen-inzet-handhaving', fn: overwegenInzetHandhavingTask },
    { name: 'overwegen-uitzetten-infoverzoek', fn: overwegenUitzettenInfoverzoekTask },
    { name: 'vaststellen-persoon-aanvrager', fn: vaststellenPersoonAanvragerTask },
    { name: 'vaststellen-persoon-partner', fn: vaststellenPersoonPartnerTask },
    { name: 'vaststellen-verblijfadres-aanvrager', fn: vaststellenVerblijfadresAanvragerTask },
    { name: 'vaststellen-verblijfadres-partner', fn: vaststellenVerblijfadresPartnerTask },
    { name: 'vaststellen-verblijfstitel-aanvrager', fn: vaststellenVerblijfstitelAanvragerTask },
    { name: 'vaststellen-verblijfstitel-partner', fn: vaststellenVerblijfstitelPartnerTask },
    { name: 'vaststellen-ingangsdatum', fn: vaststellenIngangsdatumTask },
    { name: 'vaststellen-leef-woonsituatie', fn: vaststellenLeefWoonsituatieTask },
    { name: 'vaststellen-woonsituatie', fn: vaststellenWoonsituatieTask },
] as const;

const uiToSlug: Record<string, (typeof tasks)[number]['name']> = {
    'Opvoeren dienst in Socrates': 'opvoeren-dienst-socrates',
    'Overwegen inzet handhaving': 'overwegen-inzet-handhaving',
    'Overwegen uitzetten informatieverzoek': 'overwegen-uitzetten-infoverzoek',
    'Vaststellen aanvangsdatum': 'vaststellen-ingangsdatum',
    'Vaststellen Ingangsdatum': 'vaststellen-ingangsdatum',
    'Vaststellen leef- en woonsituatie': 'vaststellen-leef-woonsituatie',
    'Vaststellen persoon aanvrager': 'vaststellen-persoon-aanvrager',
    'Vaststellen persoon partner': 'vaststellen-persoon-partner',
    'Selecteren verblijfadres aanvrager': 'vaststellen-verblijfadres-aanvrager',
    'Selecteren verblijfadres partner': 'vaststellen-verblijfadres-partner',
    'Vaststellen verblijfstitel aanvrager': 'vaststellen-verblijfstitel-aanvrager',
    'Vaststellen verblijfstitel partner': 'vaststellen-verblijfstitel-partner',
    'Vaststellen woonsituatie': 'vaststellen-woonsituatie',
};
const uiPriority = Object.keys(uiToSlug);
const getTaskBySlug = (slug: (typeof tasks)[number]['name']) => tasks.find(t => t.name === slug)!;

const ts = () => new Date().toISOString();
const log = {
    info:  (m: string, x?: unknown) => console.log(`[${ts()}] INFO  ${m}`, x ?? ''),
    warn:  (m: string, x?: unknown) => console.warn(`[${ts()}] WARN  ${m}`, x ?? ''),
    error: (m: string, x?: unknown) => console.error(`[${ts()}] ERROR ${m}`, x ?? ''),
};

async function runTaskWithLogging(page: import('@playwright/test').Page, testData: any, slug: FlowSlug, uiLabel?: string) {
    const title = uiLabel ? `${slug} (via "${uiLabel}")` : slug;
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

const isHelemaalBijVisible = async (page: import('@playwright/test').Page) => {
    try { return await page.getByText('Helemaal bij!', { exact: false }).isVisible(); } catch { return false; }
};

export async function runAbFlow(page: import('@playwright/test').Page, options: FlowOptions) {
    test.setTimeout(300_000);

    // Thread options through to tasks via testData
    const testData = {
        lastName: faker.person.lastName(),
        requestId: null as string | null,
        options, // <- tasks can read API_TEST_REQUEST_FILE / INFRA / Scenario / lastTask
    };
    log.info('Flow options', options);

    await runTaskWithLogging(page, testData, 'create-verzoek');
    await runTaskWithLogging(page, testData, 'login');

    const pending = new Set<FlowSlug>(
        tasks.map(t => t.name).filter(n => n !== 'create-verzoek' && n !== 'login') as FlowSlug[]
    );

    const cycleTimes = options.cycleTimes ?? 10;
    const refreshDelayMs = 4000;
    const bannerMaxWaitMs = 40_000;
    const pollMs = 500;

    while (pending.size > 0) {
        const start = Date.now();
        while (Date.now() - start < bannerMaxWaitMs) {
            if (!(await isHelemaalBijVisible(page))) break;
            await page.waitForTimeout(pollMs);
        }

        let executed = false;

        for (let cycle = 0; cycle < cycleTimes && !executed; cycle++) {
            log.info(`UI scan cycle ${cycle + 1}/${cycleTimes}. Pending: ${[...pending].join(', ') || '(none)'}`);
            for (const uiLabel of uiPriority) {
                const slug = uiToSlug[uiLabel] as FlowSlug;
                if (!pending.has(slug)) continue;

                const el = page.getByText(uiLabel, { exact: true });
                if (await el.first().isVisible()) {
                    log.info(`Found "${uiLabel}" → task "${slug}"`);
                    await runTaskWithLogging(page, testData, slug, uiLabel);
                    pending.delete(slug);
                    executed = true;

                    // If a stop point is configured, quit after we finished it.
                    if (options.lastTask && slug === options.lastTask) {
                        log.info(`Stopping early at lastTask="${options.lastTask}"`);
                        pending.clear();
                    }
                    break;
                }
            }

            if (!executed) {
                log.warn(`No tasks visible this cycle; reload + wait`);
                try { await page.reload({ waitUntil: 'domcontentloaded' }); } catch (e) { log.error('Reload failed', e); }
                await page.waitForTimeout(refreshDelayMs);
            }
        }

        if (!executed && pending.size > 0) {
            const snap = `not-found-${Date.now()}.png`;
            await page.screenshot({ path: snap, fullPage: true });
            await test.info().attach('not-found-screenshot', { path: snap, contentType: 'image/png' });
            const msg = `Geen taken gevonden na ${cycleTimes} cycli. Nog open: ${[...pending].join(', ')}`;
            log.error(msg);
            throw new Error(msg);
        }
    }

    await test.step('Eindcontrole: “Helemaal bij!” zichtbaar', async () => {
        log.info('Expecting "Helemaal bij!" visible');
        await expect(page.getByText('Helemaal bij!', { exact: false })).toBeVisible({ timeout: 10_000 });
    });
}
