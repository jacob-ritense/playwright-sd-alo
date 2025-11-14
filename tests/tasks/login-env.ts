import { Page } from '@playwright/test';
import OTPAuth from 'otpauth';
import { URL_TEST, USERNAME_TEST, PASSWORD_TEST, SECRET_KEY_TEST } from './env';
//import {TestData} from '../multi-function-ab-flow';

export async function loginEnv(page: Page) {

    // TEST or ACC credentials (change later based on given environment)
  const url = URL_TEST;
  const username = USERNAME_TEST;
  const password = PASSWORD_TEST;
  const secretKey = SECRET_KEY_TEST;

  const totp = new OTPAuth.TOTP({
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secretKey,
  });

  await page.goto(url);
  await page.locator("[name='loginfmt']").click();
  await page.locator("[name='loginfmt']").fill(username);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator("[name='passwd']").click();
  await page.locator("[name='passwd']").fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.locator("[id='signInAnotherWay']").click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Use a verification code' }).click();
  await page.getByPlaceholder('Code').click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Code').fill(totp.generate());
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.waitForTimeout(2000);
}
