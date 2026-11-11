export {};

// tipos
type MapaFavorito = 'asalto' | 'defensa' | 'mixto';

interface Jugador {
  readonly id: number;
  readonly nickname: string;
  readonly squad: string;
  bajas: number;
  muertes: number;
  partidas: number;
  mapaFavorito: MapaFavorito;
}

interface RankingJugador {
  readonly nickname: string;
  readonly kd: number;
  readonly rating: number;
}

// datos
const jugadores: Jugador[] = [
  { id: 1, nickname: 'Velas', squad: 'Alpha', bajas: 128, muertes: 74, partidas: 30, mapaFavorito: 'asalto' },
  { id: 2, nickname: 'GhostOps', squad: 'Alpha', bajas: 95, muertes: 81, partidas: 28, mapaFavorito: 'defensa' },
  { id: 3, nickname: 'NovaR6', squad: 'Bravo', bajas: 210, muertes: 88, partidas: 34, mapaFavorito: 'mixto' },
  { id: 4, nickname: 'Kilo7', squad: 'Bravo', bajas: 40, muertes: 12, partidas: 6, mapaFavorito: 'asalto' },
  { id: 5, nickname: 'ZeroPing', squad: 'Charlie', bajas: 0, muertes: 0, partidas: 0, mapaFavorito: 'mixto' },
];

// validacion
function validarJugador(jugador: Jugador): string[] {
  const errores: string[] = [];

  if (jugador.bajas < 0) errores.push(`${jugador.nickname}: bajas negativas`);
  if (jugador.muertes < 0) errores.push(`${jugador.nickname}: muertes negativas`);
  if (jugador.partidas < 0) errores.push(`${jugador.nickname}: partidas negativas`);

  return errores;
}

// calculos
function calcularKd(jugador: Jugador): number {
  if (jugador.muertes === 0) return jugador.bajas;
  return Number((jugador.bajas / jugador.muertes).toFixed(2));
}

function calcularRating(jugador: Jugador): number {
  const kd = calcularKd(jugador);
  if (jugador.partidas === 0) return 0;
  return Number(((kd * 40) + (jugador.partidas * 2)).toFixed(1));
}

function construirRanking(jugadores: Jugador[]): RankingJugador[] {
  return jugadores
    .filter((jugador) => validarJugador(jugador).length === 0)
    .map((jugador) => ({
      nickname: jugador.nickname,
      kd: calcularKd(jugador),
      rating: calcularRating(jugador),
    }))
    .sort((a, b) => b.rating - a.rating);
}

function contarPorSquad(jugadores: Jugador[]): Record<string, number> {
  return jugadores.reduce<Record<string, number>>((acumulador, jugador) => {
    acumulador[jugador.squad] = (acumulador[jugador.squad] ?? 0) + 1;
    return acumulador;
  }, {});
}

// salida
function mostrarResumen(jugadores: Jugador[]): void {
  const ranking = construirRanking(jugadores);

  console.log('=== Dashboard K/D de squad shooter ===');
  console.log('Ranking por rating:');
  ranking.forEach((posicion, indice) => {
    console.log(`${indice + 1}. ${posicion.nickname} | K/D: ${posicion.kd} | Rating: ${posicion.rating}`);
  });

  console.log('Jugadores por squad:', contarPorSquad(jugadores));
}

mostrarResumen(jugadores);
