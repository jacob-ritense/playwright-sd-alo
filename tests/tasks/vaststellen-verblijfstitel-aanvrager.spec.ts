// tasks/vaststellen-verblijfstitel-aanvrager.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { getOptionForTask, type Option } from '../../test-cases/test-scenario-picker';
import { openTask  } from '../helper-functions/utils';

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

export default async function verblijfstitelAanvragerTask(page: Page, testData: TestData) {
    const taskName = 'Vaststellen verblijfstitel aanvrager';
    try {
        await openTask(page, taskName);

        // 🔑 Choose option from scenario picker (default A to preserve current behavior)
        const option = getOptionForTask('vaststellen-verblijfstitel-aanvrager', 'A');
        const handler = optionHandlers[option] ?? optionHandlers.A!;
        await handler(page);

        const toelichting = faker.lorem.words(8);
        console.log(`Filling "Toelichting" with: "${toelichting}"`);
        await page.getByLabel('Toelichting').fill(toelichting);

        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        console.log('Verblijfstitel aanvrager form submitted successfully.');
    } catch (error) {
        console.error('Failed during "Vaststellen verblijfstitel aanvrager" task processing:', error);
        try {
            await page.screenshot({ path: 'verblijfstitel-aanvrager-error.png', fullPage: true });
            console.log('Screenshot saved as verblijfstitel-aanvrager-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}
