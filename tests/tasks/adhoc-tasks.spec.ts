import { Page } from '@playwright/test';



export default async function adhocTask(page: Page) {

    await page.getByRole('button', { name: 'Start' }).click();

    await page.getByRole('menuitem', {name: 'Aanvraag buiten behandeling'}).click();
    await page.getByRole('menuitem', { name: 'Aanvraag intrekken' }).click();
    await page.getByRole('menuitem', { name: 'Behandeling aanvraag opnieuw' }).click();
    await page.getByRole('menuitem', { name: 'Brongegevens verversen' }).click();
    await page.getByRole('menuitem', { name: 'Contactgegevens wijzigen' }).click();
    await page.getByRole('menuitem', { name: 'Informatieverzoek annuleren' }).click();
    await page.getByRole('menuitem', { name: 'Informatieverzoek deadline' }).click();
    await page.getByRole('menuitem', { name: 'Informatieverzoek handmatige' }).click();

    await page.getByRole('menuitem', { name: 'Taak opnieuw starten' }).click();
    await page.locator('.choices > div').first().click();

    await page.getByText('Opnieuw informatieverzoek').click();
    await page.getByText('Opnieuw vaststellen leef en').click();
    await page.getByText('Opnieuw vaststellen verblijfadres aanvrager').click();
    await page.getByText('Opnieuw vaststellen verblijfadres partner').click();
    await page.getByText('Opnieuw vaststellen verblijfstitel aanvrager').click();
    await page.getByText('Opnieuw vaststellen verblijfstitel partner').click();
    await page.getByText('Opnieuw vaststellen ingangsdatum').click();

    await page.getByRole('button', { name: 'Indienen' }).click();


}