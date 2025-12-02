// tasks/invoeren-nieuwe-deadline.spec.ts
import { Page } from '@playwright/test';
import { openTask  } from '../../helper-functions/utils';

export default async function invoerenNieuweDeadlineTask(page: Page) {
    const taskName = 'Invoeren nieuwe deadline';

    try {
        await openTask(page, taskName);

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
                path: 'invoeren-nieuwe-deadline-error.png',
                fullPage: true,
            });
            console.log('Screenshot saved as invoeren-nieuwe-deadline-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}