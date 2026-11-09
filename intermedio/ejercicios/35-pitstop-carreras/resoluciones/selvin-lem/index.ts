export {};

type TireType = "blando" | "medio" | "duro";

interface PitStop {
    driver: string;
    tire: TireType;
    stopSeconds: number;
    lap: number;
}

const stops: PitStop[] = [
    { driver: "Luna", tire: "medio", stopSeconds: 2.4, lap: 18 },
    { driver: "Marco", tire: "blando", stopSeconds: 2.1, lap: 20 },
    { driver: "Dani", tire: "duro", stopSeconds: 2.8, lap: 16 },
];

const tireLaps: Record<TireType, number> = {
    blando: 12,
    medio: 20,
    duro: 30,
};

const fastestStop = [...stops].sort(
    (first, second) => first.stopSeconds - second.stopSeconds,
)[0];

stops.forEach((stop) => {
    console.log(`${stop.driver}: vuelta ${stop.lap}, neumatico ${stop.tire}, parada ${stop.stopSeconds}s`);
});
console.log(`Parada mas rapida: ${fastestStop?.driver ?? "N/A"}`);
console.log(`Duracion estimada del blando: ${tireLaps.blando} vueltas`);
