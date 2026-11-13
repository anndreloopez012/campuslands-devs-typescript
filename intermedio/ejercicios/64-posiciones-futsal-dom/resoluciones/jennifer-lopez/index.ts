export {};

type PosicionFutsal = 'Pivot' | 'Ala' | 'Cierre' | 'Portero';
type EstadoEquipoFutsal = 'ClasificadoPlayoffs' | 'ZonaMedia' | 'ZonaDescenso' | 'Sancionado';

type EventoPartidoFutsal =
  | { readonly tipo: 'REGISTRAR_VICTORIA'; readonly golesAfavor: number; readonly golesEnContra: number }
  | { readonly tipo: 'REGISTRAR_EMPATE'; readonly golesAfavor: number; readonly golesEnContra: number }
  | { readonly tipo: 'REGISTRAR_DERROTA'; readonly golesAfavor: number; readonly golesEnContra: number };

interface EstadisticaEquipoFutsal {
  readonly equipoId: string;
  readonly nombreEquipo: string;
  readonly tecnico: string;
  readonly partidosJugados: number;
  readonly partidosGanados: number;
  readonly partidosEmpatados: number;
  readonly partidosPerdidos: number;
  readonly golesFavor: number;
  readonly golesContra: number;
  readonly puntos: number;
  readonly estadoTabla: EstadoEquipoFutsal;
}

interface ReporteTablaFutsal {
  readonly posicionTabla: number;
  readonly equipo: string;
  readonly pj: number;
  readonly g: number;
  readonly e: number;
  readonly p: number;
  readonly dg: number;
  readonly pts: number;
  readonly estatusClasificacion: EstadoEquipoFutsal;
}

const registroEquiposFutsal: readonly EstadisticaEquipoFutsal[] = [
  {
    equipoId: "FUT-6401",
    nombreEquipo: "Inter Futsal Club",
    tecnico: "Zephyrin Kaelen",
    partidosJugados: 10,
    partidosGanados: 8,
    partidosEmpatados: 1,
    partidosPerdidos: 1,
    golesFavor: 42,
    golesContra: 18,
    puntos: 25,
    estadoTabla: "ClasificadoPlayoffs"
  },
  {
    equipoId: "FUT-6402",
    nombreEquipo: "Barcelona Futsal Elite",
    tecnico: "Lysandra Vane",
    partidosJugados: 10,
    partidosGanados: 7,
    partidosEmpatados: 2,
    partidosPerdidos: 1,
    golesFavor: 38,
    golesContra: 20,
    puntos: 23,
    estadoTabla: "ClasificadoPlayoffs"
  },
  {
    equipoId: "FUT-6403",
    nombreEquipo: "Palma Futsal Star",
    tecnico: "Thalassa Althaus",
    partidosJugados: 10,
    partidosGanados: 4,
    partidosEmpatados: 3,
    partidosPerdidos: 3,
    golesFavor: 25,
    golesContra: 25,
    puntos: 15,
    estadoTabla: "ZonaMedia"
  },
  {
    equipoId: "FUT-6404",
    nombreEquipo: "Cartagena Futsal B",
    tecnico: "Cassian Moreau",
    partidosJugados: 10,
    partidosGanados: 1,
    partidosEmpatados: 1,
    partidosPerdidos: 8,
    golesFavor: 15,
    golesContra: 45,
    puntos: 4,
    estadoTabla: "ZonaDescenso"
  }
];

class SimuladorTablaFutsal<T extends EstadisticaEquipoFutsal> {
  private readonly equipos: readonly T[];

  constructor(equipos: readonly T[]) {
    this.equipos = equipos;
  }

