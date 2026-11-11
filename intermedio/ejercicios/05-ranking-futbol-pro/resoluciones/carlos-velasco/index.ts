export {};

// tipos
type Posicion = 'portero' | 'defensa' | 'mediocampista' | 'delantero';

interface JugadorFutbol {
  readonly id: number;
  readonly nombre: string;
  posicion: Posicion;
  goles: number;
  asistencias: number;
  partidos: number;
  tarjetasRojas: number;
}

interface PuestoRanking {
  readonly nombre: string;
  readonly puntaje: number;
}

// datos
const jugadores: JugadorFutbol[] = [
  { id: 1, nombre: 'Aroa Silva', posicion: 'delantero', goles: 18, asistencias: 6, partidos: 22, tarjetasRojas: 0 },
  { id: 2, nombre: 'Dante Rio', posicion: 'mediocampista', goles: 9, asistencias: 15, partidos: 25, tarjetasRojas: 1 },
  { id: 3, nombre: 'Muro Ferro', posicion: 'defensa', goles: 3, asistencias: 2, partidos: 27, tarjetasRojas: 2 },
  { id: 4, nombre: 'Luca Mano', posicion: 'portero', goles: 0, asistencias: 0, partidos: 26, tarjetasRojas: 0 },
];

// validacion
function validarJugador(jugador: JugadorFutbol): boolean {
  return jugador.partidos > 0 && jugador.goles >= 0 && jugador.asistencias >= 0 && jugador.tarjetasRojas >= 0;
}

// calculos
function calcularPuntaje(jugador: JugadorFutbol): number {
  const puntajeBase = jugador.goles * 3 + jugador.asistencias * 2;
  const penalizacion = jugador.tarjetasRojas * 4;
  const promedioPartidos = jugador.partidos / 30;
  return Number(((puntajeBase - penalizacion) * promedioPartidos).toFixed(1));
}

function construirRanking(jugadores: JugadorFutbol[]): PuestoRanking[] {
  return jugadores
    .filter(validarJugador)
    .map((jugador) => ({ nombre: jugador.nombre, puntaje: calcularPuntaje(jugador) }))
    .sort((a, b) => b.puntaje - a.puntaje);
}

function goleadores(jugadores: JugadorFutbol[], limite: number): JugadorFutbol[] {
  return [...jugadores].sort((a, b) => b.goles - a.goles).slice(0, limite);
}

// salida
function mostrarResumen(jugadores: JugadorFutbol[]): void {
  console.log('=== Ranking de jugadores de futbol ===');
  console.log('Ranking general:');
  construirRanking(jugadores).forEach((puesto, indice) => {
    console.log(`${indice + 1}. ${puesto.nombre} | Puntaje: ${puesto.puntaje}`);
  });
  console.log('Top goleadores:', goleadores(jugadores, 2).map((jugador) => `${jugador.nombre} (${jugador.goles})`).join(', '));
}

mostrarResumen(jugadores);
