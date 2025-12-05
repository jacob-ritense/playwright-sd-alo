import { expect, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { loginEnv } from '../tasks/login-env';
import { loginDev } from '../tasks/login-dev';

export type LoginEnvironment = 'alo-dev' | 'alo-test' | 'alo-acc';

export async function login(page: Page, environment: LoginEnvironment) {
    if (environment === 'alo-test' || environment === 'alo-acc') {
        await loginEnv(page, environment);
    } else {
        await loginDev(page);
    }
}

export async function waitForAngular(page: Page) {
  console.log('Waiting for Angular to initialize...');
  try {
    await page.waitForSelector('app-root', { state: 'attached', timeout: 30000 });
    await page.waitForFunction(() => {
      const angular = (window as any).ng;
      const appRootElement = document.querySelector('app-root');
      return angular && appRootElement && angular.getComponent(appRootElement);
    }, { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
  } catch (error) {
    console.error('Failed waiting for Angular:', error.message);
    try {
      const currentUrl = page.url();
      console.error('Current URL during Angular wait failure:', currentUrl);
      const content = await page.content();
      console.error('Page content during Angular wait failure (first 1000 chars):', content.substring(0,1000));
      await page.screenshot({ path: 'angular-wait-failure.png', fullPage: true });
    } catch (debugError) {
      console.error('Could not get debug info during Angular wait failure:', debugError.message);
    }
    throw new Error(`Angular initialization timeout or error: ${error.message}`);
  }
}

// Aanpassen per process
export async function navigateToAlgemeneBijstandAanvraag(page: Page) {
  console.log('Navigating to Algemene bijstand section...');
  try {
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await waitForAngular(page);
    
    const dossierButton = page.getByRole('button', {name: 'Dossiers'});
    await dossierButton.waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);
    await dossierButton.click();
    
    let maxAttempts = 3;
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const abLink = page.getByRole('link', {name: 'Algemene bijstand'});
        await abLink.waitFor({ state: 'visible', timeout: 10000 });
        await abLink.click();
        break;
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          await dossierButton.click();
          await page.waitForTimeout(1000);
        } else {
          throw error;
        }
      }
    }
    
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const alleDossiersTab = page.getByRole('tab', {name: 'Alle dossiers'});
        await alleDossiersTab.waitFor({ state: 'visible', timeout: 15000 });
        await page.waitForTimeout(1000);
        await alleDossiersTab.click();
        await page.waitForSelector('table', { state: 'visible', timeout: 15000 });
        return;
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          await page.reload();
          await waitForAngular(page);
          await page.waitForTimeout(2000);
        } else {
          throw new Error(`Failed to access Alle dossiers tab after ${maxAttempts} attempts: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error('Navigation failed:', error);
    await page.screenshot({ path: 'navigation-error.png', fullPage: true });
    throw new Error(`Navigation failed: ${error.message}`);
  }
}

export async function openCreatedCase(page: Page, publicReference: string) {
  console.log(`Opening case for public_reference: ${publicReference}`);
  try {
    await page.waitForSelector('table', { state: 'visible', timeout: 15000 });

    const maxAttempts = 10;
    let attempts = 0;
    let caseFound = false;

    while (!caseFound && attempts < maxAttempts) {
      try {
        const caseCell = page.getByRole('cell', { name: publicReference });
        
        if (await caseCell.isVisible()) {
          const row = caseCell.locator('xpath=ancestor::tr');
          const isDisabled = await row.getAttribute('aria-disabled') === 'true';
          if (isDisabled) {
            throw new Error(`Case for ${publicReference} is not accessible (locked/disabled)`);
          }

          await row.click();
          await page.waitForLoadState('networkidle', { timeout: 30000 });
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(5000);
          
          caseFound = true;
          console.log('Found and clicked case row');
        } else {
          attempts++;
          await page.evaluate(() => {
            const table = document.querySelector('table');
            if (table) {
              table.scrollTop = table.scrollTop + 500;
            }
          });
          await page.waitForTimeout(5000);
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        await page.waitForTimeout(5000);
      }
    }

    if (!caseFound) {
      throw new Error(`Case for ${publicReference} not found in table after ${maxAttempts} attempts`);
    }

    await verifyCaseDetails(page);
    console.log('Case opened successfully');
  } catch (error) {
    console.error('Failed to open case:', error);
    await page.screenshot({ path: 'case-open-error.png', fullPage: true });
    throw new Error(`Failed to open case: ${error.message}`);
  }
}

async function verifyCaseDetails(page: Page) {
  console.log('Verifying case details...');
  try {
    console.log('Current URL:', page.url());
    const title = await page.title();
    console.log('Page title:', title);

    const loadingIndicator = page.getByRole('progressbar');
    if (await loadingIndicator.isVisible()) {
      await loadingIndicator.waitFor({ state: 'hidden', timeout: 30000 });
    }

    const possibleElements = [
      { type: 'text', content: 'Voortgang' },
      { type: 'text', content: 'Algemeen' },
      { type: 'text', content: 'Details' },
      { type: 'text', content: 'Taken' },
      { type: 'class', content: 'case-details' },
      { type: 'class', content: 'zaak-details' },
      { type: 'class', content: 'detail-view' },
      { type: 'attr', content: '[data-testid*="case"]' },
      { type: 'attr', content: '[data-testid*="zaak"]' }
    ];

    let foundElements: string[] = [];
    for (const element of possibleElements) {
      let isVisible = false;
      if (element.type === 'text') {
        if (element.content === 'Taken') {
          isVisible = await page.getByRole('heading', { name: 'Taken', exact: true }).isVisible();
        } else {
          isVisible = await page.getByText(element.content, { exact: false }).isVisible();
        }
      } else if (element.type === 'class') {
        isVisible = await page.locator(`[class*="${element.content}"]`).isVisible();
      } else if (element.type === 'attr') {
        isVisible = await page.locator(element.content).isVisible();
      }
      
      if (isVisible) {
        foundElements.push(element.content);
      }
    }

    if (foundElements.length === 0) {
      const content = await page.content();
      console.log('Page content:', content.substring(0, 500) + '...');
      throw new Error('No case detail elements found on the page');
    }

    const elementsToClick = ['Voortgang', 'Algemeen'] as const;
    for (const element of elementsToClick) {
      const elementHandle = page.getByText(element, { exact: true });
      if (await elementHandle.isVisible()) {
        try {
          await elementHandle.click();
          console.log(`Successfully clicked ${element}`);
        } catch (error) {
          console.log(`Could not click ${element}:`, error.message);
        }
      }
    }

    console.log('Case details verified successfully');
  } catch (error) {
    console.error('Case details verification failed:', error);
    await page.screenshot({ path: 'case-details-error.png', fullPage: true });
    throw error;
  }
}

// function generateInputValue(label: string): string {
//   const lowercaseLabel = label.toLowerCase();
//   if (lowercaseLabel.includes('email')) {
//     return faker.internet.email();
//   } else if (lowercaseLabel.includes('telefoon') || lowercaseLabel.includes('number')) {
//     return faker.phone.number();
//   } else if (lowercaseLabel.includes('datum')) {
//     return faker.date.recent().toISOString().split('T')[0];
//   } else if (lowercaseLabel.includes('bedrag') || lowercaseLabel.includes('amount')) {
//     return faker.number.int({ min: 100, max: 1000 }).toString();
//   } else {
//     return faker.lorem.words(3);
//   }
// }

// Helper config (tweak anytime)
const maxAttempts = 8;        // how many retries
const minWaitSeconds = 3;      // first retry wait
const maxWaitSeconds = 10;     // cap for wait

export async function openTask(page, taskName) {

    await page.waitForTimeout(2000);
    console.log(`→ openTask("${taskName}")`);

    const locator = page.getByText(taskName, { exact: true });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Attempt ${attempt}/${maxAttempts}: looking for "${taskName}"`);

        try {
            await locator.waitFor({ state: "visible", timeout: 10000 });
            await locator.click();

            await page.waitForLoadState("networkidle", { timeout: 15000 });
            await page.waitForTimeout(2000);

            console.log(`✓ Task "${taskName}" opened on attempt ${attempt}`);
            return;
        } catch {
            if (attempt === maxAttempts) break;

            // Scaled wait: minWaitSeconds, +1 each attempt, capped at maxWaitSeconds
            const waitSeconds = Math.min(minWaitSeconds + (attempt - 1), maxWaitSeconds);
            console.log(`Not found → waiting ${waitSeconds}s → reloading`);

            await page.waitForTimeout(waitSeconds * 1000);
            await page.reload();

            await page.waitForLoadState("networkidle", { timeout: 15000 });
            await page.waitForTimeout(2000);
        }
    }

    throw new Error(`Failed to find task "${taskName}" after ${maxAttempts} attempts.`);
}


