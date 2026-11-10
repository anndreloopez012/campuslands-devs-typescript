export {};

type SubgeneroScifi = "Cyberpunk" | "Space Opera" | "Distopia" | "Viajes en el Tiempo";

interface EntregaSaga {
  readonly titulo: string;
  readonly anioLanzamiento: number;
  readonly recaudacionMillonesUsd: number;
  readonly duracionMinutos: number;
}

interface SagaCienciaFiccion {
  readonly nombreUniverso: string;
  readonly subgenero: SubgeneroScifi;
  readonly peliculas: readonly EntregaSaga[];
}

interface AnalisisSaga {
  readonly universo: string;
  readonly totalEntregas: number;
  readonly taquillaTotalMillones: number;
  readonly horasTotalesMaraton: number;
  readonly entregaMasExitosa: string;
}

function auditarSaga(saga: SagaCienciaFiccion): AnalisisSaga {
  const totalEntregas = saga.peliculas.length;
  if (totalEntregas === 0) {
    return { universo: saga.nombreUniverso, totalEntregas: 0, taquillaTotalMillones: 0, horasTotalesMaraton: 0, entregaMasExitosa: "N/A" };
  }

  const taquillaTotal = saga.peliculas.reduce((acc, p) => acc + p.recaudacionMillonesUsd, 0);
  const minutosTotales = saga.peliculas.reduce((acc, p) => acc + p.duracionMinutos, 0);
  const horasTotales = Number((minutosTotales / 60).toFixed(1));

  const masTaquillera = [...saga.peliculas].sort((a, b) => b.recaudacionMillonesUsd - a.recaudacionMillonesUsd)[0];

  return {
    universo: saga.nombreUniverso,
    totalEntregas,
    taquillaTotalMillones: taquillaTotal,
    horasTotalesMaraton: horasTotales,
    entregaMasExitosa: `${masTaquillera.titulo} ($${masTaquillera.recaudacionMillonesUsd}M)`,
  };
}

const universoDune: SagaCienciaFiccion = {
  nombreUniverso: "Dune Universe",
  subgenero: "Space Opera",
  peliculas: [
    { titulo: "Dune: Part One", anioLanzamiento: 2021, recaudacionMillonesUsd: 402, duracionMinutos: 155 },
    { titulo: "Dune: Part Two", anioLanzamiento: 2024, recaudacionMillonesUsd: 711, duracionMinutos: 166 },
  ],
};

console.log("=== ANALIZADOR DE SAGAS SCI-FI ===");
const metricasDune = auditarSaga(universoDune);
console.log(`Universo: ${metricasDune.universo} | Peliculas: ${metricasDune.totalEntregas}`);
console.log(`Recaudacion Global: $${metricasDune.taquillaTotalMillones}M USD | Tiempo de maraton: ${metricasDune.horasTotalesMaraton} horas`);
console.log(`Mayor exito en taquilla: ${metricasDune.entregaMasExitosa}`);