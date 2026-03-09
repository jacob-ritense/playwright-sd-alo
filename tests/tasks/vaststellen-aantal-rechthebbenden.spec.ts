import { Page } from '@playwright/test';
import { openTask } from '../helper-functions/utils';

export default async function vaststellenAantalRechthebbendenTask(page: Page) {
    const taskName = 'Vaststellen aantal rechthebbenden';

    try {
        await openTask(page, taskName);

        console.log(`[${taskName}] Clicking "Indienen"...`);
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        console.log(`[${taskName}] Task completed.`);
    } catch (error) {
        console.error(`[${taskName}] Failed during task:`, error);

        try {
            await page.screenshot({ path: 'vaststellen-aantal-rechthebbden-error.png', fullPage: true });
            console.log(`[${taskName}] Screenshot saved.`);
        } catch (screenshotError) {
            console.error(`[${taskName}] Failed saving screenshot:`, screenshotError);
        }

        throw error;
    }
}
