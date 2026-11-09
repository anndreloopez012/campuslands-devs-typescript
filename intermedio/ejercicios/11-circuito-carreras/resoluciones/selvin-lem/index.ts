export {};

interface Racer {
    name: string;
    lapTimes: number[];
}

const racers: Racer[] = [
    { name: "Luna", lapTimes: [82.4, 81.9, 83.1] },
    { name: "Marco", lapTimes: [80.8, 82.3, 81.7] },
    { name: "Dani", lapTimes: [84.2, 83.6, 82.9] },
];

const results = racers
    .map((racer) => ({
        name: racer.name,
        total: racer.lapTimes.reduce((sum, time) => sum + time, 0),
        fastest: Math.min(...racer.lapTimes),
    }))
    .sort((first, second) => first.total - second.total);

results.forEach((result, index) => {
    console.log(
        `${index + 1}. ${result.name} | Tiempo: ${result.total.toFixed(1)} s | Mejor vuelta: ${result.fastest.toFixed(1)} s`,
    );
});
