import { Page } from '@playwright/test';
import { openTask  } from '../helper-functions/utils';

interface TestData {
  lastName: string;
  requestId: string | null;
}

export default async function vaststellenAanvangsdatumTask(page: Page, testData: TestData) {
  const taskName = 'Vaststellen aanvangsdatum';

  try {
      await openTask(page, taskName);

    console.log(`[${taskName}] Clicking "Afronden" button...`);
    await page.getByRole('button', { name: 'Afronden' }).click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log(`[${taskName}] Task "${taskName}" completed.`);
  } catch (error) {
    console.error(`[${taskName}] Failed during task processing:`, error);
    try {
      await page.screenshot({ path: 'vaststellen-aanvangsdatum-error.png', fullPage: true });
      console.log(`[${taskName}] Screenshot saved as vaststellen-aanvangsdatum-error.png`);
    } catch (screenshotError) {
      console.error(`[${taskName}] Failed to save error screenshot:`, screenshotError);
    }
    throw error;
  }
}
