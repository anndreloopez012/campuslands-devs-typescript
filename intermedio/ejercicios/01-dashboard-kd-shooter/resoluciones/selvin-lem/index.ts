export {};

type Role = "asalto" | "francotirador" | "soporte" | "reconocimiento";

interface Player {
    id: number;
    name: string;
    role: Role;
    kills: number;
    deaths: number;
    assists: number;
}

interface PlayerReport extends Player {
    kd: number;
    points: number;
}

const players: Player[] = [
    { id: 1, name: "Vex", role: "asalto", kills: 24, deaths: 8, assists: 5 },
    { id: 2, name: "Nyx", role: "francotirador", kills: 31, deaths: 6, assists: 2 },
    { id: 3, name: "Riko", role: "soporte", kills: 10, deaths: 12, assists: 18 },
    { id: 4, name: "Tala", role: "reconocimiento", kills: 0, deaths: 0, assists: 4 },
];

const isPlayerValid = (player: Player): boolean =>
    player.name.trim() !== "" &&
    player.kills >= 0 &&
    player.deaths >= 0 &&
    player.assists >= 0;

const makeReport = (player: Player): PlayerReport => {
    const kd = player.deaths === 0
        ? player.kills
        : Number((player.kills / player.deaths).toFixed(2));

    return {
        ...player,
        kd,
        points: player.kills + player.assists * 2,
    };
};

const validPlayers = players.filter(isPlayerValid);
const reports = validPlayers.map(makeReport);
reports.sort((first, second) => second.points - first.points);

let totalKills = 0;
let totalDeaths = 0;

for (const player of validPlayers) {
    totalKills += player.kills;
    totalDeaths += player.deaths;
}

const topFragger = [...validPlayers].sort(
    (first, second) => second.kills - first.kills,
)[0];
const mvp = reports[0];
const squadKD = totalDeaths === 0
    ? totalKills
    : Number((totalKills / totalDeaths).toFixed(2));

console.log("Dashboard del squad");

for (const [index, player] of reports.entries()) {
    console.log(
        `${index + 1}. ${player.name} (${player.role}) | K/D: ${player.kd} | Puntos: ${player.points}`,
    );
}

console.log(`Kills totales: ${totalKills}`);
console.log(`Muertes totales: ${totalDeaths}`);
console.log(`K/D del squad: ${squadKD}`);
console.log(`Top fragger: ${topFragger?.name ?? "N/A"}`);
console.log(`MVP: ${mvp?.name ?? "N/A"}`);
