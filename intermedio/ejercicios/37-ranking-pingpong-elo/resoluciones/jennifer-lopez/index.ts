export {};

type CategoriaEloPingPong = 'Gran Maestro' | 'Experto' | 'Competitivo' | 'Avanzado' | 'Novato';
type EstadoJugadorElo = 'Activo' | 'EnRacha' | 'EnRiesgo' | 'Suspendido';

interface FichaJugadorPingPong {
  readonly jugadorId: string;
  readonly nombreJugador: string;
  readonly puntajeElo: number;
  readonly partidosJugados: number;
  readonly partidosGanados: number;
  readonly partidosPerdidos: number;
  estado: EstadoJugadorElo;
}

interface ResumenRankingEloPingPong {
  readonly identificador: string;
  readonly jugador: string;
  readonly eloActual: number;
  readonly categoriaAsignada: CategoriaEloPingPong;
  readonly porcentajeVictoriasPct: number;
  readonly estatusCompetitivo: string;
}

const rankingOficialClubPingPong: readonly FichaJugadorPingPong[] = [
  {
    jugadorId: "PP-101",
    nombreJugador: "Tazio Moretti",
    puntajeElo: 2150,
    partidosJugados: 45,
    partidosGanados: 38,
    partidosPerdidos: 7,
    estado: "EnRacha",
  },
  {
    jugadorId: "PP-102",
    nombreJugador: "Kaelen Vestergaard",
    puntajeElo: 1890,
    partidosJugados: 40,
    partidosGanados: 29,
    partidosPerdidos: 11,
    estado: "Activo",
  },
  {
    jugadorId: "PP-103",
    nombreJugador: "Soren Lindqvist",
    puntajeElo: 1650,
    partidosJugados: 35,
    partidosGanados: 20,
    partidosPerdidos: 15,
    estado: "Activo",
  },
  {
    jugadorId: "PP-104",
    nombreJugador: "Aether Vance",
    puntajeElo: 1420,
    partidosJugados: 30,
    partidosGanados: 12,
    partidosPerdidos: 18,
    estado: "EnRiesgo",
  },
  {
    jugadorId: "PP-105",
    nombreJugador: "Marisol Hincapié",
    puntajeElo: 1150,
    partidosJugados: 20,
    partidosGanados: 5,
    partidosPerdidos: 15,
    estado: "Suspendido",
  }
];

function validarJugadorEloActivo(jugador: FichaJugadorPingPong): boolean {
  return jugador.estado !== "Suspendido" && jugador.puntajeElo > 0 && jugador.partidosJugados >= 0;
}

function determinarCategoriaElo(elo: number): CategoriaEloPingPong {
  if (elo >= 2000) return "Gran Maestro";
  if (elo >= 1800) return "Experto";
  if (elo >= 1600) return "Competitivo";
  if (elo >= 1300) return "Avanzado";
  return "Novato";
}

function calcularPorcentajeVictorias(ganados: number, total: number): number {
  if (total === 0) return 0;
  return Number(((ganados / total) * 100).toFixed(1));
}

function procesarRankingEloPingPong(jugadores: readonly FichaJugadorPingPong[]): readonly ResumenRankingEloPingPong[] {
  return jugadores
    .filter(validarJugadorEloActivo)
    .map(jugador => {
      const winRate = calcularPorcentajeVictorias(jugador.partidosGanados, jugador.partidosJugados);
      return {
        identificador: jugador.jugadorId,
        jugador: jugador.nombreJugador,
        eloActual: jugador.puntajeElo,
        categoriaAsignada: determinarCategoriaElo(jugador.puntajeElo),
        porcentajeVictoriasPct: winRate,
        estatusCompetitivo: `Jugador ${jugador.estado} (${jugador.partidosGanados}G / ${jugador.partidosPerdidos}P)`,
      };
    })
    .sort((a, b) => b.eloActual - a.eloActual);
}

function imprimirReporteRanking(titulo: string, resumen: readonly ResumenRankingEloPingPong[]): void {
  console.log(`=== [RANKING ELO PINGPONG] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. [${item.identificador}] ${item.jugador} | ELO: ${item.eloActual} pts | Categoría: ${item.categoriaAsignada} | Win Rate: ${item.porcentajeVictoriasPct}% | Estatus: ${item.estatusCompetitivo}`
    );
  });
  console.log("=================================================================================\n");
}

const resultadoRankingOficial = procesarRankingEloPingPong(rankingOficialClubPingPong);
imprimirReporteRanking("Tabla General de Posiciones del Club", resultadoRankingOficial);

// Caso: Jugador leyenda invicto con ELO superior a 2400 y categoría de Gran Maestro absoluto
const jugadorCasoLimite: readonly FichaJugadorPingPong[] = [
  {
    jugadorId: "PP-9999",
    nombreJugador: "Ma Long Leyenda",
    puntajeElo: 2450,
    partidosJugados: 60,
    partidosGanados: 59,
    partidosPerdidos: 1,
    estado: "EnRacha",
  }
];

const resultadoLimite = procesarRankingEloPingPong(jugadorCasoLimite);
imprimirReporteRanking("Caso: Jugador Leyenda Invicto de Récord Absoluto", resultadoLimite);