// test-scenario-picker.ts
export type Option = 'A' | 'B' | 'C' | 'D' | 'E'

const TASKS_BY_NUMBER: Record<number, string> = {
    1: 'opvoeren-dienst-socrates', // Geen keuzes
    2: 'overwegen-inzet-handhaving', //A = Nee, B = Ja
    3: 'vastleggen-uitkomst-poortonderzoek', // Geen keuzes
    4: 'overwegen-uitzetten-infoverzoek', //A = Nee, B = Ja
    5: 'vaststellen-persoon-aanvrager', //A = Ja BRP, B = Nee (ander BSN)
    6: 'vaststellen-persoon-partner', //A = Ja BRP, B = Nee
    7: 'vaststellen-verblijfadres-aanvrager', //A = Verblijfadres, B = BRP adres, C = Anders
    8: 'vaststellen-verblijfadres-partner', //A = Verblijfadres, B = BRP adres, C = Anders
    9: 'vaststellen-verblijfstitel-aanvrager', //A = Ja, B = Nee
    10: 'vaststellen-verblijfstitel-partner', //A = Ja, B = Nee
    11: 'vaststellen-aanvangsdatum', // Geen keuzes
    12: 'vaststellen-ingangsdatum', // Geen keuzes
    13: 'vaststellen-leef-woonsituatie', // Geen keuzes
    14: 'vaststellen-woonsituatie', // A: 1-belanghebbend-zelfstandig-Art23JA B: 2-belanghebbend-instelling-Art23NEE
    15: 'vaststellen-leefsituatie', //ABCDE (1st - 5th option)
    16: 'vaststellen-besluit', //A = Afwijzen, B = Lening, C = Krediethypotheek, D = Lening om niet
};

export const SCENARIOS: Record<string, string> = {
    A: '1, 2A,4A, 5A, 6A, 7A, 8A, 9A, 10A, 11, 12, 13, 14A, 15A, 16A',
    B: '1, 2B, 3 ,4A, 5A, 6A, 7B, 8B, 9B, 10B, 11, 12, 13, 14B, 15C, 16B',
    C: '1, 2A, 3 ,4A, 5A, 6A, 7A, 8A, 9A, 10A, 11, 12, 13, 14A, 15A, 16A',
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
