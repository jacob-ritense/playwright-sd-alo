// tasks/vaststellen-persoon-partner.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { getOptionForTask, type Option } from '../../test-cases/scenarios/test-scenario-picker';

interface TestData {
    lastName: string;
    requestId: string | null;
}

const optionHandlers: Partial<Record<Option, (page: Page) => Promise<void>>> = {
    A: async (page) => {
        console.log('Selecting "Ja, gebruik de gegevens uit de BRP"...');
        await page.getByRole('radio', { name: 'Ja, gebruik de gegevens uit de BRP' }).check();
    },
    B: async (page) => {
        console.log('Selecting "Nee, het opgegeven BSN hoort niet bij deze naam"...');
        await page.getByRole('radio', { name: 'Nee, het opgegeven BSN hoort niet bij deze naam' }).check();
        const gewenstBSNText = '999991954';
        console.log(`Filling "Gewenst BSN" with: "${gewenstBSNText}"`);
        await page.getByRole('textbox', { name: 'Gewenst BSN' }).fill(gewenstBSNText);
    },
};

export default async function(page: Page, testData: TestData) {
    const taskName = "Vaststellen persoon partner";
    try {
        console.log(`Looking for task: "${taskName}"`);
        const taskElement = page.getByText(taskName, { exact: true });
        try {
            await taskElement.waitFor({ state: 'visible', timeout: 30000 });
        } catch (timeoutError) {
            console.warn(`Task "${taskName}" not visible within timeout, refreshing page and retrying...`);
            await page.reload();
            await page.waitForLoadState('networkidle', { timeout: 15000 });
            await page.waitForTimeout(2000);
            await page.getByText(taskName, { exact: true }).waitFor({ state: 'visible', timeout: 20000 });
        }
        console.log(`Task "${taskName}" is visible.`);
        await taskElement.click();
        console.log(`Clicked task: "${taskName}".`);
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        // 🔑 Get option from scenario picker (correct task id!)
        const option = getOptionForTask('vaststellen-persoon-partner', 'A');
        const handler = optionHandlers[option] ?? optionHandlers.A!;
        await handler(page);

        // Fill in the toelichting text field with random words
        const toelichtingText = faker.lorem.words(5);
        console.log(`Filling "Toelichting" with: "${toelichtingText}"`);
        await page.getByRole('textbox', { name: 'Toelichting' }).fill(toelichtingText);

        // Submit the form
        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        console.log('Form submitted successfully.');
    } catch (error) {
        console.error('Failed during "Vaststellen persoon partner" task processing:', error);
        try {
            await page.screenshot({ path: 'vaststellen-persoon-partner-error.png', fullPage: true });
            console.log('Screenshot saved as vaststellen-persoon-partner-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}
