export {};

type ModalidadCarrera = 'Formula1' | 'Endurance' | 'MotoGP' | 'RallySprint';
type EstadoCronometro = 'EnEspera' | 'MidiendoVuelta' | 'VueltaRegistrada' | 'SesionFinalizada';

type EventoCronometroCarrera =
  | { readonly tipo: 'INICIAR_CRONOMETRO' }
  | { readonly tipo: 'REGISTRAR_LAP'; readonly tiempoMs: number }
  | { readonly tipo: 'PAUSAR_SESION' }
  | { readonly tipo: 'FINALIZAR_SESION' };

interface RegistroLapVuelta {
  readonly lapId: string;
  readonly numeroVuelta: number;
  readonly duracionMs: number;
  readonly esVueltaRapida: boolean;
}

interface SesionCronometroPiloto {
  readonly sesionId: string;
  readonly nombrePiloto: string;
  readonly escuderiaEquipo: string;
  readonly modalidad: ModalidadCarrera;
  readonly estadoActual: EstadoCronometro;
  readonly vueltasRegistradas: readonly RegistroLapVuelta[];
}

interface ReporteCronometroCarrera {
  readonly piloto: string;
  readonly modalidad: ModalidadCarrera;
  readonly totalVueltas: number;
  readonly mejorTiempoMs: number;
  readonly promedioVueltasMs: number;
  readonly calificacionRendimiento: 'Excepcional' | 'Competitivo' | 'Irregular';
}

const registroSesionesCarrera: readonly SesionCronometroPiloto[] = [
  {
    sesionId: "CRS-6601",
    nombrePiloto: "Zephyrin Kaelen",
    escuderiaEquipo: "Scuderia Apex Racing",
    modalidad: "Formula1",
    estadoActual: "SesionFinalizada",
    vueltasRegistradas: [
      { lapId: "L-01", numeroVuelta: 1, duracionMs: 81450, esVueltaRapida: false },
      { lapId: "L-02", numeroVuelta: 2, duracionMs: 79200, esVueltaRapida: true },
      { lapId: "L-03", numeroVuelta: 3, duracionMs: 80100, esVueltaRapida: false }
    ]
  },
  {
    sesionId: "CRS-6602",
    nombrePiloto: "Lysandra Vane",
    escuderiaEquipo: "Vortex Endurance Team",
    modalidad: "Endurance",
    estadoActual: "SesionFinalizada",
    vueltasRegistradas: [
      { lapId: "L-04", numeroVuelta: 1, duracionMs: 145200, esVueltaRapida: false },
      { lapId: "L-05", numeroVuelta: 2, duracionMs: 142800, esVueltaRapida: true },
      { lapId: "L-06", numeroVuelta: 3, duracionMs: 143500, esVueltaRapida: false }
    ]
  },
  {
    sesionId: "CRS-6603",
    nombrePiloto: "Thalassa Althaus",
    escuderiaEquipo: "Stellar MotoGP Factory",
    modalidad: "MotoGP",
    estadoActual: "SesionFinalizada",
    vueltasRegistradas: [
      { lapId: "L-07", numeroVuelta: 1, duracionMs: 98300, esVueltaRapida: false },
      { lapId: "L-08", numeroVuelta: 2, duracionMs: 96900, esVueltaRapida: true }
    ]
  },
  {
    sesionId: "CRS-6604",
    nombrePiloto: "Cassian Moreau",
    escuderiaEquipo: "RallySprint Global",
    modalidad: "RallySprint",
    estadoActual: "SesionFinalizada",
    vueltasRegistradas: [
      { lapId: "L-09", numeroVuelta: 1, duracionMs: 210000, esVueltaRapida: true }
    ]
  }
];

class SimuladorCronometroCarreras<T extends SesionCronometroPiloto> {
  private readonly sesiones: readonly T[];

  constructor(sesiones: readonly T[]) {
    this.sesiones = sesiones;
  }

