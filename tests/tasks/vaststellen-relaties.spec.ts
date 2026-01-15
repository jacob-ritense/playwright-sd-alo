import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { openTask } from '../helper-functions/utils';

export default async function RelatiesTask(page: Page) {
    const taskName = 'Vaststellen Relaties';

    try {
        await openTask(page, taskName);

        // Remove all buttons
        const removeButtons = page
            .getByRole('row')
            .getByLabel('remove', { exact: true });

        // 1) Remove extra rows until only one row remains
        while ((await removeButtons.count()) > 1) {
            await removeButtons.first().click();
            await page.waitForTimeout(500);
        }

        // 2) Clear the remaining row (UI keeps 1 row around)
        if ((await removeButtons.count()) === 1) {
            await removeButtons.first().click();
            await page.waitForTimeout(500);
        }

        // Fill in a form entry
        console.log(`[${taskName}] Filling in Relaties Form...`);

        // Voor en achternaam
        await page.getByRole('textbox', { name: 'Voornamen *' }).click();
        await page.getByRole('textbox', { name: 'Voornamen *' }).fill('Voornaam 1');
        await page.getByRole('textbox', { name: 'Achternaam *' }).click();
        await page.getByRole('textbox', { name: 'Achternaam *' }).fill('Achternaam 1');

        // Datum handling
        const today = new Date();
        const formattedDate =
            String(today.getDate()).padStart(2, '0') + '-' +
            String(today.getMonth() + 1).padStart(2, '0') + '-' +
            today.getFullYear() + '_';

        const dateTextboxInField = async (label: string) => {
            const labelLocator = page.getByText(label, { exact: false });
            await labelLocator.scrollIntoViewIfNeeded();
            await labelLocator.waitFor({ state: 'visible' });

            return labelLocator.locator('..').getByRole('textbox').first();
        };

        // Geboortedatum
        await (await dateTextboxInField('Geboortedatum')).fill(formattedDate);
        await page.getByText('Vaststellen Relaties', { exact: true }).click();

        // Relatietype
        await page.locator('.choices > div').first().click();
        await page.getByRole('option', { name: 'Ouder Kind' }).click();

        // Begindatum relatie
        await (await dateTextboxInField('Begindatum relatie')).fill(formattedDate);
        await page.getByText('Vaststellen Relaties', { exact: true }).click();

        // Radio buttons
        await page.getByRole('radio', { name: 'Aanvrager en partner' }).check();
        await page.getByRole('radiogroup', { name: 'Indicatie kinderbijslag *' }).getByLabel('Nee').check();
        await page.getByRole('radiogroup', { name: 'Is kostendeler *' }).getByLabel('Nee').check();
        await page.getByRole('checkbox', { name: 'Leeftijd <' }).check();


        // Toelichting
        const toelichting = faker.lorem.sentence();
        console.log(`[${taskName}] Filling "Toelichting" with "${toelichting}"`);
        await page
            .getByTestId('bs-216-vaststelling-relaties-pv.toelichting')
            .fill(toelichting);

        // Volgende & Indienen
        console.log(`[${taskName}] Clicking "Volgende"...`);
        await page.getByRole('button', { name: 'Volgende' }).click();

        console.log(`[${taskName}] Clicking "Indienen"...`);
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        console.log(`[${taskName}] Task completed.`);
    } catch (error) {
        console.error(`[${taskName}] Failed during task:`, error);

        try {
            await page.screenshot({ path: 'vaststellen-relaties-error.png', fullPage: true });
            console.log(`[${taskName}] Screenshot saved.`);
        } catch (screenshotError) {
            console.error(`[${taskName}] Failed saving screenshot:`, screenshotError);
        }

        throw error;
    }
}
