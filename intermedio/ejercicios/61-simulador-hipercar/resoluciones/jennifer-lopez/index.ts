export {};

type TipoTraccion = 'AWD_QuadMotor' | 'RWD_TwinTurbo' | 'AWD_HybridV8' | 'RWD_Electric';
type EstadoSimulacion = 'EnReposo' | 'AcelerandoMaximo' | 'FrenandoSeco' | 'VelocidadCrucero';

interface TelemetriaPunto {
  readonly tiempoSegundos: number;
  readonly velocidadKmh: number;
  readonly fuerzaGs: number;
}

interface TestAceleracion {
  readonly testId: string;
  readonly nombrePiloto: string;
  readonly modeloHipercar: string;
  readonly traccion: TipoTraccion;
  readonly potenciaHp: number;
  readonly pesoKg: number;
  readonly estadoActual: EstadoSimulacion;
  readonly registrosTelemetria: readonly TelemetriaPunto[];
}

type EventoSimulacion =
  | { readonly tipo: 'INICIAR_ACELERACION'; readonly duracionSeg: number }
  | { readonly tipo: 'APLICAR_FRENADA'; readonly fuerzaFrenadoGs: number }
  | { readonly tipo: 'ESTABILIZAR_CRUCERO'; readonly velocidadObjetivoKmh: number };

interface ReporteSimulacionHipercar {
  readonly hipercar: string;
  readonly piloto: string;
  readonly traccion: TipoTraccion;
  readonly velocidadMaximaKmh: number;
  readonly aceleracionPromedioGs: number;
  readonly eficienciaAerodinamica: 'Optima' | 'Desafiante' | 'Inestable';
}

const registroPruebasHipercar: readonly TestAceleracion[] = [
  {
    testId: "SIM-6101",
    nombrePiloto: "Zephyrin Kaelen",
    modeloHipercar: "Rimac Nevera R Track Edition",
    traccion: "AWD_QuadMotor",
    potenciaHp: 2107,
    pesoKg: 2150,
    estadoActual: "AcelerandoMaximo",
    registrosTelemetria: [
      { tiempoSegundos: 0, velocidadKmh: 0, fuerzaGs: 0.2 },
      { tiempoSegundos: 1.0, velocidadKmh: 100, fuerzaGs: 1.4 },
      { tiempoSegundos: 2.5, velocidadKmh: 200, fuerzaGs: 1.8 },
      { tiempoSegundos: 5.2, velocidadKmh: 300, fuerzaGs: 1.2 }
    ]
  },
  {
    testId: "SIM-6102",
    nombrePiloto: "Lysandra Vane",
    modeloHipercar: "Koenigsegg Jesko Attack",
    traccion: "RWD_TwinTurbo",
    potenciaHp: 1600,
    pesoKg: 1390,
    estadoActual: "AcelerandoMaximo",
    registrosTelemetria: [
      { tiempoSegundos: 0, velocidadKmh: 0, fuerzaGs: 0.1 },
      { tiempoSegundos: 1.2, velocidadKmh: 100, fuerzaGs: 1.2 },
      { tiempoSegundos: 3.0, velocidadKmh: 200, fuerzaGs: 1.6 },
      { tiempoSegundos: 6.0, velocidadKmh: 320, fuerzaGs: 1.3 }
    ]
  },
  {
    testId: "SIM-6103",
    nombrePiloto: "Thalassa Althaus",
    modeloHipercar: "Bugatti Tourbillon V8 Hybrid",
    traccion: "AWD_HybridV8",
    potenciaHp: 1775,
    pesoKg: 1995,
    estadoActual: "VelocidadCrucero",
    registrosTelemetria: [
      { tiempoSegundos: 0, velocidadKmh: 0, fuerzaGs: 0.2 },
      { tiempoSegundos: 1.1, velocidadKmh: 100, fuerzaGs: 1.3 },
      { tiempoSegundos: 2.8, velocidadKmh: 200, fuerzaGs: 1.7 }
    ]
  },
  {
    testId: "SIM-6104",
    nombrePiloto: "Cassian Moreau",
    modeloHipercar: "Lotus Evija Pure Electric",
    traccion: "RWD_Electric",
    potenciaHp: 2000,
    pesoKg: 1680,
    estadoActual: "FrenandoSeco",
    registrosTelemetria: [
      { tiempoSegundos: 0, velocidadKmh: 350, fuerzaGs: -2.1 },
      { tiempoSegundos: 2.0, velocidadKmh: 150, fuerzaGs: -1.8 }
    ]
  }
];

