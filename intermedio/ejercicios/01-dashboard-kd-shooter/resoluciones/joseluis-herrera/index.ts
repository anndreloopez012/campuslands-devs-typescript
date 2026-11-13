export {};

type Rol = 'asalto' | 'apoyo' | 'francotirador';

interface Jugador {
    readonly id: number;
    nombre: string;
    rol: Rol;
    kills: number;
    deaths: number;
}

const jugadores: Jugador[] = [
    { id: 1, nombre: 'Shadow', rol: 'asalto', kills: 25, deaths: 10 },
    { id: 2, nombre: 'Ghost', rol: 'francotirador', kills: 30, deaths: 15 },
    { id: 3, nombre: 'Raven', rol: 'apoyo', kills: 12, deaths: 8 },
    { id: 4, nombre: 'Hunter', rol: 'asalto', kills: 15, deaths: 0 }
];


function validarJugador(jugador: Jugador): boolean {
    return (
        jugador.nombre.trim() !== '' &&
        jugador.kills >= 0 &&
        jugador.deaths >= 0 &&
        Number.isInteger(jugador.kills) &&
        Number.isInteger(jugador.deaths)
    );
}


function calcularKD(kills: number, deaths: number): number {
    return deaths === 0 ? kills : kills / deaths;
}

function calcularEstadisticas(jugador: Jugador) {
  return {
    ...jugador,
    kd: calcularKD(jugador.kills, jugador.deaths)
  };
}


const estadisticas = jugadores
    .filter(validarJugador)
    .map(calcularEstadisticas);


const ranking = [...estadisticas].sort((a, b) => b.kd - a.kd);


const totalKills = estadisticas.reduce((total, jugador) => total + jugador.kills, 0);
const totalDeaths = estadisticas.reduce((total, jugador) => total + jugador.deaths, 0);
const kdEquipo = calcularKD(totalKills, totalDeaths);

console.log('===== DASHBOARD K/D =====');

console.log('Jugadores:', estadisticas.length);
console.log('Kills totales:', totalKills);
console.log('Deaths totales:', totalDeaths);
console.log('K/D del equipo:', kdEquipo.toFixed(2));

console.log('\n===== RANKING =====');

ranking.forEach((jugador, index) => {
    console.log(`${index + 1}. ${jugador.nombre} - K/D: ${jugador.kd.toFixed(2)}`);
});


console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', calcularKD(20, 10)); // El resultado tiene que ser de: 2
console.log('Caso límite:', calcularKD(15, 0));  // El resultado tiene que ser de: 15.
