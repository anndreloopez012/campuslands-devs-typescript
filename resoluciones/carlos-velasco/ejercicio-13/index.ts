import destinos from "./datos.json" with { type: "json" };
import { filtrarPorPresupuesto, formatearDestino, Destino } from "./utilidades";
// Ejercicio 13: Modulos
// Contexto: Aplicacion de viajes

// TODO: usa las utilidades importadas para filtrar y mostrar destinos.
const presupuestoMaximo = 600;
const destinosDisponibles: Destino[] = filtrarPorPresupuesto(destinos, presupuestoMaximo);
console.log(`--- Destinos con presupuesto máximo de $${presupuestoMaximo} ---`);
if (destinosDisponibles.length > 0) {
    destinosDisponibles.forEach((destino) => {
        console.log(formatearDestino(destino));
    });
} else {
    console.log("No se encontraron destinos para ese presupuesto.");
}