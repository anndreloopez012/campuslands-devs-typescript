export {};

interface Match {
    home: string;
    away: string;
    round: number;
}

const teams = ["Halcones", "Titanes", "Rayo", "Fenix"];
const matches: Match[] = [];

for (let home = 0; home < teams.length; home++) {
    for (let away = home + 1; away < teams.length; away++) {
        matches.push({
            home: teams[home],
            away: teams[away],
            round: matches.length + 1,
        });
    }
}

matches.sort((first, second) => first.round - second.round);
matches.forEach((match) => {
    console.log(`Fecha ${match.round}: ${match.home} vs ${match.away}`);
});
console.log(`Equipos: ${teams.length} | Partidos: ${matches.length}`);
