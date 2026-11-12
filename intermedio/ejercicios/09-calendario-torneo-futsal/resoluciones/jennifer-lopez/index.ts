export {};

type CategoriaFutsal = 'Masculino A' | 'Femenino A' | 'Juvenil Sub-20' | 'Senior Master';
type EstadoPartido = 'Programado' | 'EnJuego' | 'Finalizado' | 'Suspendido';

interface FichaEncuentroFutsal {
  readonly partidoId: string;
  readonly jornada: number;
  readonly equipoLocal: string;
  readonly equipoVisitante: string;
  readonly categoria: CategoriaFutsal;
  readonly golesLocal: number;
  readonly golesVisitante: number;
  readonly faltasAcumuladasLocal: number;
  readonly faltasAcumuladasVisitante: number;
  estado: EstadoPartido;
}

interface ResumenCalendarioFutsal {
  readonly partido: string;
  readonly categoria: CategoriaFutsal;
  readonly marcadorFinal: string;
  readonly puntosDisputados: string;
  readonly clasificacionEspectaculo: string;
}

const calendarioJornadaFutsal: readonly FichaEncuentroFutsal[] = [
  {
    partidoId: "FUT-501",
    jornada: 1,
    equipoLocal: "Dynamo Futsal Club",
    equipoVisitante: "Vanguardia FS",
    categoria: "Masculino A",
    golesLocal: 5,
    golesVisitante: 4,
    faltasAcumuladasLocal: 3,
    faltasAcumuladasVisitante: 5,
    estado: "Finalizado",
  },
  {
    partidoId: "FUT-502",
    jornada: 1,
    equipoLocal: "Titanes de Altiplano",
    equipoVisitante: "Kurogane Futsal",
    categoria: "Femenino A",
    golesLocal: 3,
    golesVisitante: 3,
    faltasAcumuladasLocal: 4,
    faltasAcumuladasVisitante: 4,
    estado: "Finalizado",
  },
  {
    partidoId: "FUT-503",
    jornada: 1,
    equipoLocal: "Solaris FS",
    equipoVisitante: "Aether Futsal Academy",
    categoria: "Juvenil Sub-20",
    golesLocal: 7,
    golesVisitante: 2,
    faltasAcumuladasLocal: 2,
    faltasAcumuladasVisitante: 6,
    estado: "Finalizado",
  },
  {
    partidoId: "FUT-504",
    jornada: 1,
    equipoLocal: "Vortex Futsal",
    equipoVisitante: "Zenith FS",
    categoria: "Masculino A",
    golesLocal: 1,
    golesVisitante: 6,
    faltasAcumuladasLocal: 6,
    faltasAcumuladasVisitante: 2,
    estado: "Finalizado",
  },
  {
    partidoId: "FUT-505",
    jornada: 1,
    equipoLocal: "Nordic Futsal Elite",
    equipoVisitante: "Iberia FS",
    categoria: "Senior Master",
    golesLocal: 2,
    golesVisitante: 2,
    faltasAcumuladasLocal: 3,
    faltasAcumuladasVisitante: 3,
    estado: "Suspendido",
  }
];

function validarEncuentroFutsal(partido: FichaEncuentroFutsal): boolean {
  return partido.estado === "Finalizado" && (partido.golesLocal >= 0 && partido.golesVisitante >= 0);
}

function calcularIntensidadEspectaculo(partido: FichaEncuentroFutsal): number {
  const totalGoles = partido.golesLocal + partido.golesVisitante;
  const totalFaltas = partido.faltasAcumuladasLocal + partido.faltasAcumuladasVisitante;
  return totalGoles * 15 + totalFaltas * 5;
}

function clasificarNivelEmocion(intensidad: number): string {
  if (intensidad >= 120) return "Partido Épico de Alta Intensidad";
  if (intensidad >= 80) return "Encuentro Muy Disputado";
  if (intensidad >= 40) return "Juego Regular Equilibrado";
  return "Partido Táctico Cerrado";
}

function procesarCalendarioFutsal(encuentros: readonly FichaEncuentroFutsal[]): readonly ResumenCalendarioFutsal[] {
  return encuentros
    .filter(validarEncuentroFutsal)
    .map(partido => {
      const intensidad = calcularIntensidadEspectaculo(partido);
      const ganador =
        partido.golesLocal > partido.golesVisitante
          ? `Victoria Local (${partido.equipoLocal})`
          : partido.golesLocal < partido.golesVisitante
          ? `Victoria Visitante (${partido.equipoVisitante})`
          : "Empate Técnico";

      return {
        partido: `${partido.equipoLocal} vs ${partido.equipoVisitante} [${partido.partidoId}]`,
        categoria: partido.categoria,
        marcadorFinal: `${partido.golesLocal} - ${partido.golesVisitante}`,
        puntosDisputados: ganador,
        clasificacionEspectaculo: clasificarNivelEmocion(intensidad),
      };
    })
    .sort((a, b) => b.marcadorFinal.localeCompare(a.marcadorFinal));
}

function imprimirReporteCalendario(titulo: string, resumen: readonly ResumenCalendarioFutsal[]): void {
  console.log(`=== [CALENDARIO DE TORNEO FUTSAL] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Encuentro: ${item.partido} (${item.categoria}) | Marcador: ${item.marcadorFinal} | Resultado: ${item.puntosDisputados} | Dinámica: ${item.clasificacionEspectaculo}`
    );
  });
  console.log("====================================================================\n");
}

const resultadoCalendarioOficial = procesarCalendarioFutsal(calendarioJornadaFutsal);
imprimirReporteCalendario("Resumen de Partidos Oficiales Finalizados", resultadoCalendarioOficial);

// Caso: Encuentro con marcador histórico de goles y acumulación masiva de faltas reglamentarias
const torneoCasoLimite: readonly FichaEncuentroFutsal[] = [
  {
    partidoId: "FUT-999",
    jornada: 1,
    equipoLocal: "Titanium Futsal",
    equipoVisitante: "Hyperion Fs",
    categoria: "Masculino A",
    golesLocal: 9,
    golesVisitante: 8,
    faltasAcumuladasLocal: 7,
    faltasAcumuladasVisitante: 8,
    estado: "Finalizado",
  }
];

const resultadoLimite = procesarCalendarioFutsal(torneoCasoLimite);
imprimirReporteCalendario("Goleada Histórica y Alta Tensión", resultadoLimite);