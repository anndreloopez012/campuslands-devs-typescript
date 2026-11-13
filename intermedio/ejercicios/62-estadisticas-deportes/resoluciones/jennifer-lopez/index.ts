export {};

type CategoriaDeporte = 'Futbol' | 'Baloncesto' | 'Tenis' | 'Ciclismo';
type EstadoEncuentro = 'Finalizado' | 'EnVivo' | 'Suspendido' | 'Programado';

type MetricasEspecificasDeporte =
  | { readonly deporte: 'Futbol'; readonly golesLocal: number; readonly golesVisitante: number; readonly tarjetasAmarillas: number; readonly posesionBalonLocalPct: number }
  | { readonly deporte: 'Baloncesto'; readonly puntosLocal: number; readonly puntosVisitante: number; readonly triplesAnotados: number; readonly rebotesTotales: number }
  | { readonly deporte: 'Tenis'; readonly setsGanadosLocal: number; readonly setsGanadosVisitante: number; readonly acesTotales: number; readonly erroresNoForzados: number }
  | { readonly deporte: 'Ciclismo'; readonly tiempoTotalMinutos: number; readonly velocidadMediaKmh: number; readonly puertosMontanaConquistados: number; readonly cadenciaPromedioRpm: number };

interface EncuentroDeportivo {
  readonly encuentroId: string;
  readonly nombreTorneo: string;
  readonly atletaOEquipoLocal: string;
  readonly atletaOEquipoVisitante: string;
  readonly estado: EstadoEncuentro;
  readonly metricas: MetricasEspecificasDeporte;
}

type EventoDashboard =
  | { readonly tipo: 'ACTUALIZAR_ESTADO'; readonly nuevoEstado: EstadoEncuentro }
  | { readonly tipo: 'REGISTRAR_INCIDENCIA'; readonly descripcion: string };

interface ReporteDashboardDeporte {
  readonly encuentro: string;
  readonly deporte: CategoriaDeporte;
  readonly torneo: string;
  readonly indicadorPrincipalRendimiento: number;
  readonly indiceIntensidad: 'Alto' | 'Moderado' | 'Bajo';
}

const registroEncuentrosDeportivos: readonly EncuentroDeportivo[] = [
  {
    encuentroId: "DEP-6201",
    nombreTorneo: "Champions League Elite",
    atletaOEquipoLocal: "Galactic United",
    atletaOEquipoVisitante: "Royal Athletic",
    estado: "Finalizado",
    metricas: {
      deporte: "Futbol",
      golesLocal: 3,
      golesVisitante: 2,
      tarjetasAmarillas: 4,
      posesionBalonLocalPct: 58.5
    }
  },
  {
    encuentroId: "DEP-6202",
    nombreTorneo: "NBA Finals Playoffs",
    atletaOEquipoLocal: "Metropolitan Titans",
    atletaOEquipoVisitante: "Celestial Warriors",
    estado: "Finalizado",
    metricas: {
      deporte: "Baloncesto",
      puntosLocal: 118,
      puntosVisitante: 112,
      triplesAnotados: 16,
      rebotesTotales: 48
    }
  },
  {
    encuentroId: "DEP-6203",
    nombreTorneo: "Grand Slam Roland Garros",
    atletaOEquipoLocal: "Zephyrin Kaelen",
    atletaOEquipoVisitante: "Cassian Vane",
    estado: "Finalizado",
    metricas: {
      deporte: "Tenis",
      setsGanadosLocal: 3,
      setsGanadosVisitante: 1,
      acesTotales: 18,
      erroresNoForzados: 22
    }
  },
  {
    encuentroId: "DEP-6204",
    nombreTorneo: "Tour de France Etapa Montana",
    atletaOEquipoLocal: "Thalassa Althaus",
    atletaOEquipoVisitante: "Peloton Global",
    estado: "Finalizado",
    metricas: {
      deporte: "Ciclismo",
      tiempoTotalMinutos: 315,
      velocidadMediaKmh: 42.4,
      puertosMontanaConquistados: 5,
      cadenciaPromedioRpm: 94
    }
  }
];

class GestorDashboardMultiDeporte<T extends EncuentroDeportivo> {
  private readonly encuentros: readonly T[];

  constructor(encuentros: readonly T[]) {
    this.encuentros = encuentros;
  }

