import { Page } from '@playwright/test';

interface TestData {
  lastName: string;
  requestId: string | null;
}

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

    const decisionOption = 'Toekennen';
    const bijstandsvormLabel = 'Bijstandsvorm';
    const bijstandsvormOption = 'Lening';
    console.log(`[${flowTaskName}] Selecting "${decisionOption}" for "Genomen besluit"...`);
    const decisionRadio = page.getByRole('radio', { name: decisionOption });
    try {
      await decisionRadio.waitFor({ state: 'visible', timeout: 20000 });
    } catch (timeoutError) {
      console.warn(`[${flowTaskName}] Option "${decisionOption}" not visible, refreshing and retrying...`);
      await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.getByRole('radio', { name: decisionOption }).waitFor({ state: 'visible', timeout: 20000 });
    }
    await decisionRadio.check();
    console.log(`[${flowTaskName}] "${decisionOption}" selected.`);

    console.log(`[${flowTaskName}] Selecting "${bijstandsvormOption}" for "${bijstandsvormLabel}"...`);
    const bijstandsvormControl = page.getByLabel(bijstandsvormLabel);
    try {
      await bijstandsvormControl.waitFor({ state: 'visible', timeout: 20000 });
    } catch (timeoutError) {
      console.warn(`[${flowTaskName}] "${bijstandsvormLabel}" not visible, refreshing and retrying...`);
      await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.getByRole('radio', { name: decisionOption }).waitFor({ state: 'visible', timeout: 20000 });
      await page.getByRole('radio', { name: decisionOption }).check();
      await page.waitForTimeout(1000);
      await page.getByLabel(bijstandsvormLabel).waitFor({ state: 'visible', timeout: 20000 });
    }

    let bijstandsvormSelected = false;
    try {
      await bijstandsvormControl.selectOption({ label: bijstandsvormOption });
      bijstandsvormSelected = true;
    } catch (selectError) {
      console.warn(`[${flowTaskName}] selectOption failed, falling back to manual selection: ${selectError}`);
    }

    if (!bijstandsvormSelected) {
      const combobox = page.getByRole('combobox', { name: bijstandsvormLabel });
      await combobox.click();
      await page.getByRole('option', { name: bijstandsvormOption, exact: true }).click();
    }

    console.log(`[${flowTaskName}] "${bijstandsvormOption}" selected for "${bijstandsvormLabel}".`);
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
