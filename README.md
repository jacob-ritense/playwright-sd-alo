# Playwright SD ALO E2E Tests

End-to-end Playwright-tests voor de Sociaal Domein algemene-bijstand flows. De suite kan vooraf gedefinieerde scenario’s draaien, verzoeken via de API aanmaken en de UI end-to-end aansturen.

## Repository klonen
- `gh repo clone jacob-ritense/playwright-sd-alo`
- `cd playwright-sd-alo`

## Packages installeren
- Vereisten: Node 18+ en npm.
- Dependencies installeren: `npm install`
- Playwright-browsers installeren (eerste run of na upgrades): `npx playwright install`

## `.env.properties` en request-variabelen instellen
1) Kopieer het voorbeeld: `env.properties.example` en hernoem het naar `.env.properties`
2) Vul de waarden in:
   - Vul je Den haag gebruikersnaam in onder `USERNAME_TEST`.
   - Vul je Den haag wachtwoord in onder `PASSWORD_TEST`.
   - Als je voor het eerst gebruik maakt, maak dan een secret key aan volgens de stappen onderaan dit document.
   - Vul je 2 factor authentication key toe in `SECRET_KEY_TEST`.
3) Haal  `http-client.private.env.json` op uit keepass en sla hem op in de map  `api-requests`

Houd geheimen buiten versiebeheer; `.env.properties.example` laat alle vereiste velden zien.

## Tests draaien
- Playwright UI-modus: `npx playwright test --ui`, klik de play knop(pen) naast de te draaien tests.
- Draai alle gecreeerde tests op de achtergrond: `npx playwright test`
- Enkele test: `npx playwright test test-cases/jouw_te_draaien_test`

## Scenario’s maken en draaien
### Scenario’s definiëren (`test-cases/test-scenario-picker.ts`)
- Koppel nieuwe request-varianten in `REQUEST_FILES` (bijv. `V3: './api-requests/<jouw-bestand>.http'`).
- Voeg een scenario toe in `SCENARIOS`. Formaat: `V*` voor het request-bestand, gevolgd door genummerde stappen met optionele opties, bijv. `'D: "V2, 1,2B,4A,5A,6A,7C,..."'`.
- De business services staan in `TASKS_BY_NUMBER`; letters kiezen de gekozen optie (A/B/C...). Herhaalde business services in de string worden in die volgorde uitgevoerd.

### Scenario’s draaien (`test-cases/automatic-ab-flow-runner.spec.ts`)
- Elke entry in de `scenarios`-array is een test:
  - `INFRA`: kies de infra-sleutel (`alo-dev`, `alo-test`, `alo-acc`) — moet overeenkomen met de sleutels in `.env.properties` en `http-client.private.env.json`.
  - `Scenario`: een van de sleutels die je in `SCENARIOS` hebt gedefinieerd.
  - Optioneel `lastTask`: stopt de flow na deze taak voor een gedeeltelijke run.
- Voeg entries toe of pas ze aan in de `scenarios`-array en run de spec (zie commands hierboven). De runner kiest het API-requestbestand en voert de taken in de opgegeven volgorde uit.

### Handmatige env-flow (`test-cases/manual-ab-flow-runner.spec.ts`)
- Gebruikt direct de waarden uit `.env.properties` (`INFRA_*`, `API_TEST_REQUEST_FILE` en credentials) zonder de scenario picker.
- Handig voor snelle smoke-runs tegen één omgeving; run zoals elke andere spec.

## Resultaten
- In de UI zijn resultaten zichtbaar onder de test window
- Via commandline zijn resultaten te vinden in de mapppen `test-results` en `playwright-report`



## Projectstructuur (globaal)
- `test-cases/` — Playwright-specs en scenario-runner.
- `tests/tasks/` — Task-modules die binnen de flows worden uitgevoerd.
- `api-requests/` — HTTP-requesttemplates en API-omgevings-JSON.
- `scripts/generate-report.ts` — Bouwt na een run het HTML/JSON-rapport.



Een Microsoft-aanmeldmethode met 2-factor-authenticatie aanmaken

Ga naar portal.azure.com en log in met het account dat je met Playwright wilt gebruiken.
Navigeer rechtsboven naar je account, en druk up "View account".
Klik op "Security Info".
Klik op “Add sign-in method”.
Kies Microsoft Authenticator.
Klik op “Set up a different authentication app” en daarna op Next.
Wanneer de QR-code wordt getoond, klik op “Can't scan the QR code?”.
Sla de weergegeven Secret key veilig op in je env.properties.   
Wanneer om een 6-cijferige code wordt gevraagd:
    Ga naar https://totp.danhersam.com/ en vul je secret key in om een code te genereren.
    Ga terug naar de configuratiestap in portal.azure.com en voer de 6-cijferige code in.


Login testen

Open een incognito browser en ga naar een site achter de Microsoft-login, bijvoorbeeld portal.azure.com.
Log in met gebruikersnaam en wachtwoord.
Als de 2-factor pop-up verschijnt, klik op: “I can't use my Microsoft Authenticator app right now”.
Klik op: “Use a verification code”.
Gebruik een code die wordt gegenereerd via https://totp.danhersam.com met jouw secret key.