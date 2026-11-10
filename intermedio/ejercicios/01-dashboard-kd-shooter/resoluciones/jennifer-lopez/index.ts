export {};

type RangoTactico = 'Principiante' | 'Veterano' | 'Asesino Táctico' | 'Leyenda';

interface OperadorShooter {
  readonly idTag: string;
  readonly alias: string;
  rango: RangoTactico;
  bajas: number;
  muertes: number;
  asistencias: number;
  partidasJugadas: number;
  readonly activo: boolean;
}

interface EstadisticaProcesada {
  readonly alias: string;
  readonly kdRatio: number;
  readonly efectividadCombate: string;
  readonly rangoActual: RangoTactico;
}

const escuadronVipers: readonly OperadorShooter[] = [
  {
    idTag: "VIP-009",
    alias: "Douglas",
    rango: "Asesino Táctico",
    bajas: 152,
    muertes: 50,
    asistencias: 30,
    partidasJugadas: 31,
    activo: true,
  },
  {
    idTag: "VIP-014",
    alias: "Terminator",
    rango: "Veterano",
    bajas: 90,
    muertes: 85,
    asistencias: 55,
    partidasJugadas: 30,
    activo: true,
  },
  {
    idTag: "VIP-022",
    alias: "XRM",
    rango: "Leyenda",
    bajas: 230,
    muertes: 60,
    asistencias: 45,
    partidasJugadas: 50,
    activo: true,
  },
  {
    idTag: "VIP-031",
    alias: "tylor",
    rango: "Principiante",
    bajas: 15,
    muertes: 35,
    asistencias: 9,
    partidasJugadas: 20,
    activo: false,
  }
];

function calcularKD(bajas: number, muertes: number): number {
  if (muertes === 0) return bajas;
  return Number((bajas / muertes).toFixed(2));
}

function evaluarEfectividad(kd: number): string {
  if (kd >= 3.0) return "Élite Global";
  if (kd >= 1.8) return "Alto Impacto";
  if (kd >= 1.0) return "Estándar";
  return "Bajo Rendimiento";
}

function procesarDashboardOperadores(operadores: readonly OperadorShooter[]): readonly EstadisticaProcesada[] {
  return operadores
    .filter(op => op.activo)
    .map(op => {
      const kd = calcularKD(op.bajas, op.muertes);
      return {
        alias: op.alias,
        kdRatio: kd,
        efectividadCombate: evaluarEfectividad(kd),
        rangoActual: op.rango
      };
    })
    .sort((a, b) => b.kdRatio - a.kdRatio);
}

function generarReporteDashboard(titulo: string, estadisticas: readonly EstadisticaProcesada[]): void {
  console.log(`============= ${titulo} ======================`);
  estadisticas.forEach((stats, index) => {
    console.log(
      `${index + 1}. Operador: ${stats.alias} | K/D: ${stats.kdRatio} | Estado: ${stats.efectividadCombate} | Rango: ${stats.rangoActual}`
    );
  });
  console.log("=============================================================\n");
}

const resultadoDashboard = procesarDashboardOperadores(escuadronVipers);
generarReporteDashboard("Escuadrón Apex Vipers - Activos", resultadoDashboard);

// Caso: Operadores con 0 muertes o estadísticas vacías
const operadorCasoLimite: readonly OperadorShooter[] = [
  {
    idTag: "VIP-999",
    alias: "Shub_Zero",
    rango: "Leyenda",
    bajas: 25,
    muertes: 0,
    asistencias: 5,
    partidasJugadas: 5,
    activo: true,
  }
];

const resultadoLimite = procesarDashboardOperadores(operadorCasoLimite);
generarReporteDashboard("Cero Muertes Registradas", resultadoLimite);