// login-dev.ts
import { Page } from '@playwright/test';
import { URL_DEV, USERNAME_DEV, PASSWORD_DEV } from './env';

export async function loginDev(page: Page) {
    const url = URL_DEV;
    const username = USERNAME_DEV;
    const password = PASSWORD_DEV;

    await page.goto(url);

    // Wait for the login fields to be visible
    await page.waitForSelector('input[type="text"]', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { state: 'visible', timeout: 10000 });

    await page.getByLabel('Username or email').fill(username);
    await page.getByLabel('Password').fill(password);

    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait until we navigate away from the login page
    await page.waitForURL(currentUrl => currentUrl.toString() !== url, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 });
}
