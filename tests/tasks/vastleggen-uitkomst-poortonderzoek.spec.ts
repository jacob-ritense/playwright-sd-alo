// tasks/uitkomst-poortonderzoek.ts
import { Page } from '@playwright/test';
import { waitForTask, waitForSpecificTask, completeSpecificTask } from './utils';
import { faker } from '@faker-js/faker';

interface TestData {
    lastName: string;
    requestId: string | null;
}

export default async function uitkomstPoortonderzoekTask(page: Page, testData: TestData) {
    const taskName = "Vastleggen uitkomst poortonderzoek";
    try {
        await waitForTask(page, 2000);

        const taskFound = await waitForSpecificTask(page, taskName);
        if (!taskFound) {
            throw new Error(`Task "${taskName}" did not appear after multiple refresh attempts`);
        }

        const toelichtingText = faker.lorem.words(5);
        console.log(`Filling "Uitkomst poortonderzoek?" with: "${toelichtingText}"`);
        await page.getByRole('textbox', { name: 'Uitkomst poortonderzoek?' }).fill(toelichtingText);

        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        console.log('Form submitted successfully.');

        await completeSpecificTask(page, taskName);
        console.log(`Successfully completed task "${taskName}"`);
    } catch (error) {
        console.error(`Failed during "${taskName}" task processing:`, error);
        try {
            await page.screenshot({ path: 'vastleggen-uitkomst-poortonderzoek-error.png', fullPage: true });
            console.log('Screenshot saved as vastleggen-uitkomst-poortonderzoek-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}
