import { Page } from '@playwright/test';
import { openTask } from '../helper-functions/utils';

export default async function opvoerenDienstSocratesTask(page: Page) {

    let taskName = "Opvoeren dienst in Socrates";

    const retryTask = page.getByText(/Opnieuw proberen opvoeren dienst in socrates/i);

    if (await retryTask.first().isVisible().catch(() => false)) {
        taskName = "Opnieuw proberen opvoeren dienst in socrates";
    }

    await openTask(page, taskName);

    console.log('Clicking "Overslaan" button...');
    await page.getByRole('button', { name: 'Overslaan' }).click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    console.log(`Successfully completed task "${taskName}"`);
}