// test-scenario-picker.ts
export type Option = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
                         | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O';

// Map variant -> HTTP file
export const REQUEST_FILES = {
    V1: './api-requests/verzoek-alo-ab-dcm-acc-currency-test.http',
    V2: './api-requests/verzoek-ab-automatisch.http',
    // V3: '...', etc.
} as const;

export type RequestVariant = keyof typeof REQUEST_FILES; // 'V1' | 'V2' | ...

export const SCENARIOS = {
    // first token = V*, rest = steps
    A: 'V1, 1,2A,4A,5A,6A,7A,8A,9A,10A,12,14A,16A',
    B: 'V1, 1,2B,3,4A,5B,5A,6A,7C,8C,9A,10B,12,14B,16B',
    C: 'V1, 1,2A,3,4A,5A, 99A, 6A,7C,8A,9B,10B,12,14A,16C',
    // D: '...', etc.
} as const;

export type ScenarioKey = keyof typeof SCENARIOS;

const TASKS_BY_NUMBER: Record<number, string> = {
    1: 'opvoeren-dienst-socrates', // Geen keuzes
    2: 'overwegen-inzet-handhaving', //A = Nee, B = Ja
    3: 'vastleggen-uitkomst-poortonderzoek', // Geen keuzes
    4: 'overwegen-uitzetten-infoverzoek', //A = Nee, B = Ja
    5: 'vaststellen-persoon-aanvrager', //A = Ja BRP, B = Nee (ander BSN)
    6: 'vaststellen-persoon-partner', //A = Ja BRP, B = Nee
    7: 'vaststellen-verblijfadres-aanvrager', //A = Verblijfadres, B = BRP adres, C = Anders
    8: 'vaststellen-verblijfadres-partner', //A = Verblijfadres, B = BRP adres, C = Anders
    9: 'vaststellen-verblijfstitel-aanvrager', //A = Ja , B = Nee
    10: 'vaststellen-verblijfstitel-partner', //A = Ja , B = Nee
    11: 'vaststellen-aanvangsdatum', // Geen keuzes
    12: 'vaststellen-ingangsdatum', // Geen keuzes
    13: 'vaststellen-leef-woonsituatie', // Geen keuzes
    14: 'vaststellen-woonsituatie', // A: 1-belanghebbend-zelfstandig-Art23JA B: 2-belanghebbend-instelling-Art23NEE
    15: 'vaststellen-leefsituatie', //ABCDE (1st - 5th option)
    16: 'vaststellen-besluit', //A = Afwijzen, B = Lening, C = Krediethypotheek, D = Lening om niet

    99: 'adhoc-task', // Ad hoc tasks
    // A = Aanvraag buiten behandeling
    // B = Aanvraag intrekken
    // C = Behandeling aanvraag opnieuw
    // D = Brongegevens verversen
    // E = Contactgegevens wijzigen
    // F = Informatieverzoek annuleren
    // G = Informatieverzoek deadline
    // H = Informatieverzoek handmatige
    // I = Opnieuw informatieverzoek
    // J = Opnieuw vaststellen leef en
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



