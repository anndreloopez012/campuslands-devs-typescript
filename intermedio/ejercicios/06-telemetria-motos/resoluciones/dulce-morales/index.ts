export {};

// Intermedio 06: Telemetria de motos deportivas
// Tematica: motos y mecanica de motos
// Resolucion: Dulce Morales
//
// Problema: durante una sesion en pista, cada moto envia lecturas de sus sensores.
// Hay que descartar lecturas con errores de sensor, calcular el rendimiento
// y avisar a los mecanicos de problemas (motor caliente, llantas, sobre-revolucion).

// ===================== MODELO =====================

type Severidad = "info" | "advertencia" | "critico";
type EstadoMoto = "OK" | "Revisar" | "Detener";

interface Moto {
  readonly id: string;
  readonly piloto: string;
  readonly modelo: string;
  readonly rpmLimite: number; // linea roja del motor
}

interface Lectura {
  readonly motoId: string;
  readonly segundo: number;
  readonly velocidadKmh: number;
  readonly rpm: number;
  readonly temperaturaMotorC: number;
  readonly presionLlantaPsi: number;
  readonly inclinacionGrados: number;
}

interface Alerta {
  readonly severidad: Severidad;
  readonly mensaje: string;
}

interface ResumenTelemetria {
  readonly moto: Moto;
  readonly lecturasValidas: number;
  readonly lecturasDescartadas: number;
  readonly velocidadMaxima: number;
  readonly velocidadPromedio: number;
  readonly inclinacionMaxima: number;
  readonly temperaturaMaxima: number;
  readonly porcentajeSobreLimite: number;
  readonly alertas: readonly Alerta[];
  readonly estado: EstadoMoto;
}

// Rangos fisicamente posibles: fuera de esto es un error del sensor
type Rango = Readonly<{ min: number; max: number }>;

const RANGOS_SENSOR: Readonly<Record<"velocidadKmh" | "rpm" | "temperaturaMotorC" | "presionLlantaPsi" | "inclinacionGrados", Rango>> = {
  velocidadKmh: { min: 0, max: 360 },
  rpm: { min: 0, max: 20000 },
  temperaturaMotorC: { min: -20, max: 160 },
  presionLlantaPsi: { min: 10, max: 50 },
  inclinacionGrados: { min: -70, max: 70 },
};

// Umbrales de mecanica
const TEMP_ADVERTENCIA: number = 105;
const TEMP_CRITICA: number = 115;
const PRESION_MIN: number = 28;
const PRESION_MAX: number = 36;
const PORCENTAJE_SOBRE_LIMITE_MAX: number = 10;

// ===================== VALIDACION =====================

function dentroDeRango(valor: number, rango: Rango): boolean {
  return Number.isFinite(valor) && valor >= rango.min && valor <= rango.max;
}

function esLecturaValida(lectura: Lectura): boolean {
  return (
    dentroDeRango(lectura.velocidadKmh, RANGOS_SENSOR.velocidadKmh) &&
    dentroDeRango(lectura.rpm, RANGOS_SENSOR.rpm) &&
    dentroDeRango(lectura.temperaturaMotorC, RANGOS_SENSOR.temperaturaMotorC) &&
    dentroDeRango(lectura.presionLlantaPsi, RANGOS_SENSOR.presionLlantaPsi) &&
    dentroDeRango(lectura.inclinacionGrados, RANGOS_SENSOR.inclinacionGrados)
  );
}

// ===================== CALCULOS (funciones puras) =====================

function maximo(valores: readonly number[]): number {
  return valores.length === 0 ? 0 : Math.max(...valores);
}

function promedio(valores: readonly number[]): number {
  return valores.length === 0 ? 0 : valores.reduce((a: number, b: number): number => a + b, 0) / valores.length;
}

