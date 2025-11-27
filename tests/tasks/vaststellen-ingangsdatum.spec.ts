import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { openTask } from '../helper-functions/utils';

interface TestData {
    lastName: string;
    requestId: string | null;
}

export default async function inangsdatumTask(page: Page, testData: TestData) {
    const taskName = 'Vaststellen Ingangsdatum';

    try {
        await openTask(page, taskName);

        const toelichting = faker.lorem.sentence();
        console.log(`[${taskName}] Filling "Toelichting" with "${toelichting}"`);
        await page.getByRole('textbox', { name: 'Toelichting' }).fill(toelichting);

        console.log(`[${taskName}] Clicking "Indienen"...`);
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        console.log(`[${taskName}] Task completed.`);
    } catch (error) {
        console.error(`[${taskName}] Failed during task:`, error);

        try {
            await page.screenshot({ path: 'vaststellen-ingangsdatum-error.png', fullPage: true });
            console.log(`[${taskName}] Screenshot saved.`);
        } catch (screenshotError) {
            console.error(`[${taskName}] Failed saving screenshot:`, screenshotError);
        }

        throw error;
    }
}
