import { Page } from '@playwright/test';
import OTPAuth from 'otpauth';
import {
    URL_TEST,
    USERNAME_TEST,
    PASSWORD_TEST,
    SECRET_KEY_TEST,
    URL_ACC,
    USERNAME_ACC,
    PASSWORD_ACC,
    SECRET_KEY_ACC
} from '../helper-functions/env';
import {LoginEnvironment} from "../helper-functions/utils";

export async function loginEnv(page: Page, environment: LoginEnvironment) {

    // 🔹 1. Pick credentials
    let url: string;
    let username: string;
    let password: string;
    let secretKey: string;

    switch (environment) {
        case 'alo-test':
            url = URL_TEST;
            username = USERNAME_TEST;
            password = PASSWORD_TEST;
            secretKey = SECRET_KEY_TEST;
            break;

        case 'alo-acc':
            url = URL_ACC;
            username = USERNAME_ACC;
            password = PASSWORD_ACC;
            secretKey = SECRET_KEY_ACC;
            break;

        default:
            throw new Error(`Unknown INFRA "${environment}". Expected "alo-test" or "alo-acc".`);
    }

    // 🔹 2. Generate OTP
    const totp = new OTPAuth.TOTP({
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secretKey,
    });

    // 🔹 3. Execute login steps
    await page.goto(url);

    await page.locator("[name='loginfmt']").fill(username);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.locator("[name='passwd']").fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.locator("#signInAnotherWay").click();
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Use a verification code' }).click();
    await page.waitForTimeout(1000);

    await page.getByPlaceholder('Code').fill(totp.generate());
    await page.getByRole('button', { name: 'Verify' }).click();

    await page.waitForTimeout(2000);
}
