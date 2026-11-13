export {};

type ModalidadPingPong = 'Singles' | 'Dobles';
type EstadoPartidoPingPong = 'EnJuego' | 'SetTerminado' | 'MatchPoint' | 'Finalizado';

type EventoPartidoPingPong =
  | { readonly tipo: 'ANOTAR_PUNTO'; readonly jugadorId: string; readonly esSaqueMio: boolean }
  | { readonly tipo: 'CAMBIAR_SAQUE' }
  | { readonly tipo: 'SOLICITAR_TIEMPO_FUERA'; readonly jugadorId: string };

interface RegistroSet {
  readonly setNumero: number;
  readonly puntosJugador1: number;
  readonly puntosJugador2: number;
}

interface PartidoPingPong {
  readonly partidoId: string;
  readonly nombreJugador1: string;
  readonly nombreJugador2: string;
  readonly modalidad: ModalidadPingPong;
  readonly setsGanadosJugador1: number;
  readonly setsGanadosJugador2: number;
  readonly estadoActual: EstadoPartidoPingPong;
  readonly historialSets: readonly RegistroSet[];
}

interface ReporteMarcadorPingPong {
  readonly partido: string;
  readonly modalidad: ModalidadPingPong;
  readonly resultadoSets: string;
  readonly totalPuntosDisputados: number;
  readonly estatusDefinitivo: 'Homologado' | 'RemontadaEpica' | 'Suspendido';
}

const registroPartidasPingPong: readonly PartidoPingPong[] = [
  {
    partidoId: "PPG-6701",
    nombreJugador1: "Zephyrin Kaelen",
    nombreJugador2: "Lysandra Vane",
    modalidad: "Singles",
    setsGanadosJugador1: 3,
    setsGanadosJugador2: 1,
    estadoActual: "Finalizado",
    historialSets: [
      { setNumero: 1, puntosJugador1: 11, puntosJugador2: 9 },
      { setNumero: 2, puntosJugador1: 8, puntosJugador2: 11 },
      { setNumero: 3, puntosJugador1: 12, puntosJugador2: 10 },
      { setNumero: 4, puntosJugador1: 11, puntosJugador2: 6 }
    ]
  },
  {
    partidoId: "PPG-6702",
    nombreJugador1: "Thalassa Althaus",
    nombreJugador2: "Cassian Moreau",
    modalidad: "Singles",
    setsGanadosJugador1: 3,
    setsGanadosJugador2: 2,
    estadoActual: "Finalizado",
    historialSets: [
      { setNumero: 1, puntosJugador1: 11, puntosJugador2: 7 },
      { setNumero: 2, puntosJugador1: 9, puntosJugador2: 11 },
      { setNumero: 3, puntosJugador1: 6, puntosJugador2: 11 },
      { setNumero: 4, puntosJugador1: 11, puntosJugador2: 8 },
      { setNumero: 5, puntosJugador1: 11, puntosJugador2: 9 }
    ]
  },
  {
    partidoId: "PPG-6703",
    nombreJugador1: "Orion Vestergaard",
    nombreJugador2: "Kylian Sotomayor",
    modalidad: "Dobles",
    setsGanadosJugador1: 0,
    setsGanadosJugador2: 3,
    estadoActual: "Finalizado",
    historialSets: [
      { setNumero: 1, puntosJugador1: 5, puntosJugador2: 11 },
      { setNumero: 2, puntosJugador1: 7, puntosJugador2: 11 },
      { setNumero: 3, puntosJugador1: 8, puntosJugador2: 11 }
    ]
  }
];

class SimuladorMarcadorPingPong<T extends PartidoPingPong> {
  private readonly partidos: readonly T[];

  constructor(partidos: readonly T[]) {
    this.partidos = partidos;
  }

