export {};

interface Player {
  name: string;
  kills: number;
  deaths: number;
  assists: number;
}

const kd = (kills: number, deaths: number): number =>
  deaths === 0 ? kills : Number((kills / deaths).toFixed(2));

const dashboard = (players: readonly Player[]): void => {
  const kills = players.reduce((total, player) => total + player.kills, 0);
  const deaths = players.reduce((total, player) => total + player.deaths, 0);
  const top = [...players].sort((a, b) => b.kills - a.kills)[0];
  const mvp = [...players].sort((a, b) =>
    (b.kills * 3 + b.assists - b.deaths) - (a.kills * 3 + a.assists - a.deaths))[0];

  players.forEach((player) =>
    console.log(`${player.name}: K/D ${kd(player.kills, player.deaths)}`));
  console.log(`Kills: ${kills} | Muertes: ${deaths} | K/D squad: ${kd(kills, deaths)}`);
  console.log(`Top: ${top?.name ?? "N/A"} | MVP: ${mvp?.name ?? "N/A"}`);
};

const normal: readonly Player[] = [
  { name: "Vex", kills: 24, deaths: 8, assists: 5 },
  { name: "Nyx", kills: 31, deaths: 6, assists: 2 },
  { name: "Riko", kills: 10, deaths: 12, assists: 18 },
];

const limite: readonly Player[] = [
  { name: "Tala", kills: 0, deaths: 0, assists: 4 },
];

dashboard(normal);
dashboard(limite);
