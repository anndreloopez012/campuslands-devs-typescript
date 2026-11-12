export {};

type CategoriaCilindrada = 'Superbike 1000cc' | 'Supersport 600cc' | 'Naked Hyper' | 'MotoGP Prototipo';
type EstadoMecanico = 'Optimo' | 'Sobrecalentamiento' | 'FallaSensor' | 'DesgasteNeumatico';

interface LecturaTelemetria {
  readonly registroId: string;
  readonly piloto: string;
  readonly escuderia: string;
  readonly modeloMoto: string;
  readonly categoria: CategoriaCilindrada;
  readonly velocidadPuntaKmh: number;
  readonly rpmMaximas: number;
  readonly temperaturaMotorCelsius: number;
  readonly inclinacionMaximaGrados: number;
  readonly presionNeumaticoPsi: number;
  estadoSistema: EstadoMecanico;
}

interface DiagnosticoPista {
  readonly piloto: string;
  readonly motocicleta: string;
  readonly indiceExigenciaMecanica: number;
  readonly estadoOperativo: string;
  readonly alertaMantenimiento: boolean;
}

const sesionesCircuitoLusail: readonly LecturaTelemetria[] = [
  {
    registroId: "TEL-401",
    piloto: "Tazio Moretti",
    escuderia: "Veloce Corse",
    modeloMoto: "Ducati Panigale V4R",
    categoria: "Superbike 1000cc",
    velocidadPuntaKmh: 318.4,
    rpmMaximas: 16200,
    temperaturaMotorCelsius: 96,
    inclinacionMaximaGrados: 61.5,
    presionNeumaticoPsi: 29.5,
    estadoSistema: "Optimo",
  },
  {
    registroId: "TEL-402",
    piloto: "Henrik Lindholm",
    escuderia: "Nordic Apex Racing",
    modeloMoto: "Aprilia RSV4 Factory",
    categoria: "Superbike 1000cc",
    velocidadPuntaKmh: 314.8,
    rpmMaximas: 15800,
    temperaturaMotorCelsius: 112,
    inclinacionMaximaGrados: 59.8,
    presionNeumaticoPsi: 31.2,
    estadoSistema: "Sobrecalentamiento",
  },
  {
    registroId: "TEL-403",
    piloto: "Kenshin Takahashi",
    escuderia: "Kurogane Motorsports",
    modeloMoto: "Yamaha YZF-R6",
    categoria: "Supersport 600cc",
    velocidadPuntaKmh: 276.2,
    rpmMaximas: 16400,
    temperaturaMotorCelsius: 92,
    inclinacionMaximaGrados: 63.1,
    presionNeumaticoPsi: 28.8,
    estadoSistema: "Optimo",
  },
  {
    registroId: "TEL-404",
    piloto: "Gael Aramburu",
    escuderia: "Iberia Track Team",
    modeloMoto: "BMW M1000RR",
    categoria: "Superbike 1000cc",
    velocidadPuntaKmh: 321.0,
    rpmMaximas: 15950,
    temperaturaMotorCelsius: 99,
    inclinacionMaximaGrados: 60.4,
    presionNeumaticoPsi: 24.1,
    estadoSistema: "DesgasteNeumatico",
  },
  {
    registroId: "TEL-405",
    piloto: "Soren Vestergaard",
    escuderia: "Baltic Moto Engineering",
    modeloMoto: "KTM RC 8C",
    categoria: "Naked Hyper",
    velocidadPuntaKmh: 0,
    rpmMaximas: 0,
    temperaturaMotorCelsius: 45,
    inclinacionMaximaGrados: 0,
    presionNeumaticoPsi: 29.0,
    estadoSistema: "FallaSensor",
  }
];

function validarIntegridadTelemetria(lectura: LecturaTelemetria): boolean {
  return lectura.estadoSistema !== "FallaSensor" && lectura.velocidadPuntaKmh > 0 && lectura.rpmMaximas > 1000;
}

