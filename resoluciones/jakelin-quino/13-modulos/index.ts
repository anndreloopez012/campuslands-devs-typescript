import destinos from "./datos.json" with { type: "json" };
import { filtrarPorPresupuesto, formatearDestino, Destino } from "./utilidades.ts";

// Ejercicio 13: Modulos
// Contexto: Aplicacion de viajes

// TODO: usa las utilidades importadas para filtrar y mostrar destinos.
console.log(destinos);
console.log(filtrarPorPresupuesto);
console.log(formatearDestino);

console.log("----------Ejercicio 13: Modulos----------")
const PRESUPUESTO_MAXIMO = 600;

console.log(`--- Buscando destinos con presupuesto máximo de: $${PRESUPUESTO_MAXIMO} USD ---`);
const destinosFiltrados: Destino[] = filtrarPorPresupuesto(destinos, PRESUPUESTO_MAXIMO);

console.log("\nOpciones disponibles encontradas:");
console.log("-------------------------------------");

if (destinosFiltrados.length === 0) {
  console.log("No se encontraron destinos que se ajusten a tu presupuesto");
} else {
  destinosFiltrados.forEach((destino) => {
    const infoFormateada = formatearDestino(destino);
    console.log(`${infoFormateada}`);
  });
}
