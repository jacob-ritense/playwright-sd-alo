// tasks/vastleggen-intrekking.spec.ts
import { Page } from '@playwright/test';
import { openTask  } from '../../helper-functions/utils';

export default async function vastleggenIntrekkingTask(page: Page) {
    const taskName = 'Vastleggen intrekking';

    try {
        await openTask(page, taskName);

        // Kies communicatiekanaal: E-mail
        console.log('Opening communicatiekanaal keuze (choices)...');
        await page.locator('.choices > div').first().click();

        console.log('Selecting option "E-mail"...');
        await page.getByRole('option', { name: 'E-mail' }).click();

        // Afronden
        console.log('Clicking "Doorgaan" button...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        await page.waitForTimeout(3_000);

        console.log(`Successfully completed task "${taskName}".`);
    } catch (error) {
        console.error(`Failed during "${taskName}" task processing:`, error);
        try {
            await page.screenshot({
                path: 'vastleggen-intrekking-error.png',
                fullPage: true,
            });
            console.log('Screenshot saved as vastleggen-intrekking-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}