function calcularExigenciaMecanica(lectura: LecturaTelemetria): number {
  const factorVelocidad = lectura.velocidadPuntaKmh * 0.25;
  const factorRpm = (lectura.rpmMaximas / 1000) * 3.5;
  const factorTemperatura = lectura.temperaturaMotorCelsius > 105 ? (lectura.temperaturaMotorCelsius - 105) * 4 : 0;
  const factorInclinacion = lectura.inclinacionMaximaGrados * 0.6;
  return Number((factorVelocidad + factorRpm + factorTemperatura + factorInclinacion).toFixed(2));
}

function determinarAlertaBoxes(lectura: LecturaTelemetria): boolean {
  return (
    lectura.temperaturaMotorCelsius >= 108 ||
    lectura.presionNeumaticoPsi < 26.0 ||
    lectura.estadoSistema !== "Optimo"
  );
}

function diagnosticarEstadoPista(lectura: LecturaTelemetria, indice: number): string {
  if (lectura.temperaturaMotorCelsius >= 110) return "Crítico: Ingreso inmediato a boxes por temperatura";
  if (lectura.presionNeumaticoPsi < 26.0) return "Precaución: Pérdida de presión en compuesto trasero";
  if (indice >= 170) return "Rendimiento Extremo al Límite";
  return "Telemetría Nominal en Pista";
}

function procesarSesionesTelemetria(lecturas: readonly LecturaTelemetria[]): readonly DiagnosticoPista[] {
  return lecturas
    .filter(validarIntegridadTelemetria)
    .map(lectura => {
      const exigencia = calcularExigenciaMecanica(lectura);
      return {
        piloto: lectura.piloto,
        motocicleta: `${lectura.modeloMoto} (${lectura.escuderia})`,
        indiceExigenciaMecanica: exigencia,
        estadoOperativo: diagnosticarEstadoPista(lectura, exigencia),
        alertaMantenimiento: determinarAlertaBoxes(lectura),
      };
    })
    .sort((a, b) => b.indiceExigenciaMecanica - a.indiceExigenciaMecanica);
}

function imprimirReporteTelemetria(titulo: string, diagnosticos: readonly DiagnosticoPista[]): void {
  console.log(`=== [TELEMETRÍA DE CIRCUITO] ${titulo} ===`);
  diagnosticos.forEach((diag, posicion) => {
    const etiquetaAlerta = diag.alertaMantenimiento ? "[ALERTA BOXES]" : "[OK]";
    console.log(
      `${posicion + 1}. ${diag.piloto} - ${diag.motocicleta} | Exigencia: ${diag.indiceExigenciaMecanica} | ${etiquetaAlerta} ${diag.estadoOperativo}`
    );
  });
  console.log("=========================================================\n");
}

const reporteSesionOficial = procesarSesionesTelemetria(sesionesCircuitoLusail);
imprimirReporteTelemetria("Clasificación de Exigencia Mecánica en Pista", reporteSesionOficial);

// Caso Límite: Telemetría con sobrecalentamiento severo y caída crítica de presión de neumáticos
const telemetriaCasoLimite: readonly LecturaTelemetria[] = [
  {
    registroId: "TEL-998",
    piloto: "Nicolae Dragan",
    escuderia: "Carpathian Racing",
    modeloMoto: "Kawasaki Ninja ZX-10RR",
    categoria: "Superbike 1000cc",
    velocidadPuntaKmh: 309.5,
    rpmMaximas: 16500,
    temperaturaMotorCelsius: 118,
    inclinacionMaximaGrados: 58.0,
    presionNeumaticoPsi: 21.4,
    estadoSistema: "Sobrecalentamiento",
  },
  {
    registroId: "TEL-999",
    piloto: "Matteo Corsi",
    escuderia: "Adriatic GP",
    modeloMoto: "MV Agusta F4 RC",
    categoria: "Superbike 1000cc",
    velocidadPuntaKmh: 0,
    rpmMaximas: 0,
    temperaturaMotorCelsius: 30,
    inclinacionMaximaGrados: 0,
    presionNeumaticoPsi: 30.0,
    estadoSistema: "FallaSensor",
  }
];

const resultadoLimite = procesarSesionesTelemetria(telemetriaCasoLimite);
imprimirReporteTelemetria("Caso Falla de Sensores y Temperatura Crítica", resultadoLimite);