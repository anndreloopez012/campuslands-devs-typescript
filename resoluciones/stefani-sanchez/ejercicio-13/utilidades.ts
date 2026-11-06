export type Destino = {
  ciudad: string;
  pais: string;
  presupuestoUsd: number;
  actividades: string[];
};

export function filtrarPorPresupuesto(lista: Destino[], presupuestoMax: number): Destino[] {
  return lista.filter((d) => d.presupuestoUsd <= presupuestoMax);
}

export function formatearDestino(d: Destino): string {
  return `📍 ${d.ciudad}, ${d.pais} - Costo estimado: $${d.presupuestoUsd} USD | Actividades: ${d.actividades.join(", ")}`;
}
