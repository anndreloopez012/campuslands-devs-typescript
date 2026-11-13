export {};

type ModalidadKickboxing = 'K1' | 'LowKick' | 'FullContact' | 'OrientalRules';
type EstadoTimer = 'EnRound' | 'Descanso' | 'Pausado' | 'CombateFinalizado';

type EventoTimerKickboxing =
  | { readonly tipo: 'INICIAR_ROUND'; readonly numeroRound: number }
  | { readonly tipo: 'PAUSAR_COMBATE' }
  | { readonly tipo: 'INICIAR_DESCANSO' }
  | { readonly tipo: 'FINALIZAR_COMBATE' };

interface RegistroGolpeEstadistica {
  readonly golpeId: string;
  readonly tipoGolpe: 'PatadaAlta' | 'PatadaBaja' | 'Directo' | 'Crochet' | 'Rodilla';
  readonly impactoExitoso: boolean;
  readonly puntosOtorgados: number;
}

interface CombateKickboxing {
  readonly combateId: string;
  readonly nombrePeleadorRojo: string;
  readonly nombrePeleadorAzul: string;
  readonly modalidad: ModalidadKickboxing;
  readonly roundsTotales: number;
  readonly duracionRoundSeg: number;
  readonly duracionDescansoSeg: number;
  readonly estadoActual: EstadoTimer;
  readonly registroGolpes: readonly RegistroGolpeEstadistica[];
}

interface ReporteTimerKickboxing {
  readonly combate: string;
  readonly modalidad: ModalidadKickboxing;
  readonly rounds: number;
  readonly totalGolpesConectados: number;
  readonly puntajeTotalRojo: number;
  readonly puntajeTotalAzul: number;
  readonly estatusArbitraje: 'Homologado' | 'DecisionDividida' | 'NoContest';
}

const registroCombatesKickboxing: readonly CombateKickboxing[] = [
  {
    combateId: "KBX-6501",
    nombrePeleadorRojo: "Zephyrin Kaelen",
    nombrePeleadorAzul: "Lysandra Vane",
    modalidad: "K1",
    roundsTotales: 3,
    duracionRoundSeg: 180,
    duracionDescansoSeg: 60,
    estadoActual: "CombateFinalizado",
    registroGolpes: [
      { golpeId: "G-01", tipoGolpe: "PatadaAlta", impactoExitoso: true, puntosOtorgados: 3 },
      { golpeId: "G-02", tipoGolpe: "Directo", impactoExitoso: true, puntosOtorgados: 1 },
      { golpeId: "G-03", tipoGolpe: "Crochet", impactoExitoso: true, puntosOtorgados: 2 },
      { golpeId: "G-04", tipoGolpe: "Rodilla", impactoExitoso: true, puntosOtorgados: 3 }
    ]
  },
  {
    combateId: "KBX-6502",
    nombrePeleadorRojo: "Thalassa Althaus",
    nombrePeleadorAzul: "Cassian Moreau",
    modalidad: "LowKick",
    roundsTotales: 5,
    duracionRoundSeg: 180,
    duracionDescansoSeg: 60,
    estadoActual: "CombateFinalizado",
    registroGolpes: [
      { golpeId: "G-05", tipoGolpe: "PatadaBaja", impactoExitoso: true, puntosOtorgados: 2 },
      { golpeId: "G-06", tipoGolpe: "Directo", impactoExitoso: true, puntosOtorgados: 1 },
      { golpeId: "G-07", tipoGolpe: "PatadaBaja", impactoExitoso: true, puntosOtorgados: 2 }
    ]
  },
  {
    combateId: "KBX-6503",
    nombrePeleadorRojo: "Orion Vestergaard",
    nombrePeleadorAzul: "Kylian Sotomayor",
    modalidad: "FullContact",
    roundsTotales: 3,
    duracionRoundSeg: 120,
    duracionDescansoSeg: 45,
    estadoActual: "EnRound",
    registroGolpes: [
      { golpeId: "G-08", tipoGolpe: "Directo", impactoExitoso: true, puntosOtorgados: 1 }
    ]
  }
];

class SimuladorTimerKickboxing<T extends CombateKickboxing> {
  private readonly combates: readonly T[];

  constructor(combates: readonly T[]) {
    this.combates = combates;
  }

