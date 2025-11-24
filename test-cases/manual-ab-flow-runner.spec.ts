// algemene-bijstand-flow.spec.ts (standalone runner)

import { test, type Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

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

type TaskFn = (page: Page, testData: TestData) => Promise<void>;

const tasks: { name: string; fn: TaskFn }[] = [
    { name: 'create-verzoek', fn: createVerzoekTask },
    { name: 'login', fn: loginTask },
    { name: 'opvoeren-dienst-socrates', fn: opvoerenDienstSocratesTask },
    { name: 'overwegen-inzet-handhaving', fn: overwegenInzetHandhavingTask },
    // { name: 'vastleggen-uitkomst-poortonderzoek', fn: uitkomstPoortonderzoekTask },
    { name: 'overwegen-uitzetten-infoverzoek', fn: overwegenUitzettenInfoverzoekTask },
    { name: 'vaststellen-persoon-aanvrager', fn: vaststellenPersoonAanvragerTask },
    { name: 'vaststellen-persoon-partner', fn: vaststellenPersoonPartnerTask },
    { name: 'vaststellen-verblijfadres-aanvrager', fn: vaststellenVerblijfadresAanvragerTask },
    { name: 'vaststellen-verblijfadres-partner', fn: vaststellenVerblijfadresPartnerTask },
    { name: 'vaststellen-verblijfstitel-aanvrager', fn: vaststellenVerblijfstitelAanvragerTask },
    { name: 'vaststellen-verblijfstitel-partner', fn: vaststellenVerblijfstitelPartnerTask },
    { name: 'vaststellen-aanvangsdatum', fn: vaststellenAanvangsdatumTask },
    { name: 'vaststellen-ingangsdatum', fn: vaststellenIngangsdatumTask },
    { name: 'vaststellen-leef-woonsituatie', fn: vaststellenLeefWoonsituatieTask },
    { name: 'vaststellen-woonsituatie', fn: vaststellenWoonsituatieTask },
    // { name: 'vaststellen-leefsituatie', fn: vaststellenLeefsituatieTask },
    { name: 'vaststellen-besluit', fn: vaststellenBesluitTask },
];

interface TestData {
    lastName: string;
    requestId: string | null;
}

// ── Reusable runner that relies on env (INFRA / API file) ──
export async function runAbFlow(page: Page) {
    const testData: TestData = {
        lastName: faker.person.lastName(),
        requestId: null,
    };
    console.log('Test data:', testData);
    console.log('Using INFRA / API settings from .env.properties');

    for (const task of tasks) {
        await test.step(`Running task: ${task.name}`, async () => {
            try {
                await task.fn(page, testData); // tasks pull INFRA & API file from env
            } catch (error) {
                console.error(`Failed during task ${task.name}:`, error);
                throw error;
            }
        });
    }
}

// ── Direct spec that just calls the runner ──
test.describe('Algemene bijstand Flow (standalone, env-based)', () => {
    test('complete algemene-bijstand-aanvraag process', async ({ page }) => {
        test.setTimeout(300_000);
        await runAbFlow(page);
    });
});




