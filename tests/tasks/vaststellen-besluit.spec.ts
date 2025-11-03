import { Page } from '@playwright/test';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function vaststellenBesluitTask(page: Page, testData: TestData) {
  const flowTaskName = 'vaststellen-besluit';
  const taskName = 'Vaststellen besluit';
  const decisionOption = 'Toekennen';
  const bijstandsvormOption = 'LENING';

  const openTask = async () => {
    console.log(`[${flowTaskName}] Looking for task: "${taskName}"`);
    const taskElement = page.getByText(taskName, { exact: true });
    try {
      await taskElement.waitFor({ state: 'visible', timeout: 30000 });
    } catch (timeoutError) {
      console.warn(`[${flowTaskName}] Task not visible, reloading and retrying...`);
      await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.getByText(taskName, { exact: true }).waitFor({ state: 'visible', timeout: 20000 });
    }
    await taskElement.click();
    console.log(`[${flowTaskName}] Clicked task: "${taskName}".`);
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    await page.waitForTimeout(1000);
  };

  const selectDecision = async () => {
    console.log(`[${flowTaskName}] Selecting "${decisionOption}" for "Genomen besluit"...`);
    const decisionRadio = page.getByRole('radio', { name: decisionOption });
    await decisionRadio.waitFor({ state: 'visible', timeout: 20000 });
    await decisionRadio.check();
    console.log(`[${flowTaskName}] "${decisionOption}" selected.`);
  };

  const selectBijstandsvorm = async () => {
    console.log(`[${flowTaskName}] Opening Bijstandsvorm dropdown...`);

    let bijstandDropdown;
    try {
      bijstandDropdown = page.getByRole('combobox', { name: 'Bijstandsvorm' });
      await bijstandDropdown.waitFor({ state: 'visible', timeout: 15000 });
    } catch {
      bijstandDropdown = page.getByRole('combobox', { name: /bijstandsvorm/i });
      await bijstandDropdown.waitFor({ state: 'visible', timeout: 15000 });
    }

    await bijstandDropdown.click();
    await page.waitForTimeout(500);

    let optionLocator;
    try {
      optionLocator = page.getByRole('option', { name: /^Lening$/i });
      await optionLocator.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      optionLocator = page.locator('option, [role="option"]').filter({ hasText: /Lening/i });
      await optionLocator.first().waitFor({ state: 'visible', timeout: 10000 });
    }

    await optionLocator.first().click();
    console.log(`[${flowTaskName}] Selected "Lening" in dropdown.`);

    const hiddenSelectLocator = 'select[name*="verstrekkingsvorm"]';
    const hiddenSelect = page.locator(hiddenSelectLocator).first();
    if (await hiddenSelect.count()) {
      try {
        const currentValue = await hiddenSelect.inputValue();
        if (currentValue !== bijstandsvormOption) {
          await hiddenSelect.selectOption({ value: bijstandsvormOption }).catch(() => undefined);
        }
      } catch (error) {
        console.warn(`[${flowTaskName}] Unable to verify hidden select value: ${error}`);
      }
    }
  };

  try {
    await openTask();
    await selectDecision();
    await selectBijstandsvorm();
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
