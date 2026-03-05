import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { openTask } from '../helper-functions/utils';

export default async function vaststellenVermogenTask(page: Page) {
    const taskName = 'Vaststellen vermogens componenten';

    try {
        await openTask(page, taskName);

        // 1st page
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

        // Fill in "Waarde"
        await page.locator('#currency').click();
        await page.locator('#currency').fill('€ 20,000');

        // Toelichting
        const toelichting = faker.lorem.sentence();
        console.log(`[${taskName}] Filling "Toelichting" with "${toelichting}"`);
        await page.getByTestId('bs-214-vaststellen-bankrekeningen-pv.bankrekeningenToelichting').fill(toelichting);

        // Volgende
        await page.getByRole('button', { name: 'Volgende' }).click();

        // 2nd page

        await page.getByText('Soort', { exact: true }).click();
        await page.getByRole('option', { name: 'Aanhangwagen (A)' }).click();

        await page.getByTestId('bs-214-vaststellen-bezittingen-pv.bezittingenToelichting').fill(toelichting);

        // Volgende
        await page.getByRole('button', { name: 'Volgende' }).click();

        //3rd page
        await page.getByRole('radio', { name: 'Nee' }).check();
        await page.getByTestId('bs-214-vaststellen-schuld-pv.schuldenToelichting').fill(toelichting);

        // Volgende
        await page.getByRole('button', { name: 'Volgende' }).click();

        // 4th page
        await page.getByTestId('bs-214-vaststellen-eigen-woning-pv.eigenWoningToelichting').fill(toelichting);

        // Volgende
        await page.getByRole('button', { name: 'Volgende' }).click();

        // Indienen
        console.log(`[${taskName}] Clicking "Indienen"...`);
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        // Complete followup task
        const followupTask = 'Vaststellen in aanmerking te nemen vermogen';
        await openTask(page, followupTask);
        await page.getByRole('button', { name: 'Indienen' }).click();

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
