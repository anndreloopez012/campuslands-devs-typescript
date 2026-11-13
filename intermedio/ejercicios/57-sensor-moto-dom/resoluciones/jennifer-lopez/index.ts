export {};

type TipoSensorMoto = 'PresionAceite' | 'TemperaturaMotor' | 'NivelCombustible' | 'RpmTacometro' | 'SondaLambda';
type EstadoSensor = 'Normal' | 'Advertencia' | 'CriticoFalla' | 'Desconectado';
type CategoriaMotocicleta = 'Deportiva' | 'Naked' | 'DualSport' | 'Cruiser' | 'CafeRacer';

interface LecturaSensor {
  readonly lecturaId: string;
  readonly tipoSensor: TipoSensorMoto;
  readonly valorNumerico: number;
  readonly unidadMedida: string;
  readonly estado: EstadoSensor;
}

interface TelemetriaMotocicleta {
  readonly motoId: string;
  readonly modeloMotocicleta: string;
  readonly categoria: CategoriaMotocicleta;
  readonly kilometrajeActual: number;
  readonly sensoresInstalados: readonly LecturaSensor[];
}

interface ReportePanelSensoresMoto {
  readonly motocicleta: string;
  readonly categoria: CategoriaMotocicleta;
  readonly totalSensoresActivos: number;
  readonly temperaturaPromedioC: number;
  readonly presionPromedioPsi: number;
  readonly estadoDiagnostico: 'Optimizado' | 'RevisionRequerida' | 'PeligroInminente';
}

const registroMotosTelemetria: readonly TelemetriaMotocicleta[] = [
  {
    motoId: "MOTO-5701",
    modeloMotocicleta: "Yamaha MT-09 Sp Hyper Naked",
    categoria: "Naked",
    kilometrajeActual: 12450,
    sensoresInstalados: [
      { lecturaId: "L-01", tipoSensor: "TemperaturaMotor", valorNumerico: 88.5, unidadMedida: "°C", estado: "Normal" },
      { lecturaId: "L-02", tipoSensor: "PresionAceite", valorNumerico: 42.0, unidadMedida: "PSI", estado: "Normal" },
      { lecturaId: "L-03", tipoSensor: "RpmTacometro", valorNumerico: 4500, unidadMedida: "RPM", estado: "Normal" },
      { lecturaId: "L-04", tipoSensor: "NivelCombustible", valorNumerico: 65.0, unidadMedida: "%", estado: "Normal" }
    ]
  },
  {
    motoId: "MOTO-5702",
    modeloMotocicleta: "Ducati Panigale V4 S",
    categoria: "Deportiva",
    kilometrajeActual: 5200,
    sensoresInstalados: [
      { lecturaId: "L-05", tipoSensor: "TemperaturaMotor", valorNumerico: 104.2, unidadMedida: "°C", estado: "Advertencia" },
      { lecturaId: "L-06", tipoSensor: "PresionAceite", valorNumerico: 38.5, unidadMedida: "PSI", estado: "Normal" },
      { lecturaId: "L-07", tipoSensor: "RpmTacometro", valorNumerico: 9200, unidadMedida: "RPM", estado: "Normal" }
    ]
  },
  {
    motoId: "MOTO-5703",
    modeloMotocicleta: "KTM 890 Adventure R",
    categoria: "DualSport",
    kilometrajeActual: 18900,
    sensoresInstalados: [
      { lecturaId: "L-08", tipoSensor: "TemperaturaMotor", valorNumerico: 85.0, unidadMedida: "°C", estado: "Normal" },
      { lecturaId: "L-09", tipoSensor: "PresionAceite", valorNumerico: 45.0, unidadMedida: "PSI", estado: "Normal" },
      { lecturaId: "L-10", tipoSensor: "SondaLambda", valorNumerico: 1.02, unidadMedida: "Lambda", estado: "Normal" }
    ]
  },
  {
    motoId: "MOTO-5704",
    modeloMotocicleta: "Triumph Thruxton RS",
    categoria: "CafeRacer",
    kilometrajeActual: 9100,
    sensoresInstalados: [
      { lecturaId: "L-11", tipoSensor: "TemperaturaMotor", valorNumerico: 90.0, unidadMedida: "°C", estado: "Normal" },
      { lecturaId: "L-12", tipoSensor: "PresionAceite", valorNumerico: 40.0, unidadMedida: "PSI", estado: "Normal" }
    ]
  }
];

class AnalizadorPanelSensoresMoto<T extends TelemetriaMotocicleta> {
  private readonly motocicletas: readonly T[];

  constructor(motocicletas: readonly T[]) {
    this.motocicletas = motocicletas;
  }

