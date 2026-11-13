export {};

type DemarcacionCancha = 'Delantero' | 'Mediocentro' | 'Defensor' | 'Guardameta';
type EstadoConvocatoria = 'Titular' | 'Suplente' | 'Lesionado';

interface FichaFutbolista {
  readonly fichaId: string;
  readonly nombreCompleto: string;
  readonly clubActual: string;
  readonly demarcacion: DemarcacionCancha;
  readonly golesAnotados: number;
  readonly asistenciasClave: number;
  readonly minutosDisputados: number;
  readonly tarjetasRojas: number;
  estado: EstadoConvocatoria;
}

interface EvaluacionRanking {
  readonly futbolista: string;
  readonly club: string;
  readonly demarcacion: DemarcacionCancha;
  readonly indiceRendimiento: number;
  readonly categoriaTemporada: string;
}

const plantillaLigaElite: readonly FichaFutbolista[] = [
  {
    fichaId: "FUT-301",
    nombreCompleto: "Bastian Lindqvist",
    clubActual: "Nordic Athletic FC",
    demarcacion: "Delantero",
    golesAnotados: 22,
    asistenciasClave: 8,
    minutosDisputados: 2340,
    tarjetasRojas: 0,
    estado: "Titular",
  },
  {
    fichaId: "FUT-302",
    nombreCompleto: "Thiago Montalvo",
    clubActual: "Real Altiplano",
    demarcacion: "Mediocentro",
    golesAnotados: 9,
    asistenciasClave: 17,
    minutosDisputados: 2510,
    tarjetasRojas: 1,
    estado: "Titular",
  },
  {
    fichaId: "FUT-303",
    nombreCompleto: "Cillian Vance",
    clubActual: "Celtic Vanguard",
    demarcacion: "Defensor",
    golesAnotados: 4,
    asistenciasClave: 3,
    minutosDisputados: 2700,
    tarjetasRojas: 0,
    estado: "Titular",
  },
  {
    fichaId: "FUT-304",
    nombreCompleto: "Enzo Bellini",
    clubActual: "Verona United",
    demarcacion: "Delantero",
    golesAnotados: 14,
    asistenciasClave: 5,
    minutosDisputados: 1620,
    tarjetasRojas: 2,
    estado: "Lesionado",
  },
  {
    fichaId: "FUT-305",
    nombreCompleto: "Dario Kovacic",
    clubActual: "Adriatic Sporting",
    demarcacion: "Guardameta",
    golesAnotados: 0,
    asistenciasClave: 2,
    minutosDisputados: 2610,
    tarjetasRojas: 0,
    estado: "Suplente",
  }
];

function validarElegibilidadRanking(jugador: FichaFutbolista): boolean {
  return jugador.estado !== "Lesionado" && jugador.minutosDisputados >= 450;
}

function calcularIndiceRendimiento(jugador: FichaFutbolista): number {
  const aporteOfensivo = jugador.golesAnotados * 4 + jugador.asistenciasClave * 3;
  const penalizacionDisciplina = jugador.tarjetasRojas * 5;
  const factorMinutos = jugador.minutosDisputados / 90;
  const puntuacionBruta = (aporteOfensivo - penalizacionDisciplina) / (factorMinutos > 0 ? factorMinutos : 1);
  return Number((puntuacionBruta * 10).toFixed(2));
}

function clasificarTemporada(indice: number): string {
  if (indice >= 45) return "Candidato Balón de Oro";
  if (indice >= 25) return "Once Ideal de la Liga";
  if (indice >= 10) return "Rendimiento Destacado";
  return "Participación Regular";
}

function generarRankingFutbolistas(jugadores: readonly FichaFutbolista[]): readonly EvaluacionRanking[] {
  return jugadores
    .filter(validarElegibilidadRanking)
    .map(jugador => {
      const indice = calcularIndiceRendimiento(jugador);
      return {
        futbolista: jugador.nombreCompleto,
        club: jugador.clubActual,
        demarcacion: jugador.demarcacion,
        indiceRendimiento: indice,
        categoriaTemporada: clasificarTemporada(indice),
      };
    })
    .sort((a, b) => b.indiceRendimiento - a.indiceRendimiento);
}

function imprimirTablaRanking(titulo: string, ranking: readonly EvaluacionRanking[]): void {
  console.log(`=== [RANKING LIGA PRO] ${titulo} ===`);
  ranking.forEach((registro, posicion) => {
    console.log(
      `${posicion + 1}. ${registro.futbolista} (${registro.club}) - ${registro.demarcacion} | Índice: ${registro.indiceRendimiento} | Nivel: ${registro.categoriaTemporada}`
    );
  });
  console.log("====================================================\n");
}

const rankingTemporadaActual = generarRankingFutbolistas(plantillaLigaElite);
imprimirTablaRanking("Clasificación General de Jugadores Activos", rankingTemporadaActual);

// Caso Límite: Futbolistas con minutos insuficientes o expulsiones múltiples
const convocatoriaCasoLimite: readonly FichaFutbolista[] = [
  {
    fichaId: "FUT-998",
    nombreCompleto: "Soren Lindholm",
    clubActual: "Fjord FC",
    demarcacion: "Delantero",
    golesAnotados: 3,
    asistenciasClave: 1,
    minutosDisputados: 180,
    tarjetasRojas: 0,
    estado: "Titular",
  },
  {
    fichaId: "FUT-999",
    nombreCompleto: "Mateo Salgado",
    clubActual: "Andes Sporting",
    demarcacion: "Mediocentro",
    golesAnotados: 5,
    asistenciasClave: 4,
    minutosDisputados: 900,
    tarjetasRojas: 3,
    estado: "Titular",
  }
];

const resultadoLimite = generarRankingFutbolistas(convocatoriaCasoLimite);
imprimirTablaRanking("Caso Límite (Filtro de Minutos y Sanciones)", resultadoLimite);