import destinos from "./datos.json" with { type: "json" };
import { Destino, filtrarPorPresupuesto, formatearDestino } from "./utilidades.js";



// Ejercicio 13: Modulos
// Contexto: Aplicacion de viajes

const TOPE_PRESUPUESTO_VIAJE = 600; 

console.log("=====================SISTEMA DE GESTIÓN DE VIAJES ====================");
console.log(`Buscando itinerarios con un presupuesto máximo de: USD ${TOPE_PRESUPUESTO_VIAJE}`);
console.log("---------------------------------------------------------------------\n");
const opcionesValidas: Destino[] = filtrarPorPresupuesto(destinos, TOPE_PRESUPUESTO_VIAJE);

if (opcionesValidas.length > 0) {
    console.log(" DESTINOS SELECCIONADOS PARA SU VIAJE:");
    console.log("---------------------------------------------------------------------");
    opcionesValidas.forEach((lugar: Destino) => {
        const lineaInformativa = formatearDestino(lugar);
        console.log(`• ${lineaInformativa}`);
    });
} else {
    console.log(" Operación Terminada: Ningún destino del catálogo se ajusta al presupuesto indicado.");
}

console.log("\n=====================================================================");