export {};

type CategoriaGasto = "Vuelo" | "Hospedaje" | "Comida" | "Actividad" | "Transporte Local";

interface ActividadItinerario {
  readonly dia: number;
  readonly descripcion: string;
  readonly categoria: CategoriaGasto;
  readonly costoUsd: number;
  readonly duracionHoras: number;
}

interface PlanViaje {
  readonly destino: string;
  readonly totalDias: number;
  readonly presupuestoLimiteUsd: number;
  readonly actividades: readonly ActividadItinerario[];
}

interface BalanceViaje {
  readonly destino: string;
  readonly gastoTotalUsd: number;
  readonly gastoPromedioDiario: number;
  readonly dentroDelPresupuesto: boolean;
  readonly balanceRemanente: number;
}

function calcularPresupuestoItinerario(plan: PlanViaje): BalanceViaje {
  const gastoTotal = plan.actividades.reduce((acc, act) => acc + act.costoUsd, 0);
  const dias = plan.totalDias === 0 ? 1 : plan.totalDias;
  const promedioDiario = Number((gastoTotal / dias).toFixed(2));
  const remanente = Number((plan.presupuestoLimiteUsd - gastoTotal).toFixed(2));

  return {
    destino: plan.destino,
    gastoTotalUsd: Number(gastoTotal.toFixed(2)),
    gastoPromedioDiario: promedioDiario,
    dentroDelPresupuesto: remanente >= 0,
    balanceRemanente: remanente,
  };
}

const miViajeJapon: PlanViaje = {
  destino: "Tokio y Kioto, JapÃ³n",
  totalDias: 7,
  presupuestoLimiteUsd: 1800,
  actividades: [
    { dia: 1, descripcion: "Tren Shinkansen Tokio-Kioto", categoria: "Transporte Local", costoUsd: 130, duracionHoras: 2.5 },
    { dia: 2, descripcion: "Visita al Santuario Fushimi Inari", categoria: "Actividad", costoUsd: 25, duracionHoras: 4 },
    { dia: 3, descripcion: "Tour gastronomico callejero en Dotonbori", categoria: "Comida", costoUsd: 65, duracionHoras: 3 },
  ],
};

console.log("=== ITINERARIO Y PLANIFICADOR DE VIAJE ===");
const estadoViaje = calcularPresupuestoItinerario(miViajeJapon);
console.log(`Destino: ${estadoViaje.destino} (Duracion: ${miViajeJapon.totalDias} dias)`);
console.log(`Gasto proyectado: $${estadoViaje.gastoTotalUsd} USD | Promedio diario: $${estadoViaje.gastoPromedioDiario} USD`);
console.log(`Finanzas del viaje: ${estadoViaje.dentroDelPresupuesto ? `Bajo presupuesto (Margen: +$${estadoViaje.balanceRemanente} USD)` : `Excedido por -$${Math.abs(estadoViaje.balanceRemanente)} USD`}`);