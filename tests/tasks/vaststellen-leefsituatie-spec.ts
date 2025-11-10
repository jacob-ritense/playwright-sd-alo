import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

interface TestData {
    lastName: string;
    requestId: string | null;
}

export default async function(page: Page, testData: TestData) {
    const taskName = "Vaststellen leefsituatie";
    try {
        console.log(`Looking for task: "${taskName}"`);
        const taskElement = page.getByText(taskName, { exact: true });
        await taskElement.waitFor({ state: 'visible', timeout: 30000 });
        console.log(`Task "${taskName}" is visible.`);
        await taskElement.click();
        console.log(`Clicked task: "${taskName}".`);
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        // Select "Alleenstaand" radio button
        console.log('Selecting "Alleenstaand"...');
        await page.getByRole('radio', { name: 'Alleenstaand' }).check();

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