export {};

interface Reading {
    lap: number;
    speed: number;
    rpm: number;
    temperature: number;
}

const readings: Reading[] = [
    { lap: 1, speed: 184, rpm: 9200, temperature: 91 },
    { lap: 2, speed: 202, rpm: 10400, temperature: 96 },
    { lap: 3, speed: 176, rpm: 8700, temperature: 103 },
];

const averageSpeed =
    readings.reduce((sum, reading) => sum + reading.speed, 0) / readings.length;
const warnings = readings.filter((reading) => reading.temperature > 100);

readings.forEach((reading) => {
    console.log(
        `Vuelta ${reading.lap}: ${reading.speed} km/h, ${reading.rpm} rpm, ${reading.temperature} C`,
    );
});
console.log(`Velocidad promedio: ${averageSpeed.toFixed(1)} km/h`);
console.log(
    `Alertas de temperatura: ${warnings.length ? warnings.map((item) => item.lap).join(", ") : "ninguna"}`,
);
