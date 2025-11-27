// tasks/wijzigen-contactgegevens-aanvrager.spec.ts
import { Page } from '@playwright/test';
import { openTask  } from '../../helper-functions/utils';

export default async function wijzigenContactgegevensAanvragerTask(page: Page) {
    const taskName = 'Wijzigen contactgegevens aanvrager';

    try {
        await openTask(page, taskName);

        await page.getByTestId('bs.vastleggen-wijziging-contactgegevens-aanvrager.wijzigen-contactgegevens-naamContactpersoon').click();
        await page.getByTestId('bs.vastleggen-wijziging-contactgegevens-aanvrager.wijzigen-contactgegevens-naamContactpersoon').fill('Piet Jan');

        // Completing task
        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        await page.waitForTimeout(2_000);

        console.log(`Successfully completed task "${taskName}".`);
    } catch (error) {
        console.error(`Failed during "${taskName}" task processing:`, error);
        try {
            await page.screenshot({
                path: 'wijzigen-contactgegevens-aanvrager-error.png',
                fullPage: true,
            });
            console.log('Screenshot saved as wijzigen-contactgegevens-aanvrager-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}