  public async validarEquipoAsync(equipo: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!equipo.equipoId || equipo.partidosJugados < 0) {
          reject(new Error(`Equipo de futsal inválido o con partidos negativos: ${equipo.nombreEquipo}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public aplicarReductorEvento(equipo: T, evento: EventoPartidoFutsal): EstadisticaEquipoFutsal {
    let g = equipo.partidosGanados;
    let e = equipo.partidosEmpatados;
    let p = equipo.partidosPerdidos;
    let pts = equipo.puntos;
    let gf = equipo.golesFavor + evento.golesAfavor;
    let gc = equipo.golesContra + evento.golesEnContra;

    switch (evento.tipo) {
      case 'REGISTRAR_VICTORIA':
        g += 1;
        pts += 3;
        break;
      case 'REGISTRAR_EMPATE':
        e += 1;
        pts += 1;
        break;
      case 'REGISTRAR_DERROTA':
        p += 1;
        break;
    }

    const pj = equipo.partidosJugados + 1;
    let nuevoEstado: EstadoEquipoFutsal = equipo.estadoTabla;
    if (pts >= 20) {
      nuevoEstado = 'ClasificadoPlayoffs';
    } else if (pts <= 5) {
      nuevoEstado = 'ZonaDescenso';
    } else {
      nuevoEstado = 'ZonaMedia';
    }

    return {
      ...equipo,
      partidosJugados: pj,
      partidosGanados: g,
      partidosEmpatados: e,
      partidosPerdidos: p,
      golesFavor: gf,
      golesContra: gc,
      puntos: pts,
      estadoTabla: nuevoEstado,
    };
  }

  public async procesarTablaPosicionesAsync(): Promise<readonly ReporteTablaFutsal[]> {
    const reportes: ReporteTablaFutsal[] = [];

    for (const eq of this.equipos) {
      try {
        await this.validarEquipoAsync(eq);
        const dg = eq.golesFavor - eq.golesContra;

        reportes.push({
          posicionTabla: 0,
          equipo: `${eq.nombreEquipo} [${eq.equipoId}]`,
          pj: eq.partidosJugados,
          g: eq.partidosGanados,
          e: eq.partidosEmpatados,
          p: eq.partidosPerdidos,
          dg: dg,
          pts: eq.puntos,
          estatusClasificacion: eq.estadoTabla,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Futsal Error]: ${error.message}`);
        }
      }
    }

    const ordenados = reportes.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.g - a.g;
    });

    return ordenados.map((item, index) => ({
      ...item,
      posicionTabla: index + 1,
    }));
  }
}

function imprimirReporteFutsal(titulo: string, reportes: readonly ReporteTablaFutsal[]): void {
  console.log(`=== [TABLA FUTSAL INTERACTIVA - FUTBOL SALA] ${titulo} ===`);
  reportes.forEach((item) => {
    console.log(
      `${item.posicionTabla}. Equipo: ${item.equipo} | PJ: ${item.pj} | G: ${item.g} | E: ${item.e} | P: ${item.p} | DG: ${item.dg} | PTS: ${item.pts} | Estatus: ${item.estatusClasificacion}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoTablaFutsal(): Promise<void> {
  const simuladorOficial = new SimuladorTablaFutsal(registroEquiposFutsal);
  const reporteOficial = await simuladorOficial.procesarTablaPosicionesAsync();
  imprimirReporteFutsal("Tabla Oficial de Posiciones de Futsal", reporteOficial);

  // caso: Equipo sancionado con penalizacion administrativa y cero puntos en la tabla
  const equipoCasoLimite: readonly EstadisticaEquipoFutsal[] = [
    {
      equipoId: "FUT-9999",
      nombreEquipo: "Sancionado Futsal Club",
      tecnico: "Orion Vestergaard",
      partidosJugados: 5,
      partidosGanados: 0,
      partidosEmpatados: 0,
      partidosPerdidos: 5,
      golesFavor: 2,
      golesContra: 25,
      puntos: 0,
      estadoTabla: "Sancionado"
    }
  ];

  const simuladorLimite = new SimuladorTablaFutsal(equipoCasoLimite);
  const reporteLimite = await simuladorLimite.procesarTablaPosicionesAsync();
  imprimirReporteFutsal("caso: Equipo sancionado con penalizacion administrativa y cero puntos en la tabla", reporteLimite);
}

ejecutarFlujoTablaFutsal();