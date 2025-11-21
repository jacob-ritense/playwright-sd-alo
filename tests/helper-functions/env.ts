import { config } from 'dotenv';
import type { LoginEnvironment } from './utils'; // adjust path

config({ path: '.env.properties' });

export const URL_DEV = (process.env.URL_DEV ?? '').trim();
export const URL_TEST = (process.env.URL_TEST ?? '').trim();
export const URL_ACC = (process.env.URL_ACC ?? '').trim();

export const USERNAME_DEV = (process.env.USERNAME_DEV ?? '').trim();
export const USERNAME_TEST = (process.env.USERNAME_TEST ?? '').trim();
export const USERNAME_ACC = (process.env.USERNAME_ACC ?? '').trim();

export const PASSWORD_DEV = (process.env.PASSWORD_DEV ?? '').trim();
export const PASSWORD_TEST = (process.env.PASSWORD_TEST ?? '').trim();
export const PASSWORD_ACC = (process.env.PASSWORD_ACC?? '').trim();

export const SECRET_KEY_TEST = (process.env.SECRET_KEY_TEST ?? process.env.SECRET_KEY ?? '').trim();
export const SECRET_KEY_ACC = (process.env.SECRET_KEY_ACC ?? process.env.SECRET_KEY ?? '').trim();

// INFRA for the manual script
export const DEFAULT_INFRA: LoginEnvironment =
    (process.env.INFRA_TEST ?? 'alo-test').trim() as LoginEnvironment;

// API file for the manual script
export const DEFAULT_API_TEST_REQUEST_FILE: string =
    (process.env.API_TEST_REQUEST_FILE ?? '').trim();