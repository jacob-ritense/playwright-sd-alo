// tasks/vaststellen-besluit.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { getOptionForTask, type Option } from '../../test-cases/test-scenario-picker';
import { openTask } from '../helper-functions/utils';

interface TestData {
    lastName: string;
    requestId: string | null;
}

// Shared helpers used by B/C/D
async function selectToekennen(page: Page, taskName: string) {
    console.log(`[${taskName}] Selecting "Toekennen" radio option...`);
    const toekennenRadio = page.getByRole('radio', { name: /^Toekennen$/i });
    await toekennenRadio.waitFor({ state: 'visible', timeout: 20000 });
    await toekennenRadio.check();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(1000);
}

async function pickBijstandsvorm(
    page: Page,
    taskName: string,
    optionName: 'Lening' | 'Krediethypotheek' | 'Uitkering om niet'
) {
    const logText =
        optionName === 'Lening'
            ? `[${taskName}] Selecting bijstandsvorm "Lening"...`
            : optionName === 'Krediethypotheek'
                ? `[${taskName}] Selecting bijstandsvorm "Krediethypotheek"...`
                : `[${taskName}] Selecting bijstandsvorm "Uitkering om niet"...`;

    console.log(logText);

    const bijstandsvormDropdown = page.locator('.choices > div').first();
    await bijstandsvormDropdown.waitFor({ state: 'visible', timeout: 20000 });
    await bijstandsvormDropdown.click();

    const option = page.getByRole('option', { name: optionName }).first();
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(1000);
}

// Option handlers
const optionHandlers: Partial<Record<Option, (page: Page, taskName: string) => Promise<void>>> = {
    A: async (page, taskName) => {
        console.log(`[${taskName}] Selecting "Afwijzen" radio option...`);
        const afwijzenRadio = page.getByRole('radio', { name: /^Afwijzen$/i });
        await afwijzenRadio.waitFor({ state: 'visible', timeout: 20000 });
        await afwijzenRadio.check();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(1000);

        const redenAfwijzing = faker.lorem.words(6);
        console.log(`[${taskName}] Filling "Reden afwijzing" with: "${redenAfwijzing}"`);
        await page.getByRole('textbox', { name: 'Reden afwijzing' }).fill(redenAfwijzing);
    },

    B: async (page, taskName) => {
        await selectToekennen(page, taskName);
        await pickBijstandsvorm(page, taskName, 'Lening');
    },

    C: async (page, taskName) => {
        await selectToekennen(page, taskName);
        await pickBijstandsvorm(page, taskName, 'Krediethypotheek');
    },

    D: async (page, taskName) => {
        await selectToekennen(page, taskName);
        await pickBijstandsvorm(page, taskName, 'Uitkering om niet');
    },
};

export default async function vaststellenBesluitTask(page: Page, testData: TestData) {
    const taskName = 'Vaststellen besluit';

    try {
        await openTask(page, taskName);

        // Option logic
        const option = getOptionForTask('vaststellen-besluit', 'A');
        const handler = optionHandlers[option] ?? optionHandlers.A!;
        await handler(page, taskName);

        // Upload block
        console.log(`[${taskName}] Uploading besluit document...`);
        const dropZoneText = 'Kies een bestand, of sleep het hier naartoe';
        const dropZone = page.getByText(dropZoneText, { exact: false }).first();
        await dropZone.waitFor({ state: 'visible', timeout: 30000 });
        await dropZone.click({ force: true });

        const filePath = 'context-files/test-beschikking.txt';
        let fileInput = dropZone
            .locator('xpath=ancestor::div[contains(@class,"formio-component")]//input[@type="file"]')
            .first();
        if (!(await fileInput.count())) {
            fileInput = page.locator('input[type="file"]').first();
        }

        await fileInput.setInputFiles(filePath);
        console.log(`[${taskName}] File selected, confirming upload...`);

        const opslaanButton = page.getByRole('button', { name: /^Opslaan$/i }).first();
        await opslaanButton.waitFor({ state: 'visible', timeout: 15000 });
        await opslaanButton.click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(1000);

        console.log(`[${taskName}] Clicking "Indienen"...`);
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(2000);

        console.log(`[${taskName}] Task completed.`);
    } catch (error) {
        console.error(`[${taskName}] Failed during task:`, error);
        try {
            await page.screenshot({ path: 'vaststellen-besluit-error.png', fullPage: true });
            console.log(`[${taskName}] Screenshot saved.`);
        } catch (screenshotError) {
            console.error(`[${taskName}] Failed saving screenshot:`, screenshotError);
        }
        throw error;
    }
}
