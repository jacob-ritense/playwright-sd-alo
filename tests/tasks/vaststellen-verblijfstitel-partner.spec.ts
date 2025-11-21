// tasks/vaststellen-verblijfstitel-partner.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { getOptionForTask, type Option } from '../../test-cases/test-scenario-picker';

interface TestData {
    lastName: string;
    requestId: string | null;
}

const optionHandlers: Partial<Record<Option, (page: Page) => Promise<void>>> = {
    A: async (page) => {
        // Option A: Choose "Ja"
        console.log('Selecting "Ja" for nationality question...');
        await page.getByRole('radio', { name: 'Ja' }).check();
    },

    B: async (page) => {
        // Option B: Choose "Nee" + pick "20: Ander verdrag dan hierboven"
        console.log('Selecting "Nee" for nationality question...');
        await page.getByRole('radio', { name: 'Nee' }).check();

        const logText = 'Selecting bijstandsvorm "20: Ander verdrag dan hierboven"...';
        console.log(logText);
        const bijstandsvormDropdown = page.locator('.choices > div').first();
        await bijstandsvormDropdown.waitFor({ state: 'visible', timeout: 20000 });
        await bijstandsvormDropdown.click();

        const option = page.getByRole('option', { name: '20: Ander verdrag dan hierboven' }).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(1000);
    },
};

export default async function verblijfstitelPartnerTask(page: Page, testData: TestData) {
    const taskName = 'Vaststellen verblijfstitel partner';
    try {
        console.log(`Looking for task: "${taskName}"`);
        const taskElement = page.getByText(taskName, { exact: true });
        try {
            await taskElement.waitFor({ state: 'visible', timeout: 30000 });
        } catch (timeoutError) {
            console.warn(`Task "${taskName}" not visible within timeout, refreshing and retrying...`);
            await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
            await page.waitForTimeout(2000);
            await page.getByText(taskName, { exact: true }).waitFor({ state: 'visible', timeout: 20000 });
        }
        console.log(`Task "${taskName}" is visible.`);

        await taskElement.click();
        console.log(`Clicked task: "${taskName}".`);
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(2000);

        // 🔑 Choose option via scenario picker (default A to preserve current behavior)
        const option = getOptionForTask('vaststellen-verblijfstitel-partner', 'A');
        const handler = optionHandlers[option] ?? optionHandlers.A!;
        await handler(page);

        const toelichting = faker.lorem.words(8);
        console.log(`Filling "Toelichting" with: "${toelichting}"`);
        await page.getByLabel('Toelichting').fill(toelichting);

        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        console.log('Verblijfstitel partner form submitted successfully.');
    } catch (error) {
        console.error('Failed during "Vaststellen verblijfstitel partner" task processing:', error);
        try {
            await page.screenshot({ path: 'verblijfstitel-partner-error.png', fullPage: true });
            console.log('Screenshot saved as verblijfstitel-partner-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}

