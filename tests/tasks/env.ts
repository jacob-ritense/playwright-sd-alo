import { config } from 'dotenv';

config({ path: '.env.properties' });

export const URL_DEV = (process.env.URL_DEV ?? '').trim();
export const URL_TEST = (process.env.URL_TEST ?? '').trim();

export const USERNAME_DEV = (process.env.USERNAME_DEV ?? '').trim();
export const USERNAME_TEST = (process.env.USERNAME_TEST ?? '').trim();

export const PASSWORD_DEV = (process.env.PASSWORD_DEV ?? '').trim();
export const PASSWORD_TEST = (process.env.PASSWORD_TEST ?? '').trim();

export const SECRET_KEY_TEST = (process.env.SECRET_KEY_TEST ?? process.env.SECRET_KEY ?? '').trim();
