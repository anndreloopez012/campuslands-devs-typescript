// Ejercicio 13: Modulos

import destinos from "./maria-montepeque-13.json" with { type: "json" };
import {
  filtrarPorPresupuesto,
  formatearDestino,
  type Destino,
} from "./maria-montepeque-13-u";

const presupuestoDisponible = 600;

const destinosDisponibles: Destino[] = filtrarPorPresupuesto(
  destinos,
  presupuestoDisponible,
);

console.log(
  `Destinos disponibles con un presupuesto de USD ${presupuestoDisponible}:\n`,
);

if (destinosDisponibles.length === 0) {
  console.log("No hay destinos dentro de ese presupuesto.");
} else {
  destinosDisponibles.forEach((destino) => {
    console.log(`- ${formatearDestino(destino)}`);
  });
}
