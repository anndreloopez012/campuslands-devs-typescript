export {};

interface Player {
    name: string;
    rating: number;
}

interface Match {
    first: string;
    second: string;
    winner: string;
}

const players: Player[] = [
    { name: "Ana", rating: 1200 },
    { name: "Luis", rating: 1350 },
    { name: "Mara", rating: 1280 },
];

const matches: Match[] = [
    { first: "Ana", second: "Luis", winner: "Ana" },
    { first: "Mara", second: "Luis", winner: "Luis" },
];
const ratings = new Map(players.map((player) => [player.name, player.rating]));
const kFactor = 32;

for (const match of matches) {
    const firstRating = ratings.get(match.first);
    const secondRating = ratings.get(match.second);
    if (firstRating === undefined || secondRating === undefined) continue;

    const firstExpected = 1 / (1 + 10 ** ((secondRating - firstRating) / 400));
    const firstScore = match.winner === match.first ? 1 : 0;
    const firstUpdated = Math.round(firstRating + kFactor * (firstScore - firstExpected));
    const secondUpdated = firstRating + secondRating - firstUpdated;
    ratings.set(match.first, firstUpdated);
    ratings.set(match.second, secondUpdated);
}

[...ratings.entries()]
    .sort((first, second) => second[1] - first[1])
    .forEach(([name, rating], index) => console.log(`${index + 1}. ${name}: ${rating} ELO`));
