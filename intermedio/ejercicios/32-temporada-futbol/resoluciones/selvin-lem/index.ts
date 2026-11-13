export {};

interface Match {
    home: string;
    away: string;
    homeGoals: number;
    awayGoals: number;
}

interface Standing {
    points: number;
    goalsFor: number;
    goalsAgainst: number;
}

const matches: Match[] = [
    { home: "Leon", away: "Atlas", homeGoals: 2, awayGoals: 1 },
    { home: "Atlas", away: "Pumas", homeGoals: 0, awayGoals: 0 },
    { home: "Pumas", away: "Leon", homeGoals: 3, awayGoals: 2 },
    { home: "Leon", away: "Pumas", homeGoals: 1, awayGoals: 0 },
];

const table: Record<string, Standing> = {};

for (const match of matches) {
    table[match.home] ??= { points: 0, goalsFor: 0, goalsAgainst: 0 };
    table[match.away] ??= { points: 0, goalsFor: 0, goalsAgainst: 0 };
    table[match.home].goalsFor += match.homeGoals;
    table[match.home].goalsAgainst += match.awayGoals;
    table[match.away].goalsFor += match.awayGoals;
    table[match.away].goalsAgainst += match.homeGoals;

    if (match.homeGoals > match.awayGoals) table[match.home].points += 3;
    else if (match.homeGoals < match.awayGoals) table[match.away].points += 3;
    else {
        table[match.home].points++;
        table[match.away].points++;
    }
}

Object.entries(table)
    .sort((first, second) =>
        second[1].points - first[1].points ||
        (second[1].goalsFor - second[1].goalsAgainst) -
        (first[1].goalsFor - first[1].goalsAgainst),
    )
    .forEach(([team, standing], index) => {
        console.log(`${index + 1}. ${team}: ${standing.points} pts, DG ${standing.goalsFor - standing.goalsAgainst}`);
    });
