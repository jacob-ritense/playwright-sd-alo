import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';

import createVerzoekTask from './tasks/create-verzoek.spec';
import loginTask from './tasks/login.spec';
import opvoerenDienstSocratesTask from './tasks/opvoeren-dienst-socrates.spec';
import overwegenInzetHandhavingTask from './tasks/overwegen-inzet-handhaving.spec';
import overwegenUitzettenInfoverzoekTask from './tasks/overwegen-uitzetten-infoverzoek.spec';
import vaststellenPersoonAanvragerTask from './tasks/vaststellen-persoon-aanvrager.spec';

const tasks = [
  { name: 'create-verzoek', fn: createVerzoekTask },
  { name: 'login', fn: loginTask },
  { name: 'opvoeren-dienst-socrates', fn: opvoerenDienstSocratesTask },
  { name: 'overwegen-inzet-handhaving', fn: overwegenInzetHandhavingTask },
  { name: 'overwegen-uitzetten-infoverzoek', fn: overwegenUitzettenInfoverzoekTask },
  { name: 'vaststellen-persoon-aanvrager', fn: vaststellenPersoonAanvragerTask },
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