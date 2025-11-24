// tasks/vastleggen-buiten-behandeling-stelling.spec.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

interface TestData {
    lastName: string;
    requestId: string | null;
}

export default async function vastleggenBuitenBehandelingStellingTask(
    page: Page,
    _testData: TestData
) {
    const taskName = 'Vastleggen buiten behandeling stelling';

    try {
        console.log(`Looking for task: "${taskName}"`);
        const taskElement = page.getByText(taskName, { exact: true });
        await taskElement.waitFor({ state: 'visible', timeout: 30_000 });
        console.log(`Task "${taskName}" is visible.`);
        await taskElement.click();
        console.log(`Clicked task: "${taskName}".`);

        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        await page.waitForTimeout(2_000);

        // Fill in dates as dd-mm-yyyy_
        const now = new Date();
        const date =
            String(now.getDate()).padStart(2, '0') +
            '-' +
            String(now.getMonth() + 1).padStart(2, '0') +
            '-' +
            now.getFullYear() +
            '_';

        console.log(`Filling first date textbox with: "${date}"`);
        await page.getByRole('textbox').nth(0).click();
        await page.getByRole('textbox').nth(0).fill(date);

        console.log(`Filling second date textbox with: "${date}"`);
        await page.getByRole('textbox').nth(1).click();
        await page.getByRole('textbox').nth(1).fill(date);

        // Fill in "Ontbrekende stukken" and "Toelichting"
        const ontbrekendeStukkenText = faker.lorem.words(5);
        console.log(
            `Filling "Ontbrekende stukken?" with: "${ontbrekendeStukkenText}"`
        );
        await page
            .getByRole('textbox', { name: 'Ontbrekende stukken' })
            .fill(ontbrekendeStukkenText);

        const toelichtingText = faker.lorem.words(5);
        console.log(`Filling "Toelichting" with: "${toelichtingText}"`);
        await page
            .getByRole('textbox', { name: 'Toelichting' })
            .fill(toelichtingText);

        // File "beschikking" upload
        const filePath = 'context-files/test-beschikking.txt';
        console.log(`Selecting document "${filePath}" for upload...`);

        // Generic file input (no undefined dropZone / flowTaskName)
        let fileInput = page
            .locator(
                'xpath=//div[contains(@class,"formio-component")]//input[@type="file"]'
            )
            .first();

        if (!(await fileInput.count())) {
            console.log(
                'Specific formio file input not found, falling back to first input[type="file"]'
            );
            fileInput = page.locator('input[type="file"]').first();
        }

        await fileInput.setInputFiles(filePath);
        console.log(`Document "${filePath}" selected, confirming upload...`);

        const opslaanButton = page
            .getByRole('button', { name: /^Opslaan$/i })
            .first();
        console.log('Waiting for "Opslaan" button to be visible...');
        await opslaanButton.waitFor({ state: 'visible', timeout: 15_000 });
        console.log('Clicking "Opslaan" button...');
        await opslaanButton.click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        await page.waitForTimeout(1_000);

        console.log('Clicking "Indienen" button...');
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        await page.waitForTimeout(2_000);

        console.log(`Successfully completed task "${taskName}".`);
    } catch (error) {
        console.error(`Failed during "${taskName}" task processing:`, error);
        try {
            await page.screenshot({
                path: 'vastleggen-buiten-behandeling-stelling-error.png',
                fullPage: true,
            });
            console.log(
                'Screenshot saved as vastleggen-buiten-behandeling-stelling-error.png'
            );
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}
