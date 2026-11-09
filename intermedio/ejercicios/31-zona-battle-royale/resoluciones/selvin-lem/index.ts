export {};

type ZoneState = "segura" | "fuera";

interface Player {
    name: string;
    distanceToZone: number;
    state: ZoneState;
    health: number;
}

const players: Player[] = [
    { name: "Rex", distanceToZone: 0, state: "segura", health: 82 },
    { name: "Lia", distanceToZone: 120, state: "fuera", health: 55 },
    { name: "Tao", distanceToZone: 45, state: "fuera", health: 24 },
    { name: "Uma", distanceToZone: 0, state: "segura", health: 100 },
];

const damagePerRound = 15;
const survivors = players.map((player) => ({
    ...player,
    health: player.state === "fuera"
        ? Math.max(0, player.health - damagePerRound)
        : player.health,
}));

survivors.forEach((player) => {
    const status = player.health === 0 ? "eliminado" : player.state;
    console.log(`${player.name}: ${status}, vida ${player.health}`);
});
console.log(`Jugadores restantes: ${survivors.filter((player) => player.health > 0).length}`);
