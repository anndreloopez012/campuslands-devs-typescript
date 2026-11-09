export {};

interface MatchResult {
    winner: string;
    loser: string;
}

interface Standing {
    wins: number;
    losses: number;
    points: number;
}

const results: MatchResult[] = [
    { winner: "Ana", loser: "Leo" },
    { winner: "Mia", loser: "Ana" },
    { winner: "Leo", loser: "Mia" },
    { winner: "Ana", loser: "Leo" },
];
const table: Record<string, Standing> = {};

for (const result of results) {
    table[result.winner] ??= { wins: 0, losses: 0, points: 0 };
    table[result.loser] ??= { wins: 0, losses: 0, points: 0 };
    table[result.winner].wins++;
    table[result.winner].points += 2;
    table[result.loser].losses++;
}

Object.entries(table)
    .sort((first, second) => second[1].points - first[1].points)
    .forEach(([name, standing]) => {
        console.log(`${name}: ${standing.points} pts | ${standing.wins} ganados | ${standing.losses} perdidos`);
    });
