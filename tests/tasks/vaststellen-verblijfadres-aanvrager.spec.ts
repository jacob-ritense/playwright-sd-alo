// tasks/vaststellen-verblijfadres-aanvrager.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { getOptionForTask, type Option } from '../../test-cases/test-scenario-picker';
import { openTask  } from '../helper-functions/utils';

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
        await page.getByRole("textbox", { name: /^Huisnummer\b/ }).fill("1");

        console.log('Filling "Huisletter" with: "a"');
        await page.getByRole('textbox', { name: 'Huisletter' }).fill('a');

        console.log('Filling "Huisnummertoevoeging" with: "toev"');
        await page.getByRole('textbox', { name: 'Huisnummertoevoeging' }).fill('1');

        console.log('Filling "Postcode" with: "1234 AB"');
        await page.getByRole('textbox', { name: 'Postcode' }).fill('1234 AB');

        console.log('Filling "Woonplaatsnaam" with: "Den Haag"');
        await page.getByRole('textbox', { name: 'Woonplaatsnaam' }).fill('Den Haag');

        // Note: the task already fills the generic "Toelichting" after the handler.
    },

};

export default async function verblijfadresAanvragerTask(page: Page) {
    const taskName = 'Selecteren verblijfadres aanvrager';
    try {
        await openTask(page, taskName);

        // Ensure the section question is present before interacting with radios
        const questionText = 'Welk adres wordt gebruikt voor de woonsituatie?';
        await page.getByText(questionText, { exact: false }).waitFor({ state: 'visible', timeout: 15000 });

        // 🔑 Choose option from scenario picker (task id used in your runner)
        const option = getOptionForTask('vaststellen-verblijfadres-aanvrager', 'A');
        const handler = optionHandlers[option] ?? optionHandlers.A!;
        await handler(page);

        const toelichting = faker.lorem.words(6);
        console.log(`Filling "Toelichting" with: "${toelichting}"`);
        await page.getByRole('textbox', { name: 'Toelichting' }).fill(toelichting);

        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        console.log('Verblijfadres form submitted successfully.');
    } catch (error) {
        console.error('Failed during "Verblijfadres aanvrager" task processing:', error);
        try {
            await page.screenshot({ path: 'verblijfadres-aanvrager-error.png', fullPage: true });
            console.log('Screenshot saved as verblijfadres-aanvrager-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}

