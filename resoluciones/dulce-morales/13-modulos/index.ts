// Ejercicio 13: Modulos
// Contexto: Aplicacion de viajes
// Resolucion: Dulce Morales
// Punto de entrada: carga los datos, llama a las utilidades y muestra el resultado.

import datos from "./datos.json" with { type: "json" };
import { filtrarPorPresupuesto, mostrarDestinos, ordenarPorPrecio } from "./utilidades";
import type { Destino } from "./utilidades";

const destinos: Destino[] = datos;
const presupuestoMaximo: number = 600;

mostrarDestinos(`TODOS LOS DESTINOS (${destinos.length})`, ordenarPorPrecio(destinos));
console.log("");

const disponibles: Destino[] = filtrarPorPresupuesto(destinos, presupuestoMaximo);
mostrarDestinos(
  `DENTRO DE TU PRESUPUESTO: $${presupuestoMaximo} (${disponibles.length})`,
  ordenarPorPrecio(disponibles),
);
console.log("");

mostrarDestinos("PRESUPUESTO DE $300", filtrarPorPresupuesto(destinos, 300));
