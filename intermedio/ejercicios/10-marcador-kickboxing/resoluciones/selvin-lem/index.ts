export {};

interface RoundScore {
    round: number;
    redCorner: number;
    blueCorner: number;
}

const rounds: RoundScore[] = [
    { round: 1, redCorner: 10, blueCorner: 9 },
    { round: 2, redCorner: 9, blueCorner: 10 },
    { round: 3, redCorner: 10, blueCorner: 9 },
];

const redTotal = rounds.reduce((sum, round) => sum + round.redCorner, 0);
const blueTotal = rounds.reduce((sum, round) => sum + round.blueCorner, 0);
const winner =
    redTotal === blueTotal
        ? "Empate"
        : redTotal > blueTotal
          ? "Esquina roja"
          : "Esquina azul";

rounds.forEach((round) => {
    console.log(
        `Asalto ${round.round}: Rojo ${round.redCorner} - ${round.blueCorner} Azul`,
    );
});
console.log(`Resultado: ${redTotal} - ${blueTotal}`);
console.log(`Ganador: ${winner}`);
