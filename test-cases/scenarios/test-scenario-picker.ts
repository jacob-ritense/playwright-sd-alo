// test-scenario-picker.ts
export type Option = 'A' | 'B' | 'C' | 'D' | 'E'

const TASKS_BY_NUMBER: Record<number, string> = {
    1: 'overwegen-inzet-handhaving', //A = Nee, B = Ja
    2: 'overwegen-uitzetten-infoverzoek', //A = Nee, B = Ja
    3: 'vaststellen-persoon-aanvrager', //A = Ja BRP, B = Nee
    4: 'vaststellen-verblijfadres-aanvrager', //A = Verblijfadres, B = BRP adres, C = Anders
    5: 'vaststellen-besluit', //A = Afwijzen, B = Lening, C = Krediethypotheek, D = Lening om niet
};

export const SCENARIOS: Record<string, string> = {
    A: '1A, 2A, 3A ,4A, 5A',
    B: '1A, 2A, 3A, 4B, 5B',
    C: '1B, 2B, 3A, 4B, 5B',
};

let activeScenario = 'A';
let activeMap = new Map<string, Option>();

function parseScenario(spec: string): Map<string, Option> {
    const map = new Map<string, Option>();
    if (!spec?.trim()) return map;
    for (const raw of spec.split(',')) {
        const s = raw.trim();
        const m = /^(\d+)\s*([A-Z])$/i.exec(s);
        if (!m) throw new Error(`Invalid scenario item "${s}" (expected "2B")`);
        const num = Number(m[1]);
        const opt = m[2].toUpperCase() as Option;
        const taskId = TASKS_BY_NUMBER[num];
        if (!taskId) throw new Error(`No task mapped for number ${num}`);
        map.set(taskId, opt);
    }
    return map;
}

export function setActiveScenario(key: keyof typeof SCENARIOS) {
    const spec = SCENARIOS[key];
    if (!spec) throw new Error(`Unknown scenario "${String(key)}"`);
    activeScenario = String(key);
    activeMap = parseScenario(spec);
    console.log(`Active scenario set to ${activeScenario}: ${spec}`);
}

export function getOptionForTask(taskIdOrNumber: string | number, fallback: Option = 'A'): Option {
    const taskId = typeof taskIdOrNumber === 'number'
        ? (TASKS_BY_NUMBER[taskIdOrNumber] ?? '')
        : taskIdOrNumber;

    if (!taskId) throw new Error(`Unknown task "${String(taskIdOrNumber)}"`);
    return activeMap.get(taskId) ?? fallback;
}
