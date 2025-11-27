import { Page } from '@playwright/test';
import { openTask } from '../helper-functions/utils';

interface TestData {
    lastName: string;
    requestId: string | null;
}

export default async function vaststellenLeefWoonsituatieTask(page: Page, testData: TestData) {
    const taskName = 'Vaststellen leef- en woonsituatie';

    try {
        await openTask(page, taskName);

        console.log(`[${taskName}] Clicking "Afronden"...`);
        await page.getByRole('button', { name: 'Afronden' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        console.log(`[${taskName}] Task completed successfully.`);
    } catch (error) {
        console.error(`[${taskName}] Failed during task:`, error);

        try {
            await page.screenshot({ path: 'vaststellen-leef-woonsituatie-error.png', fullPage: true });
            console.log(`[${taskName}] Screenshot saved.`);
        } catch (screenshotError) {
            console.error(`[${taskName}] Failed to save screenshot:`, screenshotError);
        }

        throw error;
    }
}