  public async validarPartidoAsync(partido: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!partido.partidoId || !partido.nombreJugador1 || !partido.nombreJugador2) {
          reject(new Error(`Partido de pingpong inválido o sin participantes: ${partido.partidoId}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public aplicarReductorEstadoPingPong(estadoActual: EstadoPartidoPingPong, evento: EventoPartidoPingPong): EstadoPartidoPingPong {
    switch (evento.tipo) {
      case 'ANOTAR_PUNTO':
        return 'EnJuego';
      case 'CAMBIAR_SAQUE':
        return estadoActual;
      case 'SOLICITAR_TIEMPO_FUERA':
        return 'EnJuego';
      default:
        return estadoActual;
    }
  }

  public calcularTotalPuntosDisputados(sets: readonly RegistroSet[]): number {
    return sets.reduce((acc, set) => acc + set.puntosJugador1 + set.puntosJugador2, 0);
  }

  public async procesarReportesMarcadorAsync(): Promise<readonly ReporteMarcadorPingPong[]> {
    const reportes: ReporteMarcadorPingPong[] = [];

    for (const partido of this.partidos) {
      try {
        await this.validarPartidoAsync(partido);
        const totalPuntos = this.calcularTotalPuntosDisputados(partido.historialSets);
        const totalSets = partido.setsGanadosJugador1 + partido.setsGanadosJugador2;

        let estatus: 'Homologado' | 'RemontadaEpica' | 'Suspendido' = 'Homologado';
        if (partido.estadoActual === 'EnJuego') {
          estatus = 'Suspendido';
        } else if (totalSets === 5 && Math.abs(partido.setsGanadosJugador1 - partido.setsGanadosJugador2) === 1) {
          estatus = 'RemontadaEpica';
        }

        reportes.push({
          partido: `${partido.nombreJugador1} vs ${partido.nombreJugador2} [${partido.partidoId}]`,
          modalidad: partido.modalidad,
          resultadoSets: `${partido.setsGanadosJugador1} - ${partido.setsGanadosJugador2}`,
          totalPuntosDisputados: totalPuntos,
          estatusDefinitivo: estatus,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[PingPong Marcador Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.totalPuntosDisputados - a.totalPuntosDisputados);
  }
}

function imprimirReportePingPong(titulo: string, reportes: readonly ReporteMarcadorPingPong[]): void {
  console.log(`=== [MARCADOR PINGPONG DOM - PINGPONG] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Partido: ${item.partido} | Modalidad: ${item.modalidad} | Sets: ${item.resultadoSets} | Puntos Disputados: ${item.totalPuntosDisputados} | Estatus: ${item.estatusDefinitivo}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoMarcadorPingPong(): Promise<void> {
  const simuladorOficial = new SimuladorMarcadorPingPong(registroPartidasPingPong);
  const reporteOficial = await simuladorOficial.procesarReportesMarcadorAsync();
  imprimirReportePingPong("Reporte Oficial de Marcadores y Sets en Tenis de Mesa", reporteOficial);

  // caso: Partido suspendido en pleno desarrollo con sets incompletos
  const partidoCasoLimite: readonly PartidoPingPong[] = [
    {
      partidoId: "PPG-9999",
      nombreJugador1: "Orion Lancer",
      nombreJugador2: "Vortex Challenger",
      modalidad: "Singles",
      setsGanadosJugador1: 1,
      setsGanadosJugador2: 1,
      estadoActual: "EnJuego",
      historialSets: [
        { setNumero: 1, puntosJugador1: 11, puntosJugador2: 6 },
        { setNumero: 2, puntosJugador1: 8, puntosJugador2: 11 }
      ]
    }
  ];

  const simuladorLimite = new SimuladorMarcadorPingPong(partidoCasoLimite);
  const reporteLimite = await simuladorLimite.procesarReportesMarcadorAsync();
  imprimirReportePingPong("caso: Partido suspendido en pleno desarrollo con sets incompletos", reporteLimite);
}

ejecutarFlujoMarcadorPingPong();