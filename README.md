# alo-playwright
Playwright script voor ALO regressietesten

## Getting started

1. Installeer afhankelijkheden:
   ```bash
   npm install
   ```
2. Kopieer het voorbeeldbestand met omgevingsvariabelen en vul de waarden in:
   ```bash
   cp .env.properties.example .env.properties
   ```
   - `API_TEST_REQUEST_FILE` wijst naar de `.http` payload template.
   - `API_REQUEST_CONFIG_FILE` wijst naar een JSON met de API-URL's, tokens en objecttypeversies per omgeving (zie `api-requests/request-config.example.json`).
   - `INFRA` bepaalt welke sleutel uit het JSON-bestand gebruikt wordt.
3. (Optioneel) maak je eigen configbestand op basis van het voorbeeld:
   ```bash
   cp api-requests/request-config.example.json api-requests/request-config.local.json
   ```
   Vul voor elke omgeving de juiste URL's, tokens en versies in en pas de paden in `.env.properties` aan.

Daarna kun je de Playwright UI starten met:
```bash
npx playwright test --ui
```
Verzoeken voor nieuwe functionaliteit kunnen worden gedaan via Github. Bij bugs graag een story aanmaken in targetprocess 