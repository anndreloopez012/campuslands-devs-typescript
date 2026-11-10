export {};

interface ParadaItinerarioDTO {
  readonly dia: number;
  readonly ciudad: string;
  readonly atraccionPrincipal: string;
  readonly costoAlojamientoUsd: number;
  readonly costoActividadesUsd: number;
}

interface PlanViajeDTO {
  readonly idPlan: string;
  readonly destinoPais: string;
  readonly fechaSalida: string;
  readonly paradas: readonly ParadaItinerarioDTO[];
}

interface ResumenFinancieroViaje {
  readonly diasTotales: number;
  readonly costoTotalAlojamiento: number;
  readonly costoTotalActividades: number;
  readonly presupuestoEstimadoTotalUsd: number;
}

class GestorPlanViajes {
  calcularPresupuestoTotal(plan: PlanViajeDTO): ResumenFinancieroViaje {
    const totalAlojamiento = plan.paradas.reduce((acc, p) => acc + p.costoAlojamientoUsd, 0);
    const totalActividades = plan.paradas.reduce((acc, p) => acc + p.costoActividadesUsd, 0);

    return {
      diasTotales: plan.paradas.length,
      costoTotalAlojamiento: totalAlojamiento,
      costoTotalActividades: totalActividades,
      presupuestoEstimadoTotalUsd: totalAlojamiento + totalActividades,
    };
  }
}

function main() {
  console.log("=== PLANNER DE VIAJES (DTO & RESUMEN FINANCIERO) ===");
  const gestor = new GestorPlanViajes();

  const viajeJapon: PlanViajeDTO = {
    idPlan: "JPN-2026",
    destinoPais: "Japon",
    fechaSalida: "2026-04-10",
    paradas: [
      { dia: 1, ciudad: "Tokyo", atraccionPrincipal: "Cruce de Shibuya y Akihabara", costoAlojamientoUsd: 110, costoActividadesUsd: 45 },
      { dia: 2, ciudad: "Kyoto", atraccionPrincipal: "Santuario Fushimi Inari", costoAlojamientoUsd: 95, costoActividadesUsd: 30 },
      { dia: 3, ciudad: "Osaka", atraccionPrincipal: "Castillo de Osaka y Dotonbori", costoAlojamientoUsd: 90, costoActividadesUsd: 55 },
    ],
  };

  const resumen = gestor.calcularPresupuestoTotal(viajeJapon);
  console.log(`Itinerario programado a ${viajeJapon.destinoPais} (${resumen.diasTotales} dias):`);
  viajeJapon.paradas.forEach((p) => {
    console.log(`Dia ${p.dia}: ${p.ciudad} - ${p.atraccionPrincipal} ($${p.costoAlojamientoUsd + p.costoActividadesUsd} USD)`);
  });
  console.log(`Presupuesto consolidado: $${resumen.presupuestoEstimadoTotalUsd} USD (Alojamiento: $${resumen.costoTotalAlojamiento} | Actividades: $${resumen.costoTotalActividades})`);
}

main();
