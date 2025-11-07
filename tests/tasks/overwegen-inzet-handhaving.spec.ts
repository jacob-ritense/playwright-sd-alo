// tasks/overwegen-inzet-handhaving.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { getOptionForTask, type Option } from '../../test-cases/scenarios/test-scenario-picker';

interface TestData {
    lastName: string;
    requestId: string | null;
}

const optionHandlers: Record<Option, (page: Page) => Promise<void>> = {
    A: async (page) => {
        console.log('Clicking "Nee" radio button...');
        await page.getByRole('radio', { name: 'Nee' }).check();
    },
    B: async (page) => {
        console.log('Clicking "Ja" radio button...');
        await page.getByRole('radio', { name: 'Ja' }).check();
    },
    C: async (page) => {
        // placeholder for future option
        console.log('Clicking "Ja" radio button...');
        await page.getByRole('radio', { name: 'Ja' }).check();
    },
};

export default async function(page: Page, testData: TestData) {
    const taskName = "Overwegen inzet handhaving";
    try {
        console.log(`Looking for task: "${taskName}"`);
        const taskElement = page.getByText(taskName, { exact: true });
        await taskElement.waitFor({ state: 'visible', timeout: 30000 });
        console.log(`Task "${taskName}" is visible.`);
        await taskElement.click();
        console.log(`Clicked task: "${taskName}".`);
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(2000);

        // 🔑 Get option from scenario picker (no arg required)
        const option = getOptionForTask('overwegen-inzet-handhaving', 'A');
        const handler = optionHandlers[option] ?? optionHandlers.A;
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
