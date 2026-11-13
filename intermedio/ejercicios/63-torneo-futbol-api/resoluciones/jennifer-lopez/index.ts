export {};

type FaseTorneo = 'FaseDeGrupos' | 'OctavosDeFinal' | 'CuartosDeFinal' | 'Semifinal' | 'Final';
type EstadoPartido = 'Programado' | 'EnCurso' | 'Finalizado' | 'SuspendidoPorClima';

type EventoPartidoAsincrono =
  | { readonly tipo: 'REGISTRAR_GOL'; readonly minuto: number; readonly equipoAutor: 'Local' | 'Visitante'; readonly anotador: string }
  | { readonly tipo: 'REGISTRAR_TARJETA'; readonly minuto: number; readonly equipoAfectado: 'Local' | 'Visitante'; readonly tipoTarjeta: 'Amarilla' | 'Roja' }
  | { readonly tipo: 'CAMBIAR_ESTADO'; readonly nuevoEstado: EstadoPartido };

interface DetallePartidoTorneo {
  readonly partidoId: string;
  readonly fase: FaseTorneo;
  readonly equipoLocal: string;
  readonly equipoVisitante: string;
  readonly golesLocal: number;
  readonly golesVisitante: number;
  readonly estado: EstadoPartido;
  readonly historialEventos: readonly EventoPartidoAsincrono[];
}

interface ReporteTorneoFutbol {
  readonly partido: string;
  readonly fase: FaseTorneo;
  readonly marcadorFinal: string;
  readonly totalGoles: number;
  readonly totalTarjetas: number;
  readonly estatusRegulatorio: 'Homologado' | 'RevisionDisciplinaria' | 'Anulado';
}

const registroPartidosTorneo: readonly DetallePartidoTorneo[] = [
  {
    partidoId: "TRN-6301",
    fase: "CuartosDeFinal",
    equipoLocal: "Galactic United FC",
    equipoVisitante: "Royal Athletic SC",
    golesLocal: 3,
    golesVisitante: 1,
    estado: "Finalizado",
    historialEventos: [
      { tipo: 'REGISTRAR_GOL', minuto: 15, equipoAutor: 'Local', anotador: 'Kylian Vane' },
      { tipo: 'REGISTRAR_GOL', minuto: 42, equipoAutor: 'Visitante', anotador: 'Jude Althaus' },
      { tipo: 'REGISTRAR_GOL', minuto: 78, equipoAutor: 'Local', anotador: 'Kylian Vane' },
      { tipo: 'REGISTRAR_GOL', minuto: 89, equipoAutor: 'Local', anotador: 'Thibaut Kurosaki' },
      { tipo: 'REGISTRAR_TARJETA', minuto: 65, equipoAfectado: 'Visitante', tipoTarjeta: 'Amarilla' }
    ]
  },
  {
    partidoId: "TRN-6302",
    fase: "Semifinal",
    equipoLocal: "Metropolitan Titans",
    equipoVisitante: "Celestial Warriors",
    golesLocal: 2,
    golesVisitante: 2,
    estado: "Finalizado",
    historialEventos: [
      { tipo: 'REGISTRAR_GOL', minuto: 22, equipoAutor: 'Visitante', anotador: 'Zephyrin Kaelen' },
      { tipo: 'REGISTRAR_GOL', minuto: 54, equipoAutor: 'Local', anotador: 'Cassian Moreau' },
      { tipo: 'REGISTRAR_TARJETA', minuto: 70, equipoAfectado: 'Local', tipoTarjeta: 'Roja' },
      { tipo: 'REGISTRAR_GOL', minuto: 81, equipoAutor: 'Local', anotador: 'Cassian Moreau' },
      { tipo: 'REGISTRAR_GOL', minuto: 93, equipoAutor: 'Visitante', anotador: 'Zephyrin Kaelen' }
    ]
  },
  {
    partidoId: "TRN-6303",
    fase: "FaseDeGrupos",
    equipoLocal: "Anatolian Lions",
    equipoVisitante: "Bavaria Athletic",
    golesLocal: 1,
    golesVisitante: 0,
    estado: "Finalizado",
    historialEventos: [
      { tipo: 'REGISTRAR_GOL', minuto: 33, equipoAutor: 'Local', anotador: 'Orion Vestergaard' }
    ]
  }
];