export async function claimCase(page) {
    console.log(`→ claimCase()`);

    try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        const overflowBtn = page.getByRole('button', { name: 'Overflow' });
        await overflowBtn.waitFor({ state: 'visible', timeout: 5000 });
        await overflowBtn.click();

        const claimItem = page.getByRole('menuitem', { name: 'Claimen' });
        await claimItem.waitFor({ state: 'visible', timeout: 5000 });
        await claimItem.click();

        await page.waitForTimeout(2000);

        console.log(`✓ Case claimed`);
    } catch (err) {
        console.error(`✗ Failed to claim case:`, err);
    }
}

export async function checkBezwaarTermijn(page: Page) {
    const label = '(Eind)controle: Lopende bezwaartermijn';

    console.log(`[${label}] Waiting 5 seconds before navigating to "Voortgang"...`);
    await page.waitForTimeout(5_000);

    console.log(`[${label}] Navigating to "Voortgang" tab...`);
    await page.getByRole('tab', { name: 'Voortgang' }).click();

    const target = page.getByText(/lopende bezwaartermijn/i);

    try {
        console.log(`[${label}] Expecting "lopende bezwaartermijn" to be visible (first attempt)...`);
        await expect(target).toBeVisible({ timeout: 10_000 });
    } catch {
        console.warn(`[${label}] "lopende bezwaartermijn" not found, reloading page and retrying once...`);
        await page.reload();
        await page.waitForLoadState('domcontentloaded');

        console.log(`[${label}] Navigating again to "Voortgang" tab...`);
        await page.getByRole('tab', { name: 'Voortgang' }).click();

        const targetAfterReload = page.getByText(/lopende bezwaartermijn/i);
        await expect(targetAfterReload).toBeVisible({ timeout: 5_000 });
    }

    console.log(`[${label}] Navigating back to "Algemeen" tab...`);
    await page.getByRole('tab', { name: 'Algemeen' }).click();
    await page.waitForLoadState('networkidle', { timeout: 10_000 });
}