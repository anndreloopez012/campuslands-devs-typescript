let dorsales: number[] = [1, 10, 5, 3, 2]
let jugadores: string[] = ["Poctasio", "Malandro", "Pichon", "Mich", "Sack"];
const marcador: [number,number] = [2,1];


//Metodos 
jugadores.push("Moncho");

const goles : number = marcador[0] + marcador[1]

const plantilla: string[] = jugadores.map(
    (jugador, index) => `#${dorsales[index]} ${jugador}`
);

console.log("Futbol Sala:" + plantilla.join(","));
console.log("Marcador del partido: " + marcador[0] + " - " + marcador[1]);
console.log(`Total de goles: ${goles}`);