  public async validarEncuentroAsync(encuentro: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!encuentro.encuentroId || !encuentro.atletaOEquipoLocal) {
          reject(new Error(`Encuentro deportivo inválido o sin identificador: ${encuentro.nombreTorneo}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public aplicarEventoDashboard(estadoActual: EstadoEncuentro, evento: EventoDashboard): EstadoEncuentro {
    switch (evento.tipo) {
      case 'ACTUALIZAR_ESTADO':
        return evento.nuevoEstado;
      case 'REGISTRAR_INCIDENCIA':
        return estadoActual;
      default:
        return estadoActual;
    }
  }

  public extraerIndicadorRendimiento(metricas: MetricasEspecificasDeporte): number {
    switch (metricas.deporte) {
      case 'Futbol':
        return metricas.golesLocal + metricas.golesVisitante;
      case 'Baloncesto':
        return metricas.puntosLocal + metricas.puntosVisitante;
      case 'Tenis':
        return metricas.acesTotales;
      case 'Ciclismo':
        return Number(metricas.velocidadMediaKmh.toFixed(1));
    }
  }

  public async procesarReportesDashboardAsync(): Promise<readonly ReporteDashboardDeporte[]> {
    const reportes: ReporteDashboardDeporte[] = [];

    for (const enc of this.encuentros) {
      try {
        await this.validarEncuentroAsync(enc);
        const indicador = this.extraerIndicadorRendimiento(enc.metricas);

        let intensidad: 'Alto' | 'Moderado' | 'Bajo' = 'Moderado';
        if (enc.metricas.deporte === 'Futbol' && indicador >= 4) {
          intensidad = 'Alto';
        } else if (enc.metricas.deporte === 'Baloncesto' && indicador >= 220) {
          intensidad = 'Alto';
        } else if (enc.metricas.deporte === 'Tenis' && indicador >= 15) {
          intensidad = 'Alto';
        } else if (enc.metricas.deporte === 'Ciclismo' && indicador >= 40) {
          intensidad = 'Alto';
        } else if (indicador < 2) {
          intensidad = 'Bajo';
        }

        reportes.push({
          encuentro: `${enc.atletaOEquipoLocal} vs ${enc.atletaOEquipoVisitante} [${enc.encuentroId}]`,
          deporte: enc.metricas.deporte,
          torneo: enc.nombreTorneo,
          indicadorPrincipalRendimiento: indicador,
          indiceIntensidad: intensidad,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Dashboard Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.indicadorPrincipalRendimiento - a.indicadorPrincipalRendimiento);
  }
}

function imprimirReporteDashboard(titulo: string, reportes: readonly ReporteDashboardDeporte[]): void {
  console.log(`=== [DASHBOARD MULTI-DEPORTE - DEPORTES] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Encuentro: ${item.encuentro} | Deporte: ${item.deporte} | Torneo: ${item.torneo} | Indicador Principal: ${item.indicadorPrincipalRendimiento} | Intensidad: ${item.indiceIntensidad}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoDashboardDeportes(): Promise<void> {
  const dashboardOficial = new GestorDashboardMultiDeporte(registroEncuentrosDeportivos);
  const reporteOficial = await dashboardOficial.procesarReportesDashboardAsync();
  imprimirReporteDashboard("Reporte Oficial Multi-Deporte y Métricas de Rendimiento", reporteOficial);

  // caso: Encuentro deportivo suspendido con datos nulos de rendimiento y baja intensidad
  const encuentroCasoLimite: readonly EncuentroDeportivo[] = [
    {
      encuentroId: "DEP-9999",
      nombreTorneo: "Torneo Relampago Suspendido",
      atletaOEquipoLocal: "Orion FC",
      atletaOEquipoVisitante: "Vortex United",
      estado: "Suspendido",
      metricas: {
        deporte: "Futbol",
        golesLocal: 0,
        golesVisitante: 0,
        tarjetasAmarillas: 0,
        posesionBalonLocalPct: 50.0
      }
    }
  ];

  const dashboardLimite = new GestorDashboardMultiDeporte(encuentroCasoLimite);
  const reporteLimite = await dashboardLimite.procesarReportesDashboardAsync();
  imprimirReporteDashboard("caso: Encuentro deportivo suspendido con datos nulos de rendimiento y baja intensidad", reporteLimite);
}

ejecutarFlujoDashboardDeportes();