import destinos from "./datos.json" with { type: "json" };
import { Destino, filtrarPorPresupuesto, formatearDestino } from "./utilidades";

// Ejercicio 13: Módulos
// Contexto: Aplicación de Viajes y Destinos Turísticos

const presupuestoDisponible: number = 500;
const destinosAsequibles: Destino[] = filtrarPorPresupuesto(destinos, presupuestoDisponible);

console.log(`=== DESTINOS TURÍSTICOS CON PRESUPUESTO HASTA $${presupuestoDisponible} USD ===`);
if (destinosAsequibles.length > 0) {
  destinosAsequibles.forEach((d) => console.log(formatearDestino(d)));
} else {
  console.log("No se encontraron destinos disponibles para el presupuesto indicado.");
}
