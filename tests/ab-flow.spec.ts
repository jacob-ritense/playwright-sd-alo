import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';

import createVerzoekTask from './tasks/create-verzoek.spec';
import loginTask from './tasks/login-test.spec';
import opvoerenDienstSocratesTask from './tasks/opvoeren-dienst-socrates.spec';
import overwegenInzetHandhavingTask from './tasks/overwegen-inzet-handhaving.spec';
import overwegenUitzettenInfoverzoekTask from './tasks/overwegen-uitzetten-infoverzoek.spec';
import vaststellenPersoonAanvragerTask from './tasks/vaststellen-persoon-aanvrager.spec';
//import vaststellenPersoonPartnerTask from './tasks/vaststellen-persoon-partner.spec';
import vaststellenVerblijfadresAanvragerTask from './tasks/vaststellen-verblijfadres-aanvrager.spec';
//import vaststellenVerblijfadresPartnerTask from './tasks/vaststellen-verblijfadres-partner.spec';
//import vaststellenVerblijfstitelAanvragerTask from './tasks/vaststellen-verblijfstitel-aanvrager.spec';
//import vaststellenVerblijfstitelPartnerTask from './tasks/vaststellen-verblijfstitel-partner.spec';
import vaststellenAanvangsdatumTask from './tasks/vaststellen-aanvangsdatum.spec';
//import vaststellenIngangsdatumTask from './tasks/vaststellen-ingangsdatum.spec';
import vaststellenLeefWoonsituatieTask from './tasks/vaststellen-leef-woonsituatie.spec';
//import vaststellenWoonsituatieTask from './tasks/vaststellen-woonsituatie.spec';
import vaststellenBesluitTask from './tasks/vaststellen-besluit.spec';

const tasks = [
  { name: 'create-verzoek', fn: createVerzoekTask },
  { name: 'login', fn: loginTask },
  { name: 'opvoeren-dienst-socrates', fn: opvoerenDienstSocratesTask },
  { name: 'overwegen-inzet-handhaving', fn: overwegenInzetHandhavingTask },
  { name: 'overwegen-uitzetten-infoverzoek', fn: overwegenUitzettenInfoverzoekTask },
  { name: 'vaststellen-persoon-aanvrager', fn: vaststellenPersoonAanvragerTask },
  //{ name: 'vaststellen-persoon-partner', fn: vaststellenPersoonPartnerTask },
  { name: 'vaststellen-verblijfadres-aanvrager', fn: vaststellenVerblijfadresAanvragerTask },
  //{ name: 'vaststellen-verblijfadres-partner', fn: vaststellenVerblijfadresPartnerTask },
  //{ name: 'vaststellen-verblijfstitel-aanvrager', fn: vaststellenVerblijfstitelAanvragerTask },
  //{ name: 'vaststellen-verblijfstitel-partner', fn: vaststellenVerblijfstitelPartnerTask },
  { name: 'vaststellen-aanvangsdatum', fn: vaststellenAanvangsdatumTask },
  //{ name: 'vaststellen-ingangsdatum', fn: vaststellenIngangsdatumTask },
  { name: 'vaststellen-leef-woonsituatie', fn: vaststellenLeefWoonsituatieTask },
  //{ name: 'vaststellen-woonsituatie', fn: vaststellenWoonsituatieTask },
  { name: 'vaststellen-besluit', fn: vaststellenBesluitTask },
];

test.describe('Algemene bijstand Flow', () => {
  test('complete algemene-bijstand-aanvraag process', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes timeout for complete flow

    // Generate test data
    const testData = {
      lastName: faker.person.lastName(),
      requestId: null as string | null,
    };
    console.log('Test data:', testData);

    for (const task of tasks) {
      await test.step(`Running task: ${task.name}`, async () => {
        try {
          await task.fn(page, testData);
        } catch (error) {
          console.error(`Failed during task ${task.name}:`, error);
          throw error;
        }
      });
    }
  });
}); 
