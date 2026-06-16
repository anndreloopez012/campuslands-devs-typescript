export type Destino = {
  ciudad: string;
  pais: string;
  presupuestoUsd: number;
  actividades: string[];
};

export function filtrarPorPresupuesto(destinos: Destino[], presupuestoMaximo: number): Destino[] {
  // TODO: retorna solo los destinos dentro del presupuesto.
  console.log(presupuestoMaximo);
  return destinos.filter((d)=> d.presupuestoUsd <= presupuestoMaximo);
}

export function formatearDestino(destino: Destino): string {
  // TODO: retorna un texto legible del destino.
  return `${destino.ciudad}, ${destino.pais} (Costo: $${destino.presupuestoUsd}) - Actividades: ${destino.actividades.join(", ")}`;
}
