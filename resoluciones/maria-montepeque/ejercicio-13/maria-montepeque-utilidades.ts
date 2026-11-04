export type Destino = {
  ciudad: string;
  pais: string;
  presupuestoUsd: number;
  actividades: string[];
};

export const filtrarPorPresupuesto = (
  destinos: Destino[],
  max: number,
): Destino[] => destinos.filter((d) => d.presupuestoUsd <= max);

export const formatearDestino = (d: Destino): string =>
  `${d.ciudad}, ${d.pais} - USD ${d.presupuestoUsd} - ${d.actividades.join(", ")}`;
