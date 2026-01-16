// tasks/vaststellen-leefsituatie.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { getOptionForTask, type Option } from '../../test-cases/test-scenario-picker';
import { openTask  } from '../helper-functions/utils';

const optionHandlers: Partial<Record<Option, (page: Page) => Promise<void>>> = {
    A: async (page) => {
        // Select "Institutioneel huishouden" radio button
        console.log('Selecting "Institutioneel huishouden"...');
        await page.getByRole('radio', { name: 'Institutioneel huishouden' }).check();
    },
    B: async (page) => {
        // Select "Alleenstaande ouder" radio button
        console.log('Selecting "Alleenstaande ouder"...');
        await page.getByRole('radio', { name: 'Alleenstaande ouder' }).check();
    },
    C: async (page) => {
        // Select "Alleenstaand" radio button
        console.log('Selecting "Alleenstaand"...');
        await page.getByRole('radio', {name: 'Alleenstaand', exact: true}).check();
    },
    D: async (page) => {
        // Select "Samenwonend met kinderen" radio button
        console.log('Selecting "Samenwonend met kinderen"...');
        await page.getByRole('radio', { name: 'Samenwonend met kinderen' }).check();
    },
    E: async (page) => {
        // Select "Samenwonend zonder kinderen" radio button
        console.log('Selecting "Samenwonend zonder kinderen"...');
        await page.getByRole('radio', { name: 'Samenwonend zonder kinderen' }).check();
    },
};

export default async function(page: Page) {
    const taskName = "Vaststellen leefsituatie";
    try {
        await openTask(page, taskName);

        // 🔑 Get option from scenario picker (default to C = "Alleenstaand" to keep current behavior)
        const option = getOptionForTask('vaststellen-leef-woonsituatie', 'C');
        const handler = optionHandlers[option] ?? optionHandlers.C!;
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
        console.error('Failed during "Vaststellen leefsituatie" task processing:', error);
        try {
            await page.screenshot({ path: 'vaststellen-leefsituatie-error.png', fullPage: true });
            console.log('Screenshot saved as vaststellen-leefsituatie-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}