function redondear(valor: number, decimales: number = 1): number {
  const factor: number = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

function porcentajeSobreLimite(lecturas: readonly Lectura[], rpmLimite: number): number {
  if (lecturas.length === 0) return 0;
  const sobre: number = lecturas.filter((l: Lectura): boolean => l.rpm > rpmLimite).length;
  return redondear((sobre / lecturas.length) * 100);
}

function alertasTemperatura(temperaturaMaxima: number): Alerta[] {
  if (temperaturaMaxima >= TEMP_CRITICA) {
    return [{ severidad: "critico", mensaje: `motor a ${temperaturaMaxima} C (critico >= ${TEMP_CRITICA})` }];
  }
  if (temperaturaMaxima >= TEMP_ADVERTENCIA) {
    return [{ severidad: "advertencia", mensaje: `motor a ${temperaturaMaxima} C (advertencia >= ${TEMP_ADVERTENCIA})` }];
  }
  return [];
}

function alertasPresion(lecturas: readonly Lectura[]): Alerta[] {
  const presiones: number[] = lecturas.map((l: Lectura): number => l.presionLlantaPsi);
  const minima: number = Math.min(...presiones);
  const maxima: number = Math.max(...presiones);
  const alertas: Alerta[] = [];
  if (minima < PRESION_MIN) {
    alertas.push({ severidad: "advertencia", mensaje: `presion baja: ${minima} psi (minimo ${PRESION_MIN})` });
  }
  if (maxima > PRESION_MAX) {
    alertas.push({ severidad: "advertencia", mensaje: `presion alta: ${maxima} psi (maximo ${PRESION_MAX})` });
  }
  return alertas;
}

function alertasRpm(porcentaje: number, rpmLimite: number): Alerta[] {
  if (porcentaje > PORCENTAJE_SOBRE_LIMITE_MAX) {
    return [{ severidad: "critico", mensaje: `${porcentaje}% del tiempo sobre ${rpmLimite} rpm (maximo ${PORCENTAJE_SOBRE_LIMITE_MAX}%)` }];
  }
  if (porcentaje > 0) {
    return [{ severidad: "info", mensaje: `${porcentaje}% del tiempo sobre la linea roja` }];
  }
  return [];
}

function alertasDescartes(descartadas: number, total: number): Alerta[] {
  if (descartadas === 0) return [];
  const severidad: Severidad = descartadas === total ? "critico" : "advertencia";
  return [{ severidad, mensaje: `${descartadas} de ${total} lecturas con error de sensor` }];
}

function decidirEstado(alertas: readonly Alerta[]): EstadoMoto {
  if (alertas.some((a: Alerta): boolean => a.severidad === "critico")) return "Detener";
  if (alertas.some((a: Alerta): boolean => a.severidad === "advertencia")) return "Revisar";
  return "OK";
}

function analizarMoto(moto: Moto, todas: readonly Lectura[]): ResumenTelemetria {
  const propias: Lectura[] = todas.filter((l: Lectura): boolean => l.motoId === moto.id);
  const validas: Lectura[] = propias.filter(esLecturaValida);
  const descartadas: number = propias.length - validas.length;

  const velocidades: number[] = validas.map((l: Lectura): number => l.velocidadKmh);
  const temperaturaMaxima: number = maximo(validas.map((l: Lectura): number => l.temperaturaMotorC));
  const sobreLimite: number = porcentajeSobreLimite(validas, moto.rpmLimite);

  const alertas: Alerta[] = [
    ...alertasDescartes(descartadas, propias.length),
    ...(validas.length > 0
      ? [...alertasTemperatura(temperaturaMaxima), ...alertasPresion(validas), ...alertasRpm(sobreLimite, moto.rpmLimite)]
      : []),
  ];

  return {
    moto,
    lecturasValidas: validas.length,
    lecturasDescartadas: descartadas,
    velocidadMaxima: maximo(velocidades),
    velocidadPromedio: redondear(promedio(velocidades)),
    inclinacionMaxima: maximo(validas.map((l: Lectura): number => Math.abs(l.inclinacionGrados))),
    temperaturaMaxima,
    porcentajeSobreLimite: sobreLimite,
    alertas,
    estado: decidirEstado(alertas),
  };
}

// Ranking de ritmo: solo motos con datos, ordenadas por velocidad promedio
function rankingRitmo(resumenes: readonly ResumenTelemetria[]): ResumenTelemetria[] {
  return resumenes
    .filter((r: ResumenTelemetria): boolean => r.lecturasValidas > 0)
    .sort((a: ResumenTelemetria, b: ResumenTelemetria): number => b.velocidadPromedio - a.velocidadPromedio);
}

// ===================== DATOS DE PRUEBA =====================

const motos: readonly Moto[] = [
  { id: "M1", piloto: "Carla Diaz", modelo: "Yamaha R1", rpmLimite: 14000 },
  { id: "M2", piloto: "Leo Santos", modelo: "Ducati Panigale V4", rpmLimite: 15500 },
  { id: "M3", piloto: "Rita Gomez", modelo: "Kawasaki ZX-10R", rpmLimite: 14000 },
  { id: "M4", piloto: "Tito Ruiz", modelo: "Honda CBR1000RR", rpmLimite: 14500 },
  { id: "M5", piloto: "Ivan Mora", modelo: "BMW S1000RR", rpmLimite: 14600 },
  { id: "M6", piloto: "Noa Vidal", modelo: "Aprilia RSV4", rpmLimite: 13000 },
];

function lectura(motoId: string, segundo: number, velocidadKmh: number, rpm: number, temperaturaMotorC: number, presionLlantaPsi: number, inclinacionGrados: number): Lectura {
  return { motoId, segundo, velocidadKmh, rpm, temperaturaMotorC, presionLlantaPsi, inclinacionGrados };
}

const lecturas: readonly Lectura[] = [
  // M1: sesion limpia (caso normal)
  lectura("M1", 0, 120, 9800, 92, 32, 5),
  lectura("M1", 10, 245, 13200, 98, 32.5, 2),
  lectura("M1", 20, 168, 11000, 99, 33, -52),
  lectura("M1", 30, 288, 13900, 101, 33, 0),
  lectura("M1", 40, 142, 10200, 100, 32.8, 48),
  // M2: motor se calienta y llanta pierde presion
  lectura("M2", 0, 130, 10500, 98, 31, 3),
  lectura("M2", 10, 262, 14800, 108, 29, 1),
  lectura("M2", 20, 175, 12000, 113, 27.5, -55),
  lectura("M2", 30, 301, 15200, 117, 27, 0),
  lectura("M2", 40, 150, 11000, 116, 26.8, 50),
  // M3: va pasado de revoluciones y tiene una lectura con sensor danado
  lectura("M3", 0, 125, 12500, 95, 32, 4),
  lectura("M3", 10, 250, 14300, 99, 32, 1),
  lectura("M3", 20, 171, 14200, 101, 32, -50),
  lectura("M3", 30, 999, 14600, 102, 32, 0), // velocidad imposible: error de sensor
  lectura("M3", 40, 140, 13000, 104, 32, 47),
  // M5: caso limite, llega EXACTO a 105 C -> advertencia (el umbral es >= 105)
  lectura("M5", 0, 118, 10000, 97, 32, 6),
  lectura("M5", 10, 255, 14100, 103, 32, 2),
  lectura("M5", 20, 166, 11500, 105, 31.5, -49),
  lectura("M5", 30, 280, 14400, 104, 31.5, 0),
  // M6: caso limite, presion EXACTA de 28 psi -> no alerta (el minimo es 28)
  lectura("M6", 0, 110, 9500, 90, 29, 4),
  lectura("M6", 10, 230, 12500, 95, 28.4, 1),
  lectura("M6", 20, 160, 10800, 97, 28, -46),
  lectura("M6", 30, 270, 12900, 98, 28, 0),
  // M4: caso limite, todas las lecturas fallan (sensor desconectado)
  lectura("M4", 0, -1, 0, -40, 0, 0),
  lectura("M4", 10, -1, 0, -40, 0, 0),
];

// ===================== SALIDA POR CONSOLA =====================

const ICONO: Readonly<Record<Severidad, string>> = { info: "i", advertencia: "!", critico: "X" };

function imprimirResumen(r: ResumenTelemetria): void {
  console.log(`\n[${r.estado}] ${r.moto.piloto} - ${r.moto.modelo}`);
  if (r.lecturasValidas > 0) {
    console.log(`  Vel. max ${r.velocidadMaxima} km/h | Vel. prom ${r.velocidadPromedio} km/h | Inclinacion max ${r.inclinacionMaxima} grados`);
    console.log(`  Temp. max ${r.temperaturaMaxima} C | Sobre linea roja ${r.porcentajeSobreLimite}% | Lecturas ${r.lecturasValidas} validas, ${r.lecturasDescartadas} descartadas`);
  } else {
    console.log("  Sin lecturas validas: no se puede evaluar el rendimiento");
  }
  r.alertas.forEach((a: Alerta): void => console.log(`  ${ICONO[a.severidad]} ${a.severidad}: ${a.mensaje}`));
}

function main(): void {
  const resumenes: ResumenTelemetria[] = motos.map((m: Moto): ResumenTelemetria => analizarMoto(m, lecturas));

  console.log("=============== TELEMETRIA DE SESION ===============");
  resumenes.forEach(imprimirResumen);

  console.log("\n=============== RANKING DE RITMO ===============");
  rankingRitmo(resumenes).forEach((r: ResumenTelemetria, i: number): void => {
    console.log(`${i + 1}. ${r.moto.piloto.padEnd(11)} ${String(r.velocidadPromedio).padStart(5)} km/h promedio [${r.estado}]`);
  });

  const conteo: Record<EstadoMoto, number> = { OK: 0, Revisar: 0, Detener: 0 };
  resumenes.forEach((r: ResumenTelemetria): void => {
    conteo[r.estado] += 1;
  });
  console.log(`\nEstado del box: ${conteo.OK} OK, ${conteo.Revisar} revisar, ${conteo.Detener} detener`);
}

main();
