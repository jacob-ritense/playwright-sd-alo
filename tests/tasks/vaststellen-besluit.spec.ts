// tasks/vaststellen-besluit.ts
import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { getOptionForTask, type Option } from '../../test-cases/scenarios/test-scenario-picker';

interface TestData {
    lastName: string;
    requestId: string | null;
}

// Shared helpers used by B/C/D
async function selectToekennen(page: Page, flowTaskName: string) {
    console.log(`[${flowTaskName}] Selecting "Toekennen" radio option...`);
    const toekennenRadio = page.getByRole('radio', { name: /^Toekennen$/i });
    await toekennenRadio.waitFor({ state: 'visible', timeout: 20000 });
    await toekennenRadio.check();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(1000);
}

async function pickBijstandsvorm(
    page: Page,
    flowTaskName: string,
    optionName: 'Lening' | 'Krediethypotheek' | 'Uitkering om niet'
) {
    const logText =
        optionName === 'Lening'
            ? `[${flowTaskName}] Selecting bijstandsvorm "Lening"...`
            : optionName === 'Krediethypotheek'
                ? `[${flowTaskName}] Selecting bijstandsvorm "Krediethypotheek"...`
                : `[${flowTaskName}] Selecting bijstandsvorm "Uitkering om niet"...`;

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

// Option handlers (A has unique flow; B/C/D share helpers)
const optionHandlers: Record<Option, (page: Page, flowTaskName: string) => Promise<void>> = {
    A: async (page, flowTaskName) => {
        console.log(`[${flowTaskName}] Selecting "Afwijzen" radio option...`);
        const afwijzenRadio = page.getByRole('radio', { name: /^Afwijzen$/i });
        await afwijzenRadio.waitFor({ state: 'visible', timeout: 20000 });
        await afwijzenRadio.check();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(1000);

        const redenAfwijzing = faker.lorem.words(6);
        console.log(`Filling "Reden afwijzing" with: "${redenAfwijzing}"`);
        await page.getByRole('textbox', { name: 'Reden afwijzing' }).fill(redenAfwijzing);
    },

    B: async (page, flowTaskName) => {
        await selectToekennen(page, flowTaskName);
        await pickBijstandsvorm(page, flowTaskName, 'Lening');
    },

    C: async (page, flowTaskName) => {
        await selectToekennen(page, flowTaskName);
        await pickBijstandsvorm(page, flowTaskName, 'Krediethypotheek');
    },

    D: async (page, flowTaskName) => {
        await selectToekennen(page, flowTaskName);
        await pickBijstandsvorm(page, flowTaskName, 'Uitkering om niet');
    },
};

export default async function vaststellenBesluitTask(page: Page, testData: TestData) {
    const flowTaskName = 'vaststellen-besluit';
    const taskName = 'Vaststellen besluit';

    try {
        console.log(`[${flowTaskName}] Looking for task: "${taskName}"`);
        const taskElement = page.getByText(taskName, { exact: true });
        try {
            await taskElement.waitFor({ state: 'visible', timeout: 30000 });
        } catch (timeoutError) {
            console.warn(`[${flowTaskName}] Task "${taskName}" not visible within timeout, refreshing and retrying...`);
            await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
            await page.waitForTimeout(2000);
            await page.getByText(taskName, { exact: true }).waitFor({ state: 'visible', timeout: 20000 });
        }
        console.log(`[${flowTaskName}] Task "${taskName}" is visible.`);

        await taskElement.click();
        console.log(`[${flowTaskName}] Clicked task: "${taskName}".`);
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(2000);

        // 🔑 Option-specific logic (no duplicated blocks)
        const option = getOptionForTask('vaststellen-besluit', 'A'); // default as you prefer
        await optionHandlers[option](page, flowTaskName);

        // ⬇️ Common upload block — runs for ALL options (A/B/C/D)
        console.log(`[${flowTaskName}] Uploading besluit document...`);
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
        console.log(`[${flowTaskName}] Document "${filePath}" selected, confirming upload...`);

        const opslaanButton = page.getByRole('button', { name: /^Opslaan$/i }).first();
        await opslaanButton.waitFor({ state: 'visible', timeout: 15000 });
        await opslaanButton.click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(1000);

        console.log(`[${flowTaskName}] Clicking "Indienen" button...`);
        await page.getByRole('button', { name: 'Indienen' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(2000);
        console.log(`[${flowTaskName}] Task "${taskName}" completed.`);
    } catch (error) {
        console.error(`[${flowTaskName}] Failed during task processing:`, error);
        try {
            await page.screenshot({ path: 'vaststellen-besluit-error.png', fullPage: true });
            console.log(`[${flowTaskName}] Screenshot saved as vaststellen-besluit-error.png`);
        } catch (screenshotError) {
            console.error(`[${flowTaskName}] Failed to save error screenshot:`, screenshotError);
        }
        throw error;
    }
}