  public async validarSesionAsync(sesion: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!sesion.sesionId || !sesion.nombrePiloto) {
          reject(new Error(`Sesión de cronómetro inválida o sin piloto: ${sesion.sesionId}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public aplicarReductorCronometro(estadoActual: EstadoCronometro, evento: EventoCronometroCarrera): EstadoCronometro {
    switch (evento.tipo) {
      case 'INICIAR_CRONOMETRO':
        return 'MidiendoVuelta';
      case 'REGISTRAR_LAP':
        return 'VueltaRegistrada';
      case 'PAUSAR_SESION':
        return 'EnEspera';
      case 'FINALIZAR_SESION':
        return 'SesionFinalizada';
      default:
        return estadoActual;
    }
  }

  public calcularMejorTiempo(vueltas: readonly RegistroLapVuelta[]): number {
    if (vueltas.length === 0) return 0;
    return Math.min(...vueltas.map(v => v.duracionMs));
  }

  public calcularPromedioVueltas(vueltas: readonly RegistroLapVuelta[]): number {
    if (vueltas.length === 0) return 0;
    const suma = vueltas.reduce((acc, v) => acc + v.duracionMs, 0);
    return Math.round(suma / vueltas.length);
  }

  public async procesarReportesCronometroAsync(): Promise<readonly ReporteCronometroCarrera[]> {
    const reportes: ReporteCronometroCarrera[] = [];

    for (const sesion of this.sesiones) {
      try {
        await this.validarSesionAsync(sesion);
        const mejorTiempo = sesion.vueltasRegistradas.length > 0 ? this.calcularMejorTiempo(sesion.vueltasRegistradas) : 0;
        const promedio = sesion.vueltasRegistradas.length > 0 ? this.calcularPromedioVueltas(sesion.vueltasRegistradas) : 0;

        let calificacion: 'Excepcional' | 'Competitivo' | 'Irregular' = 'Competitivo';
        if (sesion.vueltasRegistradas.length >= 3 && mejorTiempo < 90000) {
          calificacion = 'Excepcional';
        } else if (sesion.vueltasRegistradas.length === 0) {
          calificacion = 'Irregular';
        }

        reportes.push({
          piloto: `${sesion.nombrePiloto} (${sesion.escuderiaEquipo}) [${sesion.sesionId}]`,
          modalidad: sesion.modalidad,
          totalVueltas: sesion.vueltasRegistradas.length,
          mejorTiempoMs: mejorTiempo,
          promedioVueltasMs: promedio,
          calificacionRendimiento: calificacion,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Cronómetro Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => {
      if (a.mejorTiempoMs === 0) return 1;
      if (b.mejorTiempoMs === 0) return -1;
      return a.mejorTiempoMs - b.mejorTiempoMs;
    });
  }
}

function imprimirReporteCronometro(titulo: string, reportes: readonly ReporteCronometroCarrera[]): void {
  console.log(`=== [CRONOMETRO DE VUELTAS - CARRERAS] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Piloto: ${item.piloto} | Modalidad: ${item.modalidad} | Vueltas: ${item.totalVueltas} | Mejor Lap: ${item.mejorTiempoMs} ms | Promedio: ${item.promedioVueltasMs} ms | Calificación: ${item.calificacionRendimiento}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoCronometroCarreras(): Promise<void> {
  const cronometroOficial = new SimuladorCronometroCarreras(registroSesionesCarrera);
  const reporteOficial = await cronometroOficial.procesarReportesCronometroAsync();
  imprimirReporteCronometro("Control Oficial de Tiempos y Vueltas en Pista", reporteOficial);

  // caso: Sesion de cronometro con cero vueltas registradas y estado en espera por bandera roja
  const sesionCasoLimite: readonly SesionCronometroPiloto[] = [
    {
      sesionId: "CRS-9999",
      nombrePiloto: "Orion Lancer",
      escuderiaEquipo: "Red Flag Racing",
      modalidad: "Formula1",
      estadoActual: "EnEspera",
      vueltasRegistradas: []
    }
  ];

  const cronometroLimite = new SimuladorCronometroCarreras(sesionCasoLimite);
  const reporteLimite = await cronometroLimite.procesarReportesCronometroAsync();
  imprimirReporteCronometro("caso: Sesion de cronometro con cero vueltas registradas y estado en espera por bandera roja", reporteLimite);
}

ejecutarFlujoCronometroCarreras();