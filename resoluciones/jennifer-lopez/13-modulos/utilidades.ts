export type Destino = {
  ciudad: string;
  pais: string;
  presupuestoUsd: number;
  actividades: string[];
};

export function filtrarPorPresupuesto(destinos: Destino[], presupuestoMaximo: number): Destino[] {
  return destinos.filter(destino => destino.presupuestoUsd <= presupuestoMaximo);
}

export function formatearDestino(destino: Destino): string {
  return ` ${destino.ciudad}, ${destino.pais} | Presupuesto: $${destino.presupuestoUsd} USD | Actividades: ${destino.actividades.join(", ")}`;
}