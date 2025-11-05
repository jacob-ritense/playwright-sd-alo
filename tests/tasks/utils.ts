import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { config } from 'dotenv';

config({ path: '.env.properties' });

export const URL = (process.env.URL_DEV ?? '').trim();
export const USERNAME = (process.env.USERNAME_DEV ?? '').trim();
export const PASSWORD = (process.env.PASSWORD_DEV ?? '').trim();

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

export async function loginLocal(page: Page) {
  console.log('Attempting local login...');
  const loginPageUrl = URL;
  if (!loginPageUrl) {
    throw new Error('URL environment variable is not set. Please configure it in .env.properties.');
  }
  try {
    await page.goto(loginPageUrl);
    console.log(`Navigated to ${loginPageUrl}`);

    if (!USERNAME || !PASSWORD) {
      throw new Error('Missing local login credentials');
    }

    await page.waitForSelector('input[type="text"]', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { state: 'visible', timeout: 10000 });

    await page.getByLabel('Username or email').fill(USERNAME);
    await page.getByLabel('Password').fill(PASSWORD);

    await page.getByRole('button', {name: 'Sign In'}).click();

    await page.waitForURL((url) => url.toString() !== loginPageUrl, { timeout: 15000 });
    await page.waitForLoadState('networkidle', {timeout: 20000});

    const loginErrorVisible = await page.getByText(/invalid credentials|login failed/i).isVisible({timeout: 2000});
    if (loginErrorVisible) {
      await page.screenshot({ path: 'login-credentials-error.png', fullPage: true });
      throw new Error('Login failed - explicit error message displayed');
    }
    console.log('Local login appears successful.');

  } catch (error) {
    console.error('Login failed:', error.message);
    if (!error.message.includes('URL did not change') && !error.message.includes('explicit error message')) {
      await page.screenshot({ path: 'login-generic-error.png', fullPage: true });
    }
    throw new Error(`Login failed: ${error.message}`);
  }
}

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

export async function openCreatedCase(page: Page, lastName: string) {
  console.log(`Opening case for lastName: ${lastName}`);
  try {
    await page.waitForSelector('table', { state: 'visible', timeout: 15000 });

    const maxAttempts = 5;
    let attempts = 0;
    let caseFound = false;

    while (!caseFound && attempts < maxAttempts) {
      try {
        const caseCell = page.getByRole('cell', { name: lastName });
        
        if (await caseCell.isVisible()) {
          const row = caseCell.locator('xpath=ancestor::tr');
          const isDisabled = await row.getAttribute('aria-disabled') === 'true';
          if (isDisabled) {
            throw new Error(`Case for ${lastName} is not accessible (locked/disabled)`);
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
              table.scrollTop = table.scrollTop + 300;
            }
          });
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        await page.waitForTimeout(1000);
      }
    }

    if (!caseFound) {
      throw new Error(`Case for ${lastName} not found in table after ${maxAttempts} attempts`);
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

export async function waitForTask(page: Page, timeout: number = 2000) {
  console.log('Waiting for task to appear...');
  try {
    await page.waitForLoadState('networkidle');
    
    const voortgangTab = page.getByRole('tab', { name: 'Voortgang' });
    await voortgangTab.waitFor({ state: 'visible', timeout: 10000 });
    await voortgangTab.click();
    
    await page.waitForTimeout(2000);
    
    const algemeenTab = page.getByRole('tab', { name: 'Algemeen' });
    await algemeenTab.waitFor({ state: 'visible', timeout: 10000 });
    await algemeenTab.click();
    
    await page.waitForTimeout(timeout);
  } catch (error) {
    console.error('Failed while waiting for task:', error);
    throw new Error(`Task wait failed: ${error.message}`);
  }
}

export async function waitForSpecificTask(page: Page, taskName: string, maxAttempts: number = 10, waitTimeBetweenAttempts: number = 2000): Promise<boolean> {
  console.log(`Waiting for "${taskName}" task to appear...`);
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const algemeenTab = page.getByRole('tab', { name: 'Algemeen' });
      if (await algemeenTab.isVisible()) {
        await algemeenTab.click();
        await page.waitForLoadState('networkidle', { timeout: 5000 });
      } else {
        const voortgangTab = page.getByRole('tab', { name: 'Voortgang' });
        if (await voortgangTab.isVisible()){
          await voortgangTab.click();
          await page.waitForLoadState('networkidle', { timeout: 5000 });
        }
      }
      
      const taskElement = page.getByText(taskName, { exact: true });
      const isVisible = await taskElement.isVisible();

      if (isVisible) {
        console.log(`Task "${taskName}" found after ${attempts + 1} attempts`);
        return true;
      }

      console.log(`Task "${taskName}" not found, refreshing page (attempt ${attempts + 1}/${maxAttempts})`);
      await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(waitTimeBetweenAttempts);
      attempts++;
    } catch (error) {
      console.error(`Error during attempt ${attempts + 1} to find task "${taskName}":`, error.message);
      attempts++;
      if (attempts < maxAttempts) {
        try {
          await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
          await page.waitForTimeout(waitTimeBetweenAttempts);
        } catch (reloadError) {
          console.error('Failed to reload page during error recovery:', reloadError.message);
        }
      }
    }
  }
  console.error(`Task "${taskName}" not found after ${maxAttempts} attempts.`);
  return false;
}