class SimuladorAceleracionHipercar<T extends TestAceleracion> {
  private readonly pruebas: readonly T[];

  constructor(pruebas: readonly T[]) {
    this.pruebas = pruebas;
  }

  public async validarTestAsync(test: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!test.testId || test.potenciaHp <= 0) {
          reject(new Error(`Prueba de hipercar inválida o sin potencia definida: ${test.modeloHipercar}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public aplicarEventoSimulacion(estadoActual: EstadoSimulacion, evento: EventoSimulacion): EstadoSimulacion {
    switch (evento.tipo) {
      case 'INICIAR_ACELERACION':
        return 'AcelerandoMaximo';
      case 'APLICAR_FRENADA':
        return 'FrenandoSeco';
      case 'ESTABILIZAR_CRUCERO':
        return 'VelocidadCrucero';
      default:
        return estadoActual;
    }
  }

  public calcularVelocidadMaxima(telemetria: readonly TelemetriaPunto[]): number {
    if (telemetria.length === 0) return 0;
    return Math.max(...telemetria.map(t => t.velocidadKmh));
  }

  public calcularAceleracionPromedioGs(telemetria: readonly TelemetriaPunto[]): number {
    const positivas = telemetria.filter(t => t.fuerzaGs > 0);
    if (positivas.length === 0) return 0;
    const suma = positivas.reduce((acc, t) => acc + t.fuerzaGs, 0);
    return Number((suma / positivas.length).toFixed(2));
  }

  public async procesarReportesSimulacionAsync(): Promise<readonly ReporteSimulacionHipercar[]> {
    const reportes: ReporteSimulacionHipercar[] = [];

    for (const test of this.pruebas) {
      try {
        await this.validarTestAsync(test);
        const vmax = this.calcularVelocidadMaxima(test.registrosTelemetria);
        const gsPromedio = this.calcularAceleracionPromedioGs(test.registrosTelemetria);

        let eficiencia: 'Optima' | 'Desafiante' | 'Inestable' = 'Optima';
        if (gsPromedio < 1.0) {
          eficiencia = 'Inestable';
        } else if (gsPromedio < 1.4) {
          eficiencia = 'Desafiante';
        }

        reportes.push({
          hipercar: `${test.modeloHipercar} [${test.testId}]`,
          piloto: test.nombrePiloto,
          traccion: test.traccion,
          velocidadMaximaKmh: vmax,
          aceleracionPromedioGs: gsPromedio,
          eficienciaAerodinamica: eficiencia,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Simulador Hipercar Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.velocidadMaximaKmh - a.velocidadMaximaKmh);
  }
}

function imprimirReporteSimulacion(titulo: string, reportes: readonly ReporteSimulacionHipercar[]): void {
  console.log(`=== [SIMULADOR DE ACELERACION HYPERCAR - HIPERDEPORTIVOS] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Hipercar: ${item.hipercar} | Piloto: ${item.piloto} | Tracción: ${item.traccion} | V. Máx: ${item.velocidadMaximaKmh} km/h | Gs Promedio: ${item.aceleracionPromedioGs} G | Eficiencia: ${item.eficienciaAerodinamica}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoSimulacionHipercar(): Promise<void> {
  const simuladorOficial = new SimuladorAceleracionHipercar(registroPruebasHipercar);
  const reporteOficial = await simuladorOficial.procesarReportesSimulacionAsync();
  imprimirReporteSimulacion("Reporte Oficial de Pruebas de Aceleración y Telemetría", reporteOficial);

  // caso: Hipercar experimental con datos de telemetria nulos y perdida de traccion critica
  const testCasoLimite: readonly TestAceleracion[] = [
    {
      testId: "SIM-9999",
      nombrePiloto: "Orion TestDriver",
      modeloHipercar: "Prototipo Derrapado Inestable",
      traccion: "RWD_TwinTurbo",
      potenciaHp: 500,
      pesoKg: 1800,
      estadoActual: "FrenandoSeco",
      registrosTelemetria: []
    }
  ];

  const simuladorLimite = new SimuladorAceleracionHipercar(testCasoLimite);
  const reporteLimite = await simuladorLimite.procesarReportesSimulacionAsync();
  imprimirReporteSimulacion("caso: Hipercar experimental con datos de telemetria nulos y perdida de traccion critica", reporteLimite);
}

ejecutarFlujoSimulacionHipercar();