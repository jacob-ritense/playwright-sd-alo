// tasks/vaststellen-verblijfadres-partner.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { getOptionForTask, type Option } from '../../test-cases/scenarios/test-scenario-picker';

interface TestData {
    lastName: string;
    requestId: string | null;
}

const optionHandlers: Partial<Record<Option, (page: Page) => Promise<void>>> = {
    A: async (page) => {
        console.log('Selecting "Verblijfadres" option for woonsituatie...');
        const verblijfadresRadio = page.getByRole('radio', { name: 'Verblijfadres' });
        await verblijfadresRadio.waitFor({ state: 'visible', timeout: 15000 });
        if (!(await verblijfadresRadio.isChecked())) {
            await verblijfadresRadio.check();
        }
    },

    B: async (page) => {
        console.log('Selecting "BRP adres" option for woonsituatie...');
        const BRPadresRadio = page.getByRole('radio', { name: 'BRP adres' });
        await BRPadresRadio.waitFor({ state: 'visible', timeout: 15000 });
        if (!(await BRPadresRadio.isChecked())) {
            await BRPadresRadio.check();
        }
    },

    C: async (page) => {
        console.log('Selecting "Anders" option for woonsituatie...');
        const andersRadio = page.getByRole('radio', { name: 'Anders' });
        await andersRadio.waitFor({ state: 'visible', timeout: 15000 });
        if (!(await andersRadio.isChecked())) {
            await andersRadio.check();
        }

        // Fill all "Anders" address fields
        console.log('Filling "Straatnaam" with: "Teststraat"');
        await page.getByRole('textbox', { name: 'Straatnaam' }).fill('Teststraat');

        console.log('Filling "Huisnummer" with: "1"');
        await page.getByRole('textbox', { name: 'Huisnummer ' }).fill('1');

        console.log('Filling "Huisletter" with: "a"');
        await page.getByRole('textbox', { name: 'Huisletter' }).fill('a');

        // console.log('Filling "Huisnummertoevoeging" with: "toev"');
        // await page.getByRole('textbox', { name: 'Huisnummertoevoeging' }).fill('toev');

        console.log('Filling "Postcode" with: "1234 AB"');
        await page.getByRole('textbox', { name: 'Postcode' }).fill('1234 AB');

        console.log('Filling "Woonplaatsnaam" with: "Den Haag"');
        await page.getByRole('textbox', { name: 'Woonplaatsnaam' }).fill('Den Haag');

        // Toelichting is filled later by the shared step
    },
};

export default async function verblijfadresPartnerTask(page: Page, testData: TestData) {
    const taskName = 'Selecteren verblijfadres partner';
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

        const questionText = 'Welk adres wordt gebruikt voor de woonsituatie?';
        await page.getByText(questionText, { exact: false }).waitFor({ state: 'visible', timeout: 15000 });

        // 🔑 Choose option via scenario picker
        const option = getOptionForTask('vaststellen-verblijfadres-partner', 'A');
        const handler = optionHandlers[option] ?? optionHandlers.A!;
        await handler(page);

        const toelichting = faker.lorem.words(6);
        console.log(`Filling "Toelichting" with: "${toelichting}"`);
        await page.getByRole('textbox', { name: 'Toelichting' }).fill(toelichting);

        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        console.log('Verblijfadres partner form submitted successfully.');
    } catch (error) {
        console.error('Failed during "Verblijfadres partner" task processing:', error);
        try {
            await page.screenshot({ path: 'verblijfadres-partner-error.png', fullPage: true });
            console.log('Screenshot saved as verblijfadres-partner-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}

