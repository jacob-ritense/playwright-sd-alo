import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';

import createVerzoekTask from './tasks/create-verzoek.spec';
import loginTask from './tasks/login.spec';
import opvoerenDienstSocratesTask from './tasks/opvoeren-dienst-socrates.spec';
import overwegenInzetHandhavingTask from './tasks/overwegen-inzet-handhaving.spec';
import overwegenUitzettenInfoverzoekTask from './tasks/overwegen-uitzetten-infoverzoek.spec';
import vaststellenPersoonAanvragerTask from './tasks/vaststellen-persoon-aanvrager.spec';
import vaststellenPersoonPartnerTask from './tasks/vaststellen-persoon-partner.spec';
import verblijfadresAanvragerTask from './tasks/verblijfadres-aanvrager.spec';
import verblijfadresPartnerTask from './tasks/verblijfadres-partner.spec';
import verblijfstitelAanvragerTask from './tasks/verblijfstitel-aanvrager.spec';
import verblijfstitelPartnerTask from './tasks/verblijfstitel-partner.spec';
import inangsdatumTask from './tasks/inangsdatum.spec';

const tasks = [
  { name: 'create-verzoek', fn: createVerzoekTask },
  { name: 'login', fn: loginTask },
  { name: 'opvoeren-dienst-socrates', fn: opvoerenDienstSocratesTask },
  { name: 'overwegen-inzet-handhaving', fn: overwegenInzetHandhavingTask },
  { name: 'overwegen-uitzetten-infoverzoek', fn: overwegenUitzettenInfoverzoekTask },
  { name: 'vaststellen-persoon-aanvrager', fn: vaststellenPersoonAanvragerTask },
  { name: 'vaststellen-persoon-partner', fn: vaststellenPersoonPartnerTask },
  { name: 'verblijfadres-aanvrager', fn: verblijfadresAanvragerTask },
  { name: 'verblijfadres-partner', fn: verblijfadresPartnerTask },
  { name: 'verblijfstitel-aanvrager', fn: verblijfstitelAanvragerTask },
  { name: 'verblijfstitel-partner', fn: verblijfstitelPartnerTask },
  { name: 'inangsdatum', fn: inangsdatumTask },
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