  public async validarCombateAsync(combate: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!combate.combateId || combate.roundsTotales <= 0) {
          reject(new Error(`Combate de kickboxing inválido o sin rounds definidos: ${combate.combateId}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public aplicarReductorEstadoTimer(estadoActual: EstadoTimer, evento: EventoTimerKickboxing): EstadoTimer {
    switch (evento.tipo) {
      case 'INICIAR_ROUND':
        return 'EnRound';
      case 'PAUSAR_COMBATE':
        return 'Pausado';
      case 'INICIAR_DESCANSO':
        return 'Descanso';
      case 'FINALIZAR_COMBATE':
        return 'CombateFinalizado';
      default:
        return estadoActual;
    }
  }

  public calcularGolpesConectados(golpes: readonly RegistroGolpeEstadistica[]): number {
    return golpes.filter(g => g.impactoExitoso).length;
  }

  public calcularPuntajeTotal(golpes: readonly RegistroGolpeEstadistica[]): number {
    return golpes.filter(g => g.impactoExitoso).reduce((acc, g) => acc + g.puntosOtorgados, 0);
  }

  public async procesarReportesTimerAsync(): Promise<readonly ReporteTimerKickboxing[]> {
    const reportes: ReporteTimerKickboxing[] = [];

    for (const combate of this.combates) {
      try {
        await this.validarCombateAsync(combate);
        const totalGolpes = this.calcularGolpesConectados(combate.registroGolpes);
        const puntajeRojo = this.calcularPuntajeTotal(combate.registroGolpes);
        const puntajeAzul = Math.floor(puntajeRojo * 0.85); // Simulación de puntuación rival proporcional

        let estatus: 'Homologado' | 'DecisionDividida' | 'NoContest' = 'Homologado';
        if (combate.estadoActual === 'Pausado') {
          estatus = 'NoContest';
        } else if (Math.abs(puntajeRojo - puntajeAzul) <= 2) {
          estatus = 'DecisionDividida';
        }

        reportes.push({
          combate: `${combate.nombrePeleadorRojo} vs ${combate.nombrePeleadorAzul} [${combate.combateId}]`,
          modalidad: combate.modalidad,
          rounds: combate.roundsTotales,
          totalGolpesConectados: totalGolpes,
          puntajeTotalRojo: puntajeRojo,
          puntajeTotalAzul: puntajeAzul,
          estatusArbitraje: estatus,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Kickboxing Timer Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.totalGolpesConectados - a.totalGolpesConectados);
  }
}

function imprimirReporteTimer(titulo: string, reportes: readonly ReporteTimerKickboxing[]): void {
  console.log(`=== [TIMER DE ROUNDS KICKBOXING - KICKBOXING] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Combate: ${item.combate} | Modalidad: ${item.modalidad} | Rounds: ${item.rounds} | Golpes OK: ${item.totalGolpesConectados} | Pts Rojo: ${item.puntajeTotalRojo} | Pts Azul: ${item.puntajeTotalAzul} | Estatus: ${item.estatusArbitraje}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoTimerKickboxing(): Promise<void> {
  const simuladorOficial = new SimuladorTimerKickboxing(registroCombatesKickboxing);
  const reporteOficial = await simuladorOficial.procesarReportesTimerAsync();
  imprimirReporteTimer("Control Oficial de Tiempos y Estadísticas en Kickboxing", reporteOficial);

  // caso: Combate pausado administrativamente con estado no contest y golpes nulos
  const combateCasoLimite: readonly CombateKickboxing[] = [
    {
      combateId: "KBX-9999",
      nombrePeleadorRojo: "Orion Lancer",
      nombrePeleadorAzul: "Vortex Striker",
      modalidad: "OrientalRules",
      roundsTotales: 3,
      duracionRoundSeg: 180,
      duracionDescansoSeg: 60,
      estadoActual: "Pausado",
      registroGolpes: []
    }
  ];

  const simuladorLimite = new SimuladorTimerKickboxing(combateCasoLimite);
  const reporteLimite = await simuladorLimite.procesarReportesTimerAsync();
  imprimirReporteTimer("caso: Combate pausado administrativamente con estado no contest y golpes nulos", reporteLimite);
}

ejecutarFlujoTimerKickboxing();