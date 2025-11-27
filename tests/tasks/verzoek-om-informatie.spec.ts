// tasks/verzoek-om-informatie.spec.ts
import { Page } from '@playwright/test';
import { openTask  } from '../helper-functions/utils';
import {faker} from "@faker-js/faker";

export default async function verzoekOmInformatieTask(page: Page) {
    const taskName = 'Verzoek om informatie';

    try {
        await openTask(page, taskName);

        // Fill in form
        const toelichtingText = faker.lorem.words(5);
        console.log(`Filling "Bericht aan aanvrager" with: "${toelichtingText}"`);
        await page.getByRole('textbox', { name: 'Bericht aan aanvrager' }).fill(toelichtingText);

        console.log(`Selecting "Ja" on radio button "Herstel termijn van toepassing?"`);
        await page.getByRole('radio', { name: 'Ja' }).check();

        // File "beschikking" upload
        const filePath = 'context-files/test-beschikking.txt';
        console.log(`Selecting document "${filePath}" for upload...`);

        // Generic file input (no undefined dropZone / taskName)
        let fileInput = page
            .locator(
                'xpath=//div[contains(@class,"formio-component")]//input[@type="file"]'
            )
            .first();

        if (!(await fileInput.count())) {
            console.log(
                'Specific formio file input not found, falling back to first input[type="file"]'
            );
            fileInput = page.locator('input[type="file"]').first();
        }

        await fileInput.setInputFiles(filePath);
        console.log(`Document "${filePath}" selected, confirming upload...`);

        const opslaanButton = page
            .getByRole('button', { name: /^Opslaan$/i })
            .first();
        console.log('Waiting for "Opslaan" button to be visible...');
        await opslaanButton.waitFor({ state: 'visible', timeout: 15_000 });
        console.log('Clicking "Opslaan" button...');
        await opslaanButton.click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        await page.waitForTimeout(1_000);

        // Completing task
        console.log('Clicking "Informatieverzoek uitzetten" button...');
        await page.getByRole('button', { name: 'Informatieverzoek uitzetten' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        await page.waitForTimeout(2_000);

        console.log(`Successfully completed task "${taskName}".`);
    } catch (error) {
        console.error(`Failed during "${taskName}" task processing:`, error);
        try {
            await page.screenshot({
                path: 'verzoek-om-informatie-error.png',
                fullPage: true,
            });
            console.log('Screenshot saved as verzoek-om-informatie-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}