export {};

interface Fight {
    round: string;
    redCorner: string;
    blueCorner: string;
    redPoints: number;
    bluePoints: number;
}

const fights: Fight[] = [
    { round: "Semifinal 1", redCorner: "Nico", blueCorner: "Ivan", redPoints: 29, bluePoints: 28 },
    { round: "Semifinal 2", redCorner: "Sara", blueCorner: "Milo", redPoints: 27, bluePoints: 30 },
];

const winners: string[] = [];

for (const fight of fights) {
    if (fight.redPoints === fight.bluePoints) {
        console.log(`${fight.round}: empate, requiere desempate`);
        continue;
    }
    const winner = fight.redPoints > fight.bluePoints ? fight.redCorner : fight.blueCorner;
    winners.push(winner);
    console.log(`${fight.round}: avanza ${winner}`);
}

if (winners.length === 2) {
    console.log(`Final: ${winners[0]} vs ${winners[1]}`);
}
