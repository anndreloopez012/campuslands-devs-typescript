import { DestinoViaje, filtrarDestinosPorPresupuesto, imprimirDestino } from "./utilidades.ts";
// Importamos tu archivo de datos corregido
import destinosDisponibles from "./datos.json";

console.log("========================================");
console.log("       EXPLORADOR DE DESTINOS           ");
console.log("========================================");

// Definimos un presupuesto límite para la prueba (ej: $600 USD)
const miPresupuestoMaximo: number = 600;

// Filtramos las ciudades que no superen los $600 USD
const opcionesDisponibles: DestinoViaje[] = filtrarDestinosPorPresupuesto(destinosDisponibles, miPresupuestoMaximo);

console.log(`Resultados para un presupuesto máximo de: $${miPresupuestoMaximo} USD\n`);

if (opcionesDisponibles.length === 0) {
    console.log("No se encontraron destinos que se ajusten a tu presupuesto.");
} else {
    opcionesDisponibles.forEach(lugar => {
        imprimirDestino(lugar);
    });
}
console.log("========================================");