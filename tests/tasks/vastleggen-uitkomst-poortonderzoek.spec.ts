// tasks/vastleggen-uitkomst-poortonderzoek.spec.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

interface TestData {
    lastName: string;
    requestId: string | null;
}

export default async function vastleggenUitkomstPoortonderzoekTask(
    page: Page,
    testData: TestData
) {
    const taskName = 'Vastleggen uitkomst poortonderzoek';

    try {
        console.log(`Looking for task: "${taskName}"`);
        const taskElement = page.getByText(taskName, { exact: true });
        await taskElement.waitFor({ state: 'visible', timeout: 30_000 });
        console.log(`Task "${taskName}" is visible.`);
        await taskElement.click();
        console.log(`Clicked task: "${taskName}".`);

        await page.waitForLoadState('networkidle', { timeout: 15_000 });

        const toelichtingText = faker.lorem.words(5);
        console.log(
            `Filling "Uitkomst poortonderzoek?" with: "${toelichtingText}"`
        );
        await page
            .getByRole('textbox', { name: 'Uitkomst poortonderzoek?' })
            .fill(toelichtingText);

        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        console.log(`Successfully completed task "${taskName}".`);
    } catch (error) {
        console.error(`Failed during "${taskName}" task processing:`, error);
        try {
            await page.screenshot({
                path: 'vastleggen-uitkomst-poortonderzoek-error.png',
                fullPage: true,
            });
            console.log(
                'Screenshot saved as vastleggen-uitkomst-poortonderzoek-error.png'
            );
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}

