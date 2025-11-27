// tasks/overwegen-inzet-handhaving.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { getOptionForTask, type Option } from '../../test-cases/test-scenario-picker';
import { openTask  } from '../helper-functions/utils';

const optionHandlers: Partial<Record<Option, (page: Page) => Promise<void>>> = {
    A: async (page) => {
        console.log('Clicking "Nee" radio button...');
        await page.getByRole('radio', { name: 'Nee' }).check();
    },
    B: async (page) => {
        console.log('Clicking "Ja" radio button...');
        await page.getByRole('radio', { name: 'Ja' }).check();
    },
};

export default async function(page: Page) {
    const taskName = "Overwegen inzet handhaving";
    try {
        await openTask(page, taskName);

        // 🔑 Get option from scenario picker (no arg required)
        const option = getOptionForTask('overwegen-inzet-handhaving', 'A');
        const handler = optionHandlers[option] ?? optionHandlers.A!;
        await handler(page);

        const toelichtingText = faker.lorem.words(3);
        console.log(`Filling "Toelichting" with: "${toelichtingText}"`);
        await page.getByRole('textbox', { name: 'Toelichting' }).fill(toelichtingText);
        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        console.log('"Nee" selected, toelichting filled, and form submitted.');
    } catch (error) {
        console.error('Failed during "Overwegen inzet handhaving" task processing:', error);
        try {
            await page.screenshot({ path: 'overwegen-inzet-handhaving-error.png', fullPage: true });
            console.log('Screenshot saved as overwegen-inzet-handhaving-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}
