// test-scenario-picker.ts
export type Option = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
                         | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O';

// Map variant -> HTTP file
export const REQUEST_FILES = {
    V1: './api-requests/verzoek-ab-handmatig.http',
    V2: './api-requests/verzoek-ab-automatisch.http',
    V3: './api-requests/verzoek-ab-nora.http',
    // V3: '...', etc.
} as const;

export type RequestVariant = keyof typeof REQUEST_FILES; // 'V1' | 'V2' | ...

// Create your scenarios here.
export const SCENARIOS = {
    // first token = V*, rest = steps
    Default: 'V1, 1, 2A, 4A, 5A, 6A, 7A, 8A, 9A, 10A, 11, 12A, 14A',                // Normal flow - Everything Manual (fastest route)
    A: 'V3, 1, 2A, 4A, 14A',                                                        // Normal flow - Everything Automatic
    B: 'V1, 1, 2B, 3, 4A, 5B, 5A, 6B, 6A, 7B, 8C, 9B, 10B, 11, 12B, 14B',           // Normal flow - Everything Manual (slow route)
    C: 'V3, 1, 4A, 99C, 2A, 4A, 99C, 2A, 4A, 14A, 99C, 2A, 4A, 14B',                // Adhoc flow  - Check "Aanvraag opnieuw starten" (During all phases)
    D: 'V3, 1, 2A, 4A, 99A',                                                        // Adhoc flow  - Check "Buiten behandeling stellen"
    E: 'V3, 1, 2A, 4A, 99B',                                                        // Adhoc flow  - Check "Aanvraag intrekken"             //Needs testing
    F: 'V1, 1, 2A, 4A, 5A, 99D, 99E',                                               // Adhoc flow  - Check "Brongegevens verversen" & "Contactgegevens wijzigen
    G: 'V1, 1, 2A, 4B, 99G, 99F',                                                   // Adhoc flow  - Check "Infoverzoek deadline verlengen" & "Infoverzoek annuleren"
    H: 'V1, 1, 2A, 4B, 99H, 5A, 99I, 4A',                                           // Adhoc flow  - Check "Infoverzoek handmatige reactie" & "Opnieuw infoverzoek"
    I: 'V1, 1, 2A, 4A, 5A, 6A, 7A, 8A, 99K, 7B, 8B, 99L, 8A',                       // Adhoc flow  - Check "Opnieuw vaststellen verblijfadres aanvrager + partner"
    J: 'V1, 1, 2A, 4A, 5A, 6A, 7A, 8A, 9A, 10A, 99M, 9B, 10B, 99N, 10A',            // Adhoc flow  - Check "Opnieuw vaststellen verblijfstitel aanvrager + partner"
    K: 'V1, 1, 2A, 4A, 5A, 6A, 7A, 8A, 9A, 10A, 11, 12A, 99J, 12A, 13A',            // Adhoc flow  - Check "Opnieuw vaststellen leef en woonsituatie"
    L: 'V1, 1, 2A, 4A, 5A, 6A, 7A, 8A, 9A, 10A, 11, 99O, 11, 12A, 14A',             // Adhoc flow  - Check "Opnieuw vaststellen ingangsdatum"
    // Z: '...', etc.

} as const;

export type ScenarioKey = keyof typeof SCENARIOS;

const TASKS_BY_NUMBER: Record<number, string> = {
    1: 'opvoeren-dienst-socrates',                  // Geen keuzes
    2: 'overwegen-inzet-handhaving',                // A = Nee              B = Ja
    3: 'vastleggen-uitkomst-poortonderzoek',        // Geen keuzes
    4: 'overwegen-uitzetten-infoverzoek',           // A = Nee,             B = Ja
    5: 'vaststellen-persoon-aanvrager',             // A = Ja BRP           B = Nee (ander BSN)
    6: 'vaststellen-persoon-partner',               // A = Ja BRP           B = Nee (ander BSN)
    7: 'vaststellen-verblijfstitel-aanvrager',      // A = Ja               B = Nee
    8: 'vaststellen-verblijfstitel-partner',       // A = Ja               B = Nee
    9: 'vaststellen-ingangsdatum',                 // Geen keuzes
    10: 'vaststellen-verblijfadres-aanvrager',       // A = Verblijfadres    B = BRP adres, C = Anders
    11: 'vaststellen-verblijfadres-partner',         // A = Verblijfadres    B = BRP adres, C = Anders
    12: 'vaststellen-woonsituatie',                 // A: 1-belanghebbend-zelfstandig-Art23JA   B: 2-belanghebbend-instelling-Art23NEE
    13: 'vaststellen-leefsituatie',                 // ABCDE (1st - 5th option)
    14: 'vaststellen-besluit',                      // A = Afwijzen     B = Lening    C = Krediethypotheek    D = Lening om niet

    99: 'adhoc-task', // Ad hoc tasks
    // A = Aanvraag buiten behandeling
    // B = Aanvraag intrekken
    // C = Behandeling aanvraag opnieuw
    // D = Brongegevens verversen
    // E = Contactgegevens wijzigen
    // F = Informatieverzoek annuleren
    // G = Informatieverzoek deadline
    // H = Informatieverzoek handmatige reactie
    // I = Opnieuw informatieverzoek
    // J = Opnieuw vaststellen leef en woonsituatie
    // K = Opnieuw vaststellen verblijfadres aanvrager
    // L = Opnieuw vaststellen verblijfadres partner
    // M = Opnieuw vaststellen verblijfstitel aanvrager
    // N = Opnieuw vaststellen verblijfstitel partner
    // O = Opnieuw vaststellen ingangsdatum
};

let activeScenario: ScenarioKey = 'A';
let activeMap = new Map<string, Option>(); // you can later delete this if unused
let activeSteps: Array<{ num: number; taskId: string; option?: Option }> = [];
let activeVariant: RequestVariant | null = null;
let stepCursor = 0;

function normalizeItems(spec: string): string[] {
    return spec.split(',').map(s => s.trim()).filter(Boolean);
}

function parseScenario(spec: string) {
    const options = new Map<string, Option>();
    const steps: Array<{ num: number; taskId: string; option?: Option }> = [];

    if (!spec?.trim()) {
        return { variant: null as RequestVariant | null, options, steps };
    }

    const items = normalizeItems(spec);

    // 1) First token may be V1 / V2 / ...
    let variant: RequestVariant | null = null;
    if (items.length && /^V\d+$/i.test(items[0])) {
        const key = items.shift()!.toUpperCase() as RequestVariant;
        if (!REQUEST_FILES[key]) {
            throw new Error(`Unknown request variant "${key}" in scenario spec "${spec}"`);
        }
        variant = key;
    }

    // 2) Remaining tokens are the numbered steps
    for (const raw of items) {
        const m = /^(\d+)(?:\s*([A-Z]))?$/i.exec(raw);
        if (!m) throw new Error(`Invalid scenario item "${raw}" (expected "2B" or "2")`);
        const num = Number(m[1]);
        const letter = m[2]?.toUpperCase() as Option | undefined;

        const taskId = TASKS_BY_NUMBER[num];
        if (!taskId) throw new Error(`No task mapped for number ${num}`);

        steps.push({ num, taskId, option: letter });
        if (letter) options.set(taskId, letter);
    }

    return { variant, options, steps };
}

export function setActiveScenario(key: ScenarioKey) {
    const spec = SCENARIOS[key];
    if (!spec) throw new Error(`Unknown scenario "${String(key)}"`);

    activeScenario = key;
    const parsed = parseScenario(spec);
    activeMap = parsed.options;
    activeSteps = parsed.steps;
    activeVariant = parsed.variant;
    stepCursor = 0;

    console.log(`Active scenario set to ${activeScenario}: ${spec}`);
}

export function getOptionForTask(taskIdOrNumber: string | number, fallback: Option = 'A'): Option {
    const TASKS_BY_NUMBER_LOCAL = TASKS_BY_NUMBER;
    const taskId = typeof taskIdOrNumber === 'number'
        ? (TASKS_BY_NUMBER_LOCAL[taskIdOrNumber] ?? '')
        : taskIdOrNumber;

    if (!taskId) throw new Error(`Unknown task "${String(taskIdOrNumber)}"`);

    // Look for the next scenario step for this task starting at the cursor.
    for (let i = stepCursor; i < activeSteps.length; i++) {
        const step = activeSteps[i];
        if (step.taskId === taskId) {
            stepCursor = i + 1; // consume this occurrence
            return step.option ?? fallback;
        }
    }

    // No remaining steps for this task → default fallback behavior
    return fallback;
}

export function getActiveScenarioSteps() {
    return [...activeSteps];
}


export function getActiveRequestFile(): string {
    if (!activeVariant) throw new Error('No request variant set for active scenario');
    return REQUEST_FILES[activeVariant];
}



