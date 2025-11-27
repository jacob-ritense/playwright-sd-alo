// tasks/vaststellen-woonsituatie.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { getOptionForTask, type Option } from '../../test-cases/test-scenario-picker';
import { openTask  } from '../helper-functions/utils';

const optionHandlers: Partial<Record<Option, (page: Page, flowTaskName: string) => Promise<void>>> = {
    A: async (page, flowTaskName) => {
        console.log(`[${flowTaskName}] Filling "Aantal belanghebbenden" with 1...`);
        await page.getByLabel('Aantal belanghebbenden').fill('1');

        console.log(`[${flowTaskName}] Selecting "Zelfstandig wonend" for woonsituatie...`);
        await page.getByRole('radio', { name: 'Zelfstandig wonend' }).check();

        console.log(`[${flowTaskName}] Selecting "Ja" for Art 23.3 van toepassing...`);
        await page.getByRole('radio', { name: 'Ja' }).check();
    },

    B: async (page, flowTaskName) => {
        console.log(`[${flowTaskName}] Filling "Aantal belanghebbenden" with 2...`);
        await page.getByLabel('Aantal belanghebbenden').fill('2');

        console.log(`[${flowTaskName}] Selecting "Verblijf in instelling" for woonsituatie...`);
        await page.getByRole('radio', { name: 'Verblijf in instelling' }).check();

        console.log(`[${flowTaskName}] Selecting "Nee" for Art 23.3 van toepassing...`);
        await page.getByRole('radio', { name: 'Nee' }).check();
    },
};

export default async function vaststellenWoonsituatieTask(page: Page) {
    const flowTaskName = 'vaststellen-woonsituatie';
    const taskName = 'Vaststellen woonsituatie';

    try {
        await openTask(page, taskName);

        // 🔑 Option-specific actions
        const option = getOptionForTask('vaststellen-woonsituatie', 'A');
        const handler = optionHandlers[option] ?? optionHandlers.A!;
        await handler(page, flowTaskName);

        const toelichting = faker.lorem.words(8);
        console.log(`[${flowTaskName}] Filling "Toelichting" with: "${toelichting}"`);
        await page.getByLabel('Toelichting').fill(toelichting);

        console.log(`[${flowTaskName}] Clicking "Indienen" button...`);
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        console.log(`[${flowTaskName}] Vaststellen woonsituatie task completed successfully.`);
    } catch (error) {
        console.error(`[${flowTaskName}] Failed during task processing:`, error);
        try {
            await page.screenshot({ path: 'vaststellen-woonsituatie-error.png', fullPage: true });
            console.log(`[${flowTaskName}] Screenshot saved as vaststellen-woonsituatie-error.png`);
        } catch (screenshotError) {
            console.error(`[${flowTaskName}] Failed to save error screenshot:`, screenshotError);
        }
        throw error;
    }
}

