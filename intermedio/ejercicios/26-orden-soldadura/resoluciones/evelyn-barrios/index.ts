export {};

type ProcesoSoldadura = "MIG" | "TIG" | "SMAW" | "FCAW";
type CalidadInspeccion = "Aprobado" | "Requiere Pulido" | "Rechazado Por Fisura";

interface CordonSoldadura {
  readonly idCordon: string;
  readonly operador: string;
  readonly proceso: ProcesoSoldadura;
  readonly longitudMilimetros: number;
  readonly amperajeUtilizado: number;
  readonly resultadoInspeccion: CalidadInspeccion;
}

interface AuditoriaSoldadura {
  readonly totalCordones: number;
  readonly longitudTotalSoldadaMetros: number;
  readonly desglosePorProceso: Record<ProcesoSoldadura, number>;
  readonly tasaConformidad: number;
}

function auditarLoteSoldadura(cordones: readonly CordonSoldadura[]): AuditoriaSoldadura {
  const desglosePorProceso: Record<ProcesoSoldadura, number> = {
    MIG: 0,
    TIG: 0,
    SMAW: 0,
    FCAW: 0,
  };

  const longitudTotalMm = cordones.reduce((acc, c) => acc + c.longitudMilimetros, 0);
  let aprobados = 0;

  for (const cordon of cordones) {
    desglosePorProceso[cordon.proceso] += 1;
    if (cordon.resultadoInspeccion === "Aprobado") {
      aprobados += 1;
    }
  }

  const cantidad = cordones.length === 0 ? 1 : cordones.length;
  const tasa = Number(((aprobados / cantidad) * 100).toFixed(1));

  return {
    totalCordones: cordones.length,
    longitudTotalSoldadaMetros: Number((longitudTotalMm / 1000).toFixed(2)),
    desglosePorProceso,
    tasaConformidad: tasa,
  };
}

const inspeccionesPlanta: CordonSoldadura[] = [
  { idCordon: "CS-001", operador: "Marco Ramos", proceso: "TIG", longitudMilimetros: 450, amperajeUtilizado: 140, resultadoInspeccion: "Aprobado" },
  { idCordon: "CS-002", operador: "Marco Ramos", proceso: "MIG", longitudMilimetros: 800, amperajeUtilizado: 210, resultadoInspeccion: "Aprobado" },
  { idCordon: "CS-003", operador: "Raul Vega", proceso: "SMAW", longitudMilimetros: 350, amperajeUtilizado: 160, resultadoInspeccion: "Requiere Pulido" },
];

console.log("=== CONTROL DE CALIDAD DE SOLDADURA ===");
const metricasSoldadura = auditarLoteSoldadura(inspeccionesPlanta);
console.log(`Cordones inspeccionados: ${metricasSoldadura.totalCordones} | Metros lineales unidos: ${metricasSoldadura.longitudTotalSoldadaMetros} m`);
console.log(`Distribucion de procesos - TIG: ${metricasSoldadura.desglosePorProceso.TIG}, MIG: ${metricasSoldadura.desglosePorProceso.MIG}`);
console.log(`Indice de calidad conforme: ${metricasSoldadura.tasaConformidad}%`);