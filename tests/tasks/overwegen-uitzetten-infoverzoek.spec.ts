// tasks/overwegen-uitzetten-infoverzoek.ts
import { Page } from '@playwright/test';
import { getOptionForTask, type Option } from '../../test-cases/test-scenario-picker';
import { openTask  } from '../helper-functions/utils';

interface TestData {
    lastName: string;
    requestId: string | null;
}

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

export default async function(page: Page, testData: TestData) {
    const taskName = "Overwegen uitzetten informatieverzoek";
    try {
        await openTask(page, taskName);

        // 🔑 Get option from scenario picker
        const option = getOptionForTask('overwegen-uitzetten-infoverzoek', 'A');
        const handler = optionHandlers[option] ?? optionHandlers.A!;
        await handler(page);

        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        console.log('"Nee" selected and form submitted.');
    } catch (error) {
        console.error('Failed during "Overwegen uitzetten informatieverzoek" task processing:', error);
        try {
            await page.screenshot({ path: 'overwegen-uitzetten-infoverzoek-error.png', fullPage: true });
            console.log('Screenshot saved as overwegen-uitzetten-infoverzoek-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}
