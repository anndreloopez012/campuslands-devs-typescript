export {};

interface Player {
    name: string;
    goals: number;
    assists: number;
    matches: number;
}

const players: Player[] = [
    { name: "Mateo", goals: 18, assists: 7, matches: 20 },
    { name: "Lucas", goals: 14, assists: 12, matches: 18 },
    { name: "Santi", goals: 9, assists: 15, matches: 21 },
];

const ranking = [...players].sort(
    (first, second) =>
        second.goals * 3 + second.assists - (first.goals * 3 + first.assists),
);

console.log("Ranking de jugadores");
ranking.forEach((player, index) => {
    const points = player.goals * 3 + player.assists;
    console.log(
        `${index + 1}. ${player.name} | Goles: ${player.goals} | Asistencias: ${player.assists} | Puntos: ${points}`,
    );
});
