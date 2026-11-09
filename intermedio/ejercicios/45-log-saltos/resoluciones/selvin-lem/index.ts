export {};

type JumpResult = "exitoso" | "cancelado" | "incidente";

interface Jump {
    jumper: string;
    date: string;
    altitude: number;
    result: JumpResult;
}

class JumpLog<T extends Jump> {
    constructor(private readonly entries: T[]) {}

    successfulJumps(jumper: string): T[] {
        return this.entries.filter(
            (entry) => entry.jumper === jumper && entry.result === "exitoso",
        );
    }

    averageAltitude(jumper: string): number {
        const jumps = this.successfulJumps(jumper);
        if (jumps.length === 0) return 0;
        return jumps.reduce((total, jump) => total + jump.altitude, 0) / jumps.length;
    }
}

const jumps: Jump[] = [
    { jumper: "Sel", date: "2026-04-03", altitude: 3900, result: "exitoso" },
    { jumper: "Mara", date: "2026-04-08", altitude: 4200, result: "exitoso" },
    { jumper: "Sel", date: "2026-04-11", altitude: 3500, result: "cancelado" },
    { jumper: "Sel", date: "2026-04-20", altitude: 4100, result: "exitoso" },
];

const log = new JumpLog(jumps);
console.log(`Saltos exitosos de Sel: ${log.successfulJumps("Sel").length}`);
console.log(`Altitud promedio de Sel: ${log.averageAltitude("Sel").toFixed(0)} m`);
