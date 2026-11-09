export {};

type JumpType = "solo" | "tandem" | "formacion";

interface Jump {
    jumper: string;
    type: JumpType;
    altitude: number;
    date: string;
}

const jumps: Jump[] = [
    { jumper: "Sel", type: "solo", altitude: 3800, date: "2026-03-12" },
    { jumper: "Mara", type: "tandem", altitude: 4200, date: "2026-03-18" },
    { jumper: "Sel", type: "formacion", altitude: 3600, date: "2026-04-02" },
    { jumper: "Leo", type: "solo", altitude: 4000, date: "2026-04-10" },
];

const jumpCounts: Record<JumpType, number> = {
    solo: 0,
    tandem: 0,
    formacion: 0,
};

jumps.forEach((jump) => {
    jumpCounts[jump.type]++;
    console.log(`${jump.date}: ${jump.jumper} - ${jump.type} desde ${jump.altitude} m`);
});

console.log(`Saltos solo: ${jumpCounts.solo}`);
console.log(`Saltos tandem: ${jumpCounts.tandem}`);
console.log(`Saltos en formacion: ${jumpCounts.formacion}`);
