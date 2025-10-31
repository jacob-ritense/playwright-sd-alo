// Imports used by Playwright and data generation
import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Import each concrete task implementation
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
];

// --- UI label → task.name mapping (what you see on the right panel → slug in tasks[]) ---
const uiToSlug: Record<string, (typeof tasks)[number]['name']> = {
    'Opvoeren dienst in Socrates': 'opvoeren-dienst-socrates',
    'Overwegen inzet handhaving': 'overwegen-inzet-handhaving',
    'Overwegen uitzetten informatieverzoek': 'overwegen-uitzetten-infoverzoek',
    'Vaststellen aanvangsdatum': 'vaststellen-ingangsdatum',           // alias
    'Vaststellen Ingangsdatum': 'vaststellen-ingangsdatum',            // alias
    'Vaststellen leef- en woonsituatie': 'vaststellen-leef-woonsituatie',
    'Vaststellen persoon aanvrager': 'vaststellen-persoon-aanvrager',
    'Vaststellen persoon partner': 'vaststellen-persoon-partner',
    'Selecteren verblijfadres aanvrager': 'vaststellen-verblijfadres-aanvrager',
    'Selecteren verblijfadres partner': 'vaststellen-verblijfadres-partner',
    'Vaststellen verblijfstitel aanvrager': 'vaststellen-verblijfstitel-aanvrager',
    'Vaststellen verblijfstitel partner': 'vaststellen-verblijfstitel-partner',
    'Vaststellen woonsituatie': 'vaststellen-woonsituatie',
};

// Priority order to scan UI; if you want a custom priority, reorder this array.
const uiPriority = Object.keys(uiToSlug);

// --- Small, explicit logger so failures are readable in CI output ---
const ts = () => new Date().toISOString();
const log = {
    info:  (msg: string, extra?: unknown) => console.log(`[${ts()}] INFO  ${msg}`, extra ?? ''),
    warn:  (msg: string, extra?: unknown) => console.warn(`[${ts()}] WARN  ${msg}`, extra ?? ''),
    error: (msg: string, extra?: unknown) => console.error(`[${ts()}] ERROR ${msg}`, extra ?? ''),
};

// Helper: fetch a task entry by its slug (from tasks[])
const getTaskBySlug = (slug: (typeof tasks)[number]['name']) =>
    tasks.find(t => t.name === slug)!;

// Helper: consistently wrap a task call with logging, screenshot + attachment on error
async function runTaskWithLogging(opts: {
    page: import('@playwright/test').Page;
    testData: any;
    slug: (typeof tasks)[number]['name'];
    uiLabel?: string; // optional, for context when triggered by UI
}) {
    const { page, testData, slug, uiLabel } = opts;
    const title = uiLabel ? `${slug} (via "${uiLabel}")` : slug;

    await test.step(`Run task: ${title}`, async () => {
        log.info(`Starting task "${title}"`);
        try {
            await getTaskBySlug(slug).fn(page, testData);           // execute the actual task function
            log.info(`Finished task "${title}" OK`);
        } catch (e: any) {
            log.error(`Task "${title}" failed`, e && e.stack ? e.stack : e);
            // Take a screenshot for debugging and attach to the report
            const file = `error-${slug}-${Date.now()}.png`;
            await page.screenshot({ path: file, fullPage: true });
            await test.info().attach(`screenshot-${slug}`, {
                path: file,
                contentType: 'image/png',
            });
            // Re-throw so the test fails visibly
            throw e;
        }
    });
}

// Helper: check the “Helemaal bij!” banner state (bounded errors)
const isHelemaalBijVisible = async (page: import('@playwright/test').Page) => {
    try {
        return await page.getByText('Helemaal bij!', { exact: false }).isVisible();
    } catch {
        return false;
    }
};

test.describe('Algehele AB Flow', () => {
    test('complete algemene-bijstand-aanvraag process', async ({ page }) => {
        test.setTimeout(300_000);                                    // cap the overall test time

        // Minimal test data you were already generating
        const testData = {
            lastName: faker.person.lastName(),
            requestId: null as string | null,
        };
        log.info('Generated testData', testData);

        // --- ALWAYS RUN FIRST: prerequisites not driven by UI panel ---
        await runTaskWithLogging({ page, testData, slug: 'create-verzoek' });
        await runTaskWithLogging({ page, testData, slug: 'login' });

        // Prepare the set of remaining tasks (exclude the two prerequisites)
        const pending = new Set(
            tasks.map(t => t.name).filter(n => n !== 'create-verzoek' && n !== 'login')
        );

        // Controls for the polling/refresh strategy
        const cycleTimes = 10;                                       // how many full UI scans before we error
        const refreshDelayMs = 4000;                                 // wait after reload
        const bannerMaxWaitMs = 30_000;                              // max time to wait for banner to disappear
        const pollMs = 500;                                          // banner poll frequency

        // Main loop: keep going until all tasks have been executed
        while (pending.size > 0) {
            // 1) Wait (briefly) for “Helemaal bij!” to not be visible; don’t hard-block forever
            const bannerStart = Date.now();
            while (Date.now() - bannerStart < bannerMaxWaitMs) {
                const visible = await isHelemaalBijVisible(page);
                if (!visible) break;
                await page.waitForTimeout(pollMs);
            }

            let executed = false;                                      // track if we ran something this round

            // 2) Try up to cycleTimes to discover a visible UI label → run its task
            for (let cycle = 0; cycle < cycleTimes && !executed; cycle++) {
                log.info(`UI scan cycle ${cycle + 1}/${cycleTimes}. Pending: ${[...pending].join(', ') || '(none)'}`);

                for (const uiLabel of uiPriority) {
                    const slug = uiToSlug[uiLabel];
                    if (!pending.has(slug)) continue;                      // skip if already completed

                    // TIP: if the right panel has a selector, scope here to reduce false positives.
                    // const panel = page.locator('[data-testid="task-sidebar"]');
                    // const el = panel.getByRole('link', { name: uiLabel });
                    const el = page.getByText(uiLabel, { exact: true });   // current generic locator

                    if (await el.first().isVisible()) {                    // found a visible label
                        log.info(`Found UI label "${uiLabel}" → executing task "${slug}"`);
                        await runTaskWithLogging({ page, testData, slug, uiLabel });
                        pending.delete(slug);                                // mark complete
                        executed = true;                                     // exit both loops after this cycle
                        break;
                    }
                }

                // If nothing found this cycle: refresh and retry
                if (!executed) {
                    log.warn(`No tasks visible this cycle; reloading and waiting ${refreshDelayMs}ms`);
                    try {
                        await page.reload({ waitUntil: 'domcontentloaded' });
                    } catch (e) {
                        log.error('Reload failed', e);
                    }
                    await page.waitForTimeout(refreshDelayMs);
                }
            }

            // After cycleTimes, if still no task executed → fail fast with context
            if (!executed) {
                const snapshot = `not-found-${Date.now()}.png`;
                await page.screenshot({ path: snapshot, fullPage: true });
                await test.info().attach('not-found-screenshot', { path: snapshot, contentType: 'image/png' });
                const message = `Geen taken gevonden na ${cycleTimes} cycli. Nog open: ${[...pending].join(', ')}`;
                log.error(message);
                throw new Error(message);
            }
        }

        // Final sanity check: end state should show “Helemaal bij!”
        await test.step('Eindcontrole: “Helemaal bij!” zichtbaar', async () => {
            log.info('Checking final state: expecting "Helemaal bij!" to be visible');
            await expect(page.getByText('Helemaal bij!', { exact: false })).toBeVisible({ timeout: 10_000 });
        });
    });
});

