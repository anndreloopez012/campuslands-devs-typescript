export {};

type PipelineStage = "modelado" | "rigging" | "animacion" | "render";

interface Shot {
    name: string;
    stage: PipelineStage;
    hours: number;
}

const shots: Shot[] = [
    { name: "Escena del bosque", stage: "animacion", hours: 12 },
    { name: "Nave principal", stage: "modelado", hours: 8 },
    { name: "Personaje guia", stage: "rigging", hours: 6 },
    { name: "Toma final", stage: "render", hours: 10 },
];

const hoursByStage: Record<PipelineStage, number> = {
    modelado: 0,
    rigging: 0,
    animacion: 0,
    render: 0,
};

shots.forEach((shot) => {
    hoursByStage[shot.stage] += shot.hours;
    console.log(`${shot.name}: ${shot.stage} (${shot.hours} h)`);
});

console.log("Horas por etapa");
Object.entries(hoursByStage).forEach(([stage, hours]) => {
    console.log(`${stage}: ${hours} h`);
});
