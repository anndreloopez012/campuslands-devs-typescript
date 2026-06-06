export type Destino = {
  ciudad: string;
  pais: string;
  presupuestoUsd: number;
  actividades: string[];
};

/*Reto extra*/
export function filtrarPorPresupuesto(
  destinos: Destino[],
  presupuestoMaximo: number,
): Destino[] {
  return destinos.filter(
    (destino) => destino.presupuestoUsd <= presupuestoMaximo,
  );
}

/*Convierte un destino en una línea de texto legible para mostrar en consola.*/
export function formatearDestino(destino: Destino): string {
  const actividades = destino.actividades.join(", ");
  return `${destino.ciudad}, ${destino.pais} — USD ${destino.presupuestoUsd} — actividades: ${actividades}`;
}