export async function completeSpecificTask(page: Page, taskName: string) {
  console.log(`Starting to complete specific task: "${taskName}"...`);
  try {
    const algemeenTab = page.getByRole('tab', { name: 'Algemeen' });
    if (await algemeenTab.isVisible()) {
      await algemeenTab.click();
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    }

    const taskElement = page.getByText(taskName, { exact: true });
    await taskElement.waitFor({ state: 'visible', timeout: 20000 });
    console.log(`Clicking task: "${taskName}"`);
    await taskElement.click();
    
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(1000);

    await fillFormInputs(page);
    await completeTask(page);
    
    console.log(`Attempted to complete specific task "${taskName}"`);
  } catch (error) {
    console.error(`Failed during completion of specific task "${taskName}":`, error.message);
    await page.screenshot({ path: `complete-specific-task-${taskName.replace(/\\s+/g, '_')}-error.png`, fullPage: true });
    throw new Error(`Failed to complete specific task "${taskName}": ${error.message}`);
  }
}

export async function fillFormInputs(page: Page) {
  const inputs = await page.getByRole('textbox').all();
  for (const input of inputs) {
    if (!await input.inputValue()) {
      const placeholder = await input.getAttribute('placeholder') || '';
      const label = await input.getAttribute('aria-label') || placeholder;
      const value = generateInputValue(label);
      await input.fill(value);
      console.log(`Filled input "${label}" with value: ${value}`);
    }
  }

  const checkboxes = await page.getByRole('checkbox').all();
  for (const checkbox of checkboxes) {
    if (!await checkbox.isChecked()) {
      await checkbox.check();
      console.log('Checked required checkbox');
    }
  }

  const radioGroups = await page.getByRole('radiogroup').all();
  for (const group of radioGroups) {
    const radios = await group.getByRole('radio').all();
    if (radios.length > 0) {
      const firstRadio = radios[0];
      if (!await firstRadio.isChecked()) {
        await firstRadio.check();
        console.log('Selected first radio button option');
      }
    }
  }
}

function generateInputValue(label: string): string {
  const lowercaseLabel = label.toLowerCase();
  if (lowercaseLabel.includes('email')) {
    return faker.internet.email();
  } else if (lowercaseLabel.includes('telefoon') || lowercaseLabel.includes('number')) {
    return faker.phone.number();
  } else if (lowercaseLabel.includes('datum')) {
    return faker.date.recent().toISOString().split('T')[0];
  } else if (lowercaseLabel.includes('bedrag') || lowercaseLabel.includes('amount')) {
    return faker.number.int({ min: 100, max: 1000 }).toString();
  } else {
    return faker.lorem.words(3);
  }
}

export async function completeTask(page: Page) {
  const buttonTexts = ['Bevestigen', 'Doorgaan', 'Opslaan', 'Afronden', 'Volgende', 'De dienst is opgevoerd in Socrates'];
  
  for (const text of buttonTexts) {
    const button = page.getByRole('button', { name: text });
    if (await button.isVisible()) {
      await button.click();
      await page.waitForLoadState('networkidle');
      console.log(`Clicked ${text} button to complete task`);
      return;
    }
  }
  
  throw new Error('No completion button found for task');
} 
