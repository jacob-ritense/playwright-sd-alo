// tasks/vastleggen-intrekking.spec.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker'; // currently unused, keep or remove based on lint rules

interface TestData {
    lastName: string;
    requestId: string | null;
}

export default async function vastleggenIntrekkingTask(
    page: Page,
    _testData: TestData
) {
    const taskName = 'Vastleggen intrekking';

    try {
        console.log(`Looking for task: "${taskName}"`);
        const taskElement = page.getByText(taskName, { exact: true });
        await taskElement.waitFor({ state: 'visible', timeout: 30_000 });
        console.log(`Task "${taskName}" is visible.`);
        await taskElement.click();
        console.log(`Clicked task: "${taskName}".`);

        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        await page.waitForTimeout(2_000);

        // Kies communicatiekanaal: E-mail
        console.log('Opening communicatiekanaal keuze (choices)...');
        await page.locator('.choices > div').first().click();

        console.log('Selecting option "E-mail"...');
        await page.getByRole('option', { name: 'E-mail' }).click();

        console.log('Clicking "Doorgaan" button...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        await page.waitForTimeout(1_000);

        // Afronden
        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        await page.waitForTimeout(2_000);

        console.log(`Successfully completed task "${taskName}".`);
    } catch (error) {
        console.error(`Failed during "${taskName}" task processing:`, error);
        try {
            await page.screenshot({
                path: 'vastleggen-intrekking-error.png',
                fullPage: true,
            });
            console.log('Screenshot saved as vastleggen-intrekking-error.png');
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}
