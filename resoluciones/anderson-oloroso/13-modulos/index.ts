import destinos from "./datos.json" with { type: "json" };
import { filtrarPorPresupuesto, formatearDestino } from "./utilidades.ts";

// Ejercicio 13: Modulos
// Contexto: Aplicacion de viajes

// TODO: usa las utilidades importadas para filtrar y mostrar destinos.
console.log(destinos);
console.log(filtrarPorPresupuesto);
console.log(formatearDestino);

console.log("=== Lista de Destinos Completa ===");
console.log(JSON.stringify(destinos, null, 2));

const misDestinosFiltrados = filtrarPorPresupuesto(destinos, 500);

console.log("\n=== Destinos ===");
misDestinosFiltrados.forEach((destino) => {
  console.log(formatearDestino(destino));
});
