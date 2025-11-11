// test-scenario-picker.ts
export type Option = 'A' | 'B' | 'C' | 'D' | 'E';

const TASKS_BY_NUMBER: Record<number, string> = {
    1: 'opvoeren-dienst-socrates',
    2: 'overwegen-inzet-handhaving',
    3: 'vastleggen-uitkomst-poortonderzoek',
    4: 'overwegen-uitzetten-infoverzoek',
    5: 'vaststellen-persoon-aanvrager',
    6: 'vaststellen-persoon-partner',
    7: 'vaststellen-verblijfadres-aanvrager',
    8: 'vaststellen-verblijfadres-partner',
    9: 'vaststellen-verblijfstitel-aanvrager',
    10: 'vaststellen-verblijfstitel-partner',
    11: 'vaststellen-aanvangsdatum',
    12: 'vaststellen-ingangsdatum',
    13: 'vaststellen-leef-woonsituatie',
    14: 'vaststellen-woonsituatie',
    15: 'vaststellen-leefsituatie',
    16: 'vaststellen-besluit',
};

export const SCENARIOS: Record<string, string> = {
    A: '1,2A,4A,5A,6A,7A,8A,9A,10A,11,12,13,14A,15A,16A',
    B: '1,2B,3,4A,5A,6A,7B,8B,9B,10B,11,12,13,14B,15C,16B',
    C: '1,2A,3,4A,5A,6A,7A,8A,9A,10A,11,12,13,14A,15A,16A',
};

let activeScenario = 'A';
let activeMap = new Map<string, Option>();
let activeSteps: Array<{ num: number; taskId: string; option?: Option }> = [];

function normalizeItems(spec: string): string[] {
    return spec.split(',')
        .map(s => s.trim())
        .filter(Boolean);
}

function parseScenario(spec: string): {
    options: Map<string, Option>,
    steps: Array<{ num: number; taskId: string; option?: Option }>
} {
    const options = new Map<string, Option>();
    const steps: Array<{ num: number; taskId: string; option?: Option }> = [];

    if (!spec?.trim()) return { options, steps };

    const items = normalizeItems(spec);
    for (const raw of items) {
        // Accept "12A" or "12"
        const m = /^(\d+)(?:\s*([A-Z]))?$/i.exec(raw);
        if (!m) throw new Error(`Invalid scenario item "${raw}" (expected "2B" or "2")`);
        const num = Number(m[1]);
        const letter = m[2]?.toUpperCase() as Option | undefined;

        const taskId = TASKS_BY_NUMBER[num];
        if (!taskId) throw new Error(`No task mapped for number ${num}`);

        steps.push({ num, taskId, option: letter });
        if (letter) options.set(taskId, letter); // only set when a letter is provided
    }

    return { options, steps };
}

export function setActiveScenario(key: keyof typeof SCENARIOS) {
    const spec = SCENARIOS[key];
    if (!spec) throw new Error(`Unknown scenario "${String(key)}"`);
    activeScenario = String(key);
    const parsed = parseScenario(spec);
    activeMap = parsed.options;
    activeSteps = parsed.steps;
    console.log(`Active scenario set to ${activeScenario}: ${spec}`);
}

export function getOptionForTask(taskIdOrNumber: string | number, fallback: Option = 'A'): Option {
    const taskId = typeof taskIdOrNumber === 'number'
        ? (TASKS_BY_NUMBER[taskIdOrNumber] ?? '')
        : taskIdOrNumber;

    if (!taskId) throw new Error(`Unknown task "${String(taskIdOrNumber)}"`);
    return activeMap.get(taskId) ?? fallback;
}

// Handy when you want to execute exactly in scenario order:
export function getActiveScenarioSteps() {
    return [...activeSteps]; // [{num, taskId, option?}, ...]
}

