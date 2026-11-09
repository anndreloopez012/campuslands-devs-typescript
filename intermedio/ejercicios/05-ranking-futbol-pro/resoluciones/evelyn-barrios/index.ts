export {};

type PosicionCampo = "Portero" | "Defensa" | "Centrocampista" | "Delantero";

interface RendimientoJugador {
  readonly id: string;
  readonly nombre: string;
  readonly posicion: PosicionCampo;
  readonly partidosJugados: number;
  readonly goles: number;
  readonly asistencias: number;
  readonly tarjetasAmarillas: number;
  readonly tarjetasRojas: number;
}

interface EstadisticasCalculadas extends RendimientoJugador {
  readonly participacionGoles: number;
  readonly promedioGolesPorPartido: number;
  readonly puntosFairPlay: number;
  readonly valoracionGeneral: number;
}

function calcularMetricasJugador(jugador: RendimientoJugador): EstadisticasCalculadas {
  const partidos = jugador.partidosJugados === 0 ? 1 : jugador.partidosJugados;
  const participacionGoles = jugador.goles + jugador.asistencias;
  const promedioGolesPorPartido = Number((jugador.goles / partidos).toFixed(2));
  
  // Fair Play: 100 puntos base - 5 por amarilla - 15 por roja
  const puntosFairPlay = Math.max(0, 100 - (jugador.tarjetasAmarillas * 5 + jugador.tarjetasRojas * 15));

  // Fórmula ponderada según la posición
  let factorPosicion = 1;
  switch (jugador.posicion) {
    case "Delantero":
      factorPosicion = 1.2;
      break;
    case "Centrocampista":
      factorPosicion = 1.1;
      break;
    case "Defensa":
      factorPosicion = 1.0;
      break;
    case "Portero":
      factorPosicion = 0.9;
      break;
  }

  const valoracionGeneral = Number(
    ((participacionGoles * 4 * factorPosicion) + (puntosFairPlay * 0.2) + (partidos * 1.5)).toFixed(1)
  );

  return {
    ...jugador,
    participacionGoles,
    promedioGolesPorPartido,
    puntosFairPlay,
    valoracionGeneral,
  };
}

function generarRanking(jugadores: readonly RendimientoJugador[]): EstadisticasCalculadas[] {
  return jugadores
    .map(calcularMetricasJugador)
    .sort((a, b) => b.valoracionGeneral - a.valoracionGeneral);
}

const plantillaEquipo: RendimientoJugador[] = [
  { id: "fut-01", nombre: "Mateo Silva", posicion: "Delantero", partidosJugados: 18, goles: 14, asistencias: 6, tarjetasAmarillas: 2, tarjetasRojas: 0 },
  { id: "fut-02", nombre: "Lucas Benítez", posicion: "Centrocampista", partidosJugados: 20, goles: 5, asistencias: 12, tarjetasAmarillas: 3, tarjetasRojas: 0 },
  { id: "fut-03", nombre: "Carlos Duarte", posicion: "Defensa", partidosJugados: 19, goles: 2, asistencias: 3, tarjetasAmarillas: 5, tarjetasRojas: 1 },
  { id: "fut-04", nombre: "David Ospina", posicion: "Portero", partidosJugados: 20, goles: 0, asistencias: 1, tarjetasAmarillas: 1, tarjetasRojas: 0 },
];

const rankingOficial = generarRanking(plantillaEquipo);

console.log("=== RANKING DE JUGADORES DE FÚTBOL ===");
rankingOficial.forEach((j, index) => {
  console.log(
    `#${index + 1} ${j.nombre} (${j.posicion}) - Valoración: ${j.valoracionGeneral} | Goles: ${j.goles} | Asistencias: ${j.asistencias} | FairPlay: ${j.puntosFairPlay} pts`
  );
});
