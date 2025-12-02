// tasks/uploaden-ontvangen-documenten.spec.ts
import { Page } from '@playwright/test';
import { openTask  } from '../../helper-functions/utils';
import {faker} from "@faker-js/faker";

export default async function uploadenOntvangenDocumentenTask(page: Page) {
    const taskName = 'Uploaden ontvangen documenten';

    try {
        await openTask(page, taskName);

        // Fill in form
        const toelichtingText = faker.lorem.words(5);
        console.log(`Filling "Toelichting van de aanvrager" with: "${toelichtingText}"`);
        await page.getByRole('textbox', { name: 'Toelichting van de aanvrager' }).fill(toelichtingText);
        console.log(`Checking "Bestand geupload"`);
        await page.getByRole('checkbox', { name: 'Bestand geupload *' }).check();

        // Completing task
        console.log('Clicking "Doorgaan" button...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        await page.waitForTimeout(2_000);

        console.log(`Successfully completed task "${taskName}".`);
    } catch (error) {
        console.error(`Failed during "${taskName}" task processing:`, error);
        try {
            await page.screenshot({
                path: 'uploaden-ontvangen-documenten-error.png',
                fullPage: true,
            });
            console.log('Screenshot saved as uploaden-ontvangen-documenten-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}