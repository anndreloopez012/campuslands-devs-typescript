type Destino = {
  ciudad: string;
  pais: string;
  presupuestoUsd: number;
  actividades: string[];
};

function filtrarPorPresupuesto(listaDestinos: Destino[], presupuestoMaximo: number): Destino[] {
  return listaDestinos.filter((destino) => destino.presupuestoUsd <= presupuestoMaximo);
}

function formatearDestino(destino: Destino): string {
  return `${destino.ciudad}, ${destino.pais} - USD ${destino.presupuestoUsd} - actividades: ${destino.actividades.join(", ")}`;
}

const presupuestoDisponible = 600;
const destinosDisponibles = filtrarPorPresupuesto(destinos, presupuestoDisponible);

console.log(`Destinos disponibles con USD ${presupuestoDisponible}:`);
destinosDisponibles.forEach((destino) => console.log(formatearDestino(destino)));
