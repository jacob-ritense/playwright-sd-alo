// test-scenario-picker.ts
export type Option = 'A' | 'B' | 'C';

const TASKS_BY_NUMBER: Record<number, string> = {
    1: 'overwegen-inzet-handhaving',
    // 2: 'some-other-task',
    // 3: 'another-task',
    // 4: 'yet-another-task',
};

export const SCENARIOS: Record<string, string> = {
    //A: '1A,2B,3A,4C',
    A: '1A',
    B: '1B',
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