class GestorTorneoFutbolAsincrono<T extends DetallePartidoTorneo> {
  private readonly partidos: readonly T[];

  constructor(partidos: readonly T[]) {
    this.partidos = partidos;
  }

  public async validarPartidoAsync(partido: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!partido.partidoId || !partido.equipoLocal || !partido.equipoVisitante) {
          reject(new Error(`Partido de torneo inválido o incompleto: ${partido.partidoId}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public procesarReductorEstado(estadoActual: EstadoPartido, evento: EventoPartidoAsincrono): EstadoPartido {
    switch (evento.tipo) {
      case 'CAMBIAR_ESTADO':
        return evento.nuevoEstado;
      case 'REGISTRAR_GOL':
      case 'REGISTRAR_TARJETA':
        return estadoActual;
      default:
        return estadoActual;
    }
  }

  public contarGoles(eventos: readonly EventoPartidoAsincrono[]): number {
    return eventos.filter(e => e.tipo === 'REGISTRAR_GOL').length;
  }

  public contarTarjetas(eventos: readonly EventoPartidoAsincrono[]): number {
    return eventos.filter(e => e.tipo === 'REGISTRAR_TARJETA').length;
  }

  public async procesarReportesTorneoAsync(): Promise<readonly ReporteTorneoFutbol[]> {
    const reportes: ReporteTorneoFutbol[] = [];

    for (const partido of this.partidos) {
      try {
        await this.validarPartidoAsync(partido);
        const golesTotales = this.contarGoles(partido.historialEventos);
        const tarjetasTotales = this.contarTarjetas(partido.historialEventos);
        const rojasTotales = partido.historialEventos.filter(
          e => e.tipo === 'REGISTRAR_TARJETA' && e.tipoTarjeta === 'Roja'
        ).length;

        let estatusRegulatorio: 'Homologado' | 'RevisionDisciplinaria' | 'Anulado' = 'Homologado';
        if (partido.estado === 'SuspendidoPorClima') {
          estatusRegulatorio = 'Anulado';
        } else if (rojasTotales >= 2 || tarjetasTotales >= 5) {
          estatusRegulatorio = 'RevisionDisciplinaria';
        }

        reportes.push({
          partido: `${partido.equipoLocal} vs ${partido.equipoVisitante} [${partido.partidoId}]`,
          fase: partido.fase,
          marcadorFinal: `${partido.golesLocal} - ${partido.golesVisitante}`,
          totalGoles: golesTotales,
          totalTarjetas: tarjetasTotales,
          estatusRegulatorio: estatusRegulatorio,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Torneo Asíncrono Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.totalGoles - a.totalGoles);
  }
}

function imprimirReporteTorneo(titulo: string, reportes: readonly ReporteTorneoFutbol[]): void {
  console.log(`=== [TORNEO FUTBOL ASINCRONO - FUTBOL] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Partido: ${item.partido} | Fase: ${item.fase} | Marcador: ${item.marcadorFinal} | Goles: ${item.totalGoles} | Tarjetas: ${item.totalTarjetas} | Estatus: ${item.estatusRegulatorio}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoTorneoFutbol(): Promise<void> {
  const gestorOficial = new GestorTorneoFutbolAsincrono(registroPartidosTorneo);
  const reporteOficial = await gestorOficial.procesarReportesTorneoAsync();
  imprimirReporteTorneo("Reporte Oficial de Partidos y Resultados Asíncronos", reporteOficial);

  // caso: Partido suspendido por condiciones climaticas extremas y anulacion reglamentaria
  const partidoCasoLimite: readonly DetallePartidoTorneo[] = [
    {
      partidoId: "TRN-9999",
      fase: "Final",
      equipoLocal: "Storm FC",
      equipoVisitante: "Lightning SC",
      golesLocal: 0,
      golesVisitante: 0,
      estado: "SuspendidoPorClima",
      historialEventos: [
        { tipo: 'CAMBIAR_ESTADO', nuevoEstado: 'SuspendidoPorClima' }
      ]
    }
  ];

  const gestorLimite = new GestorTorneoFutbolAsincrono(partidoCasoLimite);
  const reporteLimite = await gestorLimite.procesarReportesTorneoAsync();
  imprimirReporteTorneo("caso: Partido suspendido por condiciones climaticas extremas y anulacion reglamentaria", reporteLimite);
}

ejecutarFlujoTorneoFutbol();