import { config } from 'dotenv';

config({ path: '.env.properties' });

export const URL_DEV = (process.env.URL_DEV ?? '').trim();
export const URL_TEST = (process.env.URL_TEST ?? '').trim();
export const USERNAME_LOCAL = (process.env.USERNAME_LOCAL ?? '').trim();
export const USERNAME_TEST = (process.env.USERNAME_TEST ?? '').trim();
export const PASSWORD_LOCAL = (process.env.PASSWORD_LOCAL ?? '').trim();
export const PASSWORD_TEST = (process.env.PASSWORD_TEST ?? '').trim();
export const SECRET_KEY_TEST = (process.env.SECRET_KEY_TEST ?? process.env.SECRET_KEY ?? '').trim();
