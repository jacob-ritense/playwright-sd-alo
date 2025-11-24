// tasks/adhoc-task.spec.ts
import { Page } from '@playwright/test';
import { getOptionForTask, type Option } from '../../test-cases/test-scenario-picker';
import type { TestData } from '../multi-function-ab-flow';

// follow-up tasks
import vastleggenIntrekkingTask from './vastleggen-intrekking.spec';
import vastleggenBuitenBehandelingStellingTask from './vastleggen-buiten-behandeling-stelling.spec';

const TASK_KEY = 'adhoc-task';

type OptionHandler = (page: Page) => Promise<void>;

const startRestartFlow = async (page: Page) => {
    console.log('Starting "Taak opnieuw starten" flow...');
    await page.getByRole('menuitem', { name: 'Taak opnieuw starten' }).click();
    await page.locator('.choices > div').first().click();
};

const optionHandlers: Partial<Record<Option, OptionHandler>> = {
    // A, B, C, D, E, G, H → submit with "Doorgaan"
    A: async (page) => {
        console.log('Option A: "Aanvraag buiten behandeling"');
        await page.getByRole('menuitem', { name: 'Aanvraag buiten behandeling' }).click();
        console.log('Option A submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();
        await page.waitForTimeout(5000); // Wait 5 seconds to avoid bug
    },
    B: async (page) => {
        console.log('Option B: "Aanvraag intrekken"');
        await page.getByRole('menuitem', { name: 'Aanvraag intrekken' }).click();
        console.log('Option B submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();
        await page.waitForTimeout(5000); // Wait 5 seconds to avoid bug
    },
    C: async (page) => {
        console.log('Option C: "Behandeling aanvraag opnieuw"');
        await page.getByRole('menuitem', { name: 'Behandeling aanvraag opnieuw' }).click();

        console.log('Option C submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();
        await page.waitForTimeout(5000); // Wait 5 seconds to avoid bug
    },
    D: async (page) => {
        console.log('Option D: "Brongegevens verversen"');
        await page.getByRole('menuitem', { name: 'Brongegevens verversen' }).click();
        console.log('Option D submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();
    },
    E: async (page) => {
        console.log('Option E: "Contactgegevens wijzigen"');
        await page.getByRole('menuitem', { name: 'Contactgegevens wijzigen' }).click();
        console.log('Option E submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();
    },
    F: async (page) => {
        console.log('Option F: "Informatieverzoek annuleren"');
        await page.getByRole('menuitem', { name: 'Informatieverzoek annuleren' }).click();
        console.log('Option F submit: Clicking "Informatieverzoek annuleren"...');
        await page.getByRole('button', { name: 'Informatieverzoek annuleren' }).click();
    },
    G: async (page) => {
        console.log('Option G: "Informatieverzoek deadline"');
        await page.getByRole('menuitem', { name: 'Informatieverzoek deadline' }).click();
        console.log('Option G submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();
    },
    H: async (page) => {
        console.log('Option H: "Informatieverzoek handmatige"');
        await page.getByRole('menuitem', { name: 'Informatieverzoek handmatige' }).click();
        console.log('Option H submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();
    },

    // I–O → restart flow + "Indienen"
    I: async (page) => {
        console.log('Option I: "Opnieuw informatieverzoek"');
        await startRestartFlow(page);
        await page.getByText('Opnieuw informatieverzoek').click();
        console.log('Option I submit: Clicking "Indienen"...');
        await page.getByRole('button', { name: 'Indienen' }).click();
    },
    J: async (page) => {
        console.log('Option J: "Opnieuw vaststellen leef en"');
        await startRestartFlow(page);
        await page.getByText('Opnieuw vaststellen leef en').click();
        console.log('Option J submit: Clicking "Indienen"...');
        await page.getByRole('button', { name: 'Indienen' }).click();
    },
    K: async (page) => {
        console.log('Option K: "Opnieuw vaststellen verblijfadres aanvrager"');
        await startRestartFlow(page);
        await page.getByText('Opnieuw vaststellen verblijfadres aanvrager').click();
        console.log('Option K submit: Clicking "Indienen"...');
        await page.getByRole('button', { name: 'Indienen' }).click();
    },
    L: async (page) => {
        console.log('Option L: "Opnieuw vaststellen verblijfadres partner"');
        await startRestartFlow(page);
        await page.getByText('Opnieuw vaststellen verblijfadres partner').click();
        console.log('Option L submit: Clicking "Indienen"...');
        await page.getByRole('button', { name: 'Indienen' }).click();
    },
    M: async (page) => {
        console.log('Option M: "Opnieuw vaststellen verblijfstitel aanvrager"');
        await startRestartFlow(page);
        await page.getByText('Opnieuw vaststellen verblijfstitel aanvrager').click();
        console.log('Option M submit: Clicking "Indienen"...');
        await page.getByRole('button', { name: 'Indienen' }).click();
    },
    N: async (page) => {
        console.log('Option N: "Opnieuw vaststellen verblijfstitel partner"');
        await startRestartFlow(page);
        await page.getByText('Opnieuw vaststellen verblijfstitel partner').click();
        console.log('Option N submit: Clicking "Indienen"...');
        await page.getByRole('button', { name: 'Indienen' }).click();
    },
    O: async (page) => {
        console.log('Option O: "Opnieuw vaststellen ingangsdatum"');
        await startRestartFlow(page);
        await page.getByText('Opnieuw vaststellen ingangsdatum').click();
        console.log('Option O submit: Clicking "Indienen"...');
        await page.getByRole('button', { name: 'Indienen' }).click();
    },
};

export default async function adhocTask(page: Page, testData: TestData) {
    let option: Option | undefined;

    try {
        console.log('Starting adhoc task: clicking "Start"...');
        await page.getByRole('button', { name: 'Start' }).click();

        option = getOptionForTask(TASK_KEY, 'A');
        console.log(`Adhoc task option from scenario picker: ${option}`);

        const handler = optionHandlers[option] ?? optionHandlers.A!;
        await handler(page);
        console.log(`Adhoc task flow completed for option "${option}".`);

        // 🔁 Follow-up tasks AFTER adhoc completion
        if (option === 'A') {
            console.log(
                'Option A selected – running follow-up task "Vastleggen buiten behandeling stelling"...'
            );
            await vastleggenBuitenBehandelingStellingTask(page, testData);
            console.log(
                'Follow-up task "Vastleggen buiten behandeling stelling" completed.'
            );
        } else if (option === 'B') {
            console.log(
                'Option B selected – running follow-up task "Vastleggen intrekking"...'
            );
            await vastleggenIntrekkingTask(page, testData);
            console.log('Follow-up task "Vastleggen intrekking" completed.');
        }
    } catch (error) {
        console.error(
            `Failed during adhoc task processing (option: ${option ?? 'unknown'}):`,
            error
        );
        try {
            const screenshotName = option
                ? `adhoc-task-${option}-error.png`
                : 'adhoc-task-error.png';
            await page.screenshot({ path: screenshotName, fullPage: true });
            console.log(`Error screenshot saved as ${screenshotName}`);
        } catch (screenshotError) {
            console.error('Failed to save error screenshot:', screenshotError);
        }
        throw error;
    }
}
