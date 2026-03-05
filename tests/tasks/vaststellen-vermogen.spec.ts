import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { openTask } from '../helper-functions/utils';

export default async function vaststellenVermogenTask(page: Page) {
    const taskName = 'Vaststellen vermogens componenten';

    try {
        await openTask(page, taskName);

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
