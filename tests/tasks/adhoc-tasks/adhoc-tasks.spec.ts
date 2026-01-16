// tasks/adhoc-task.spec.ts
import { Page } from '@playwright/test';
import { getOptionForTask, type Option } from '../../../test-cases/test-scenario-picker';

// follow-up tasks
import vastleggenIntrekkingTask from './vastleggen-intrekking.spec';
import vastleggenBuitenBehandelingStellingTask from './vastleggen-buiten-behandeling-stelling.spec';
import wijzigenContactgegevensAanvragerTask from './wijzigen-contactgegevens-aanvrager.spec';
import invoerenNieuweDeadlineTask from "./invoeren-nieuwe-deadline.spec";
import uploadenOntvangenDocumentenTask from "./uploaden-ontvangen-documenten.spec";
import {checkBezwaarTermijn} from "../../helper-functions/utils";

const TASK_KEY = 'adhoc-task';

type OptionHandler = (page: Page) => Promise<void>;

const restartTask = async (page: Page, taskName: string) => {
    console.log(`Restarting task: "${taskName}"`);
    await page.getByRole('menuitem', { name: 'Taak opnieuw starten' }).click();

    const dropdown = page.locator('.choices > div').first();
    const option = page.getByRole('option', { name: taskName, exact: false });

    const chip = page.getByText(
        new RegExp(`^${escapeRegExp(taskName)}.*Remove item$`)
    );

    const maxAttempts = 5;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Selecting "${taskName}" (attempt ${attempt}/${maxAttempts})`);

        await dropdown.click();
        await option.click();
        await page.waitForTimeout(1000);

        const found = await chip.first().isVisible().catch(() => false);
        if (found) {
            console.log(`Confirmed selected item for "${taskName}"`);
            console.log(`Submitting restart for: "${taskName}"`);
            await page.getByRole('button', { name: 'Indienen' }).click();
            return;
        }

        if (attempt === maxAttempts) {
            throw new Error(`Failed to select "${taskName}" after ${maxAttempts} attempts (no "Remove item" chip found)`);
        }
    }
};

function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}



const optionHandlers: Partial<Record<Option, OptionHandler>> = {
    A: async (page) => {
        console.log('Option A: "Aanvraag buiten behandeling"');
        await page.getByRole('menuitem', { name: 'Aanvraag buiten behandeling' }).click();
        console.log('Option A submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();

        await vastleggenBuitenBehandelingStellingTask(page);
        await checkBezwaarTermijn(page);
    },
    B: async (page) => {
        console.log('Option B: "Aanvraag intrekken"');
        await page.getByRole('menuitem', { name: 'Aanvraag intrekken' }).click();
        console.log('Option B submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();

        await vastleggenIntrekkingTask(page);
        await checkBezwaarTermijn(page);
    },
    C: async (page) => {
        console.log('Option C: "Behandeling aanvraag opnieuw"');
        await page.getByRole('menuitem', { name: 'Behandeling aanvraag opnieuw' }).click();
        console.log('Option C submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();
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

        await wijzigenContactgegevensAanvragerTask(page);
    },
    F: async (page) => {
        console.log('Option F: "Informatieverzoek annuleren"');
        await page.getByRole('menuitem', { name: 'Informatieverzoek annuleren' }).click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 });
        console.log('Option F submit: Clicking "Informatieverzoek annuleren"...');
        await page.getByRole('button', { name: 'Informatieverzoek annuleren' }).click();
    },
    G: async (page) => {
        console.log('Option G: "Informatieverzoek deadline"');
        await page.getByRole('menuitem', { name: 'Informatieverzoek deadline' }).click();
        console.log('Option G submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();

        await invoerenNieuweDeadlineTask(page);
    },
    H: async (page) => {
        console.log('Option H: "Informatieverzoek handmatige"');
        await page.getByRole('menuitem', { name: 'Informatieverzoek handmatige' }).click();
        console.log('Option H submit: Clicking "Doorgaan"...');
        await page.getByRole('button', { name: 'Doorgaan' }).click();

        await uploadenOntvangenDocumentenTask(page);
    },
    I: async (page) => {
        console.log('Option I: "Opnieuw informatieverzoek"');
        await restartTask(page, 'Opnieuw informatieverzoek');
    },
    J: async (page) => {
        console.log('Option J: "Opnieuw vaststellen leef en"');
        await restartTask(page, 'Opnieuw vaststellen leef en');
    },
    K: async (page) => {
        console.log('Option K: "Opnieuw vaststellen verblijfadres aanvrager"');
        await restartTask(page, 'Opnieuw vaststellen verblijfadres aanvrager');
    },
    L: async (page) => {
        console.log('Option L: "Opnieuw vaststellen verblijfadres partner"');
        await restartTask(page, 'Opnieuw vaststellen verblijfadres partner');
    },
    M: async (page) => {
        console.log('Option M: "Opnieuw vaststellen verblijfstitel aanvrager"');
        await restartTask(page, 'Opnieuw vaststellen verblijfstitel aanvrager');
    },
    N: async (page) => {
        console.log('Option N: "Opnieuw vaststellen verblijfstitel partner"');
        await restartTask(page, 'Opnieuw vaststellen verblijfstitel partner');
    },
    O: async (page) => {
        console.log('Option O: "Opnieuw vaststellen ingangsdatum"');
        await restartTask(page, 'Opnieuw vaststellen ingangsdatum');
    },
};

export default async function adhocTask(page: Page) {
    let option: Option | undefined;

    try {
        console.log('Starting adhoc task: clicking "Start"...');
        await page.getByRole('button', { name: 'Start' }).click();

        option = getOptionForTask(TASK_KEY, 'D');
        console.log(`Adhoc task option from scenario picker: ${option}`);

        const handler = optionHandlers[option] ?? optionHandlers.D!;
        await handler(page);

        await page.waitForTimeout(2_000);
        await page.waitForLoadState('networkidle', { timeout: 15_000 });

        console.log(
            `Adhoc task flow (including any follow-up) completed for option "${option}".`
        );
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
