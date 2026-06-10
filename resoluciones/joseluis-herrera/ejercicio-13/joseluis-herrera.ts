import destinos from "./datos.json" with { type: "json" };
import { filtrarPorPresupuesto, formatearDestino, Destino} from "./utilidades";

// Ejercicio 13: Modulos
// Contexto: Aplicacion de viajes

const presupuesto = 100; 

const posibledestino: Destino [] = filtrarPorPresupuesto(destinos, presupuesto);
console.log("Destinos posibles a los cuales ir con el presupuesto ${presupuesto}")
if (posibledestino.length > 0) {
    posibledestino.forEach((destino) => {
        console.log(formatearDestino(destino));
    });
} else {
    console.log("No se encontraron destinos para ese presupuesto.");
}
// TODO: usa las utilidades importadas para filtrar y mostrar destinos.

console.log(destinos);
console.log(filtrarPorPresupuesto);
console.log(formatearDestino);
