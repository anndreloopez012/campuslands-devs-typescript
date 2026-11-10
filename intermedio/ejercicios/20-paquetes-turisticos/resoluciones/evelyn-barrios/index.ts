export {};

type ModalidadHospedaje = "Solo Desayuno" | "Media Pension" | "Todo Incluido";

interface PaqueteTuristico {
  readonly id: string;
  readonly nombre: string;
  readonly destino: string;
  readonly precioBaseUsd: number;
  readonly noches: number;
  readonly modalidad: ModalidadHospedaje;
  readonly toursIncluidos: number;
  readonly calificacionUsuarios: number;
}

interface EvaluacionPaquete extends PaqueteTuristico {
  readonly costoPorNoche: number;
  readonly scoreCalidadPrecio: number;
}

function evaluarPaquete(paquete: PaqueteTuristico): EvaluacionPaquete {
  const noches = paquete.noches === 0 ? 1 : paquete.noches;
  const costoPorNoche = Number((paquete.precioBaseUsd / noches).toFixed(2));
  
  // Ponderacion: mayor calificacion y tours por menor costo por noche
  const score = Number(((paquete.calificacionUsuarios * 20 + paquete.toursIncluidos * 10) / (costoPorNoche / 50)).toFixed(1));

  return {
    ...paquete,
    costoPorNoche,
    scoreCalidadPrecio: score,
  };
}

function rankearMejoresPaquetes(paquetes: readonly PaqueteTuristico[]): EvaluacionPaquete[] {
  return paquetes
    .map(evaluarPaquete)
    .sort((a, b) => b.scoreCalidadPrecio - a.scoreCalidadPrecio);
}

const opcionesTurismo: PaqueteTuristico[] = [
  { id: "pq-01", nombre: "Caribe Relax", destino: "Cancun, Mexico", precioBaseUsd: 1200, noches: 5, modalidad: "Todo Incluido", toursIncluidos: 3, calificacionUsuarios: 4.8 },
  { id: "pq-02", nombre: "Aventura Andina", destino: "Cusco, Peru", precioBaseUsd: 850, noches: 4, modalidad: "Solo Desayuno", toursIncluidos: 4, calificacionUsuarios: 4.7 },
  { id: "pq-03", nombre: "Evasion Tropical", destino: "Punta Cana", precioBaseUsd: 1400, noches: 6, modalidad: "Todo Incluido", toursIncluidos: 2, calificacionUsuarios: 4.5 },
];

console.log("=== COMPARADOR DE PAQUETES TURISTICOS ===");
const rankingTurismo = rankearMejoresPaquetes(opcionesTurismo);
rankingTurismo.forEach((p, idx) => {
  console.log(`#${idx + 1} ${p.nombre} (${p.destino}) - $${p.costoPorNoche}/noche | Modalidad: ${p.modalidad} | Score: ${p.scoreCalidadPrecio}`);
});