  public async validarTelemetriaMotoAsync(moto: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!moto.motoId || moto.kilometrajeActual < 0) {
          reject(new Error(`Telemetría de motocicleta inválida: ${moto.modeloMotocicleta}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public calcularTemperaturaPromedio(sensores: readonly LecturaSensor[]): number {
    const tempSensores = sensores.filter(s => s.tipoSensor === "TemperaturaMotor" && s.estado !== "Desconectado");
    if (tempSensores.length === 0) return 0;
    const suma = tempSensores.reduce((acc, s) => acc + s.valorNumerico, 0);
    return Number((suma / tempSensores.length).toFixed(1));
  }

  public calcularPresionPromedio(sensores: readonly LecturaSensor[]): number {
    const presionSensores = sensores.filter(s => s.tipoSensor === "PresionAceite" && s.estado !== "Desconectado");
    if (presionSensores.length === 0) return 0;
    const suma = presionSensores.reduce((acc, s) => acc + s.valorNumerico, 0);
    return Number((suma / presionSensores.length).toFixed(1));
  }

  public async procesarReportesPanelAsync(): Promise<readonly ReportePanelSensoresMoto[]> {
    const reportes: ReportePanelSensoresMoto[] = [];

    for (const moto of this.motocicletas) {
      try {
        await this.validarTelemetriaMotoAsync(moto);
        const tempProm = this.calcularTemperaturaPromedio(moto.sensoresInstalados);
        const presProm = this.calcularPresionPromedio(moto.sensoresInstalados);
        const totalActivos = moto.sensoresInstalados.filter(s => s.estado !== "Desconectado").length;

        const tieneCritico = moto.sensoresInstalados.some(s => s.estado === "CriticoFalla");
        const tieneAdvertencia = moto.sensoresInstalados.some(s => s.estado === "Advertencia");

        let diagnostico: 'Optimizado' | 'RevisionRequerida' | 'PeligroInminente' = 'Optimizado';
        if (tieneCritico || tempProm > 115) {
          diagnostico = 'PeligroInminente';
        } else if (tieneAdvertencia || tempProm > 100) {
          diagnostico = 'RevisionRequerida';
        }

        reportes.push({
          motocicleta: `${moto.modeloMotocicleta} [${moto.motoId}]`,
          categoria: moto.categoria,
          totalSensoresActivos: totalActivos,
          temperaturaPromedioC: tempProm,
          presionPromedioPsi: presProm,
          estadoDiagnostico: diagnostico,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Sensor Moto Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.temperaturaPromedioC - a.temperaturaPromedioC);
  }
}

function imprimirReportePanelMoto(titulo: string, reportes: readonly ReportePanelSensoresMoto[]): void {
  console.log(`=== [PANEL DOM DE SENSORES MOTO - MOTOS Y MECANICA] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Moto: ${item.motocicleta} | Categoría: ${item.categoria} | Sensores Activos: ${item.totalSensoresActivos} | Temp Prom: ${item.temperaturaPromedioC}°C | Presión Prom: ${item.presionPromedioPsi} PSI | Diagnóstico: ${item.estadoDiagnostico}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoPanelSensoresMoto(): Promise<void> {
  const analizadorOficial = new AnalizadorPanelSensoresMoto(registroMotosTelemetria);
  const reporteOficial = await analizadorOficial.procesarReportesPanelAsync();
  imprimirReportePanelMoto("Control Oficial de Telemetría y Sensores en Motocicletas", reporteOficial);

  // caso: Motocicleta con sobrecalentamiento critico de motor y falla severa en sensor de presion de aceite
  const motoCasoLimite: readonly TelemetriaMotocicleta[] = [
    {
      motoId: "MOTO-9999",
      modeloMotocicleta: "Prototype Track HyperSport X",
      categoria: "Deportiva",
      kilometrajeActual: 1500,
      sensoresInstalados: [
        { lecturaId: "L-99", tipoSensor: "TemperaturaMotor", valorNumerico: 125.4, unidadMedida: "°C", estado: "CriticoFalla" },
        { lecturaId: "L-100", tipoSensor: "PresionAceite", valorNumerico: 10.2, unidadMedida: "PSI", estado: "CriticoFalla" }
      ]
    }
  ];

  const analizadorLimite = new AnalizadorPanelSensoresMoto(motoCasoLimite);
  const reporteLimite = await analizadorLimite.procesarReportesPanelAsync();
  imprimirReportePanelMoto("caso: Motocicleta con sobrecalentamiento critico de motor y falla severa en sensor de presion de aceite", reporteLimite);
}

ejecutarFlujoPanelSensoresMoto();