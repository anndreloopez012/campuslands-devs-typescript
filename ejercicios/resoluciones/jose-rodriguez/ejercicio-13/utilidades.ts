// Contrato corregido según las llaves reales de tu datos.json
export interface DestinoViaje {
    ciudad: string;
    pais: string;
    presupuestoUsd: number;
    actividades: string[]; // Array de strings para almacenar los pasatiempos
}

/**
 * Filtra la lista de destinos según el presupuesto máximo que posee el usuario
 */
export function filtrarDestinosPorPresupuesto(destinos: DestinoViaje[], presupuestoMaximo: number): DestinoViaje[] {
    return destinos.filter(lugar => lugar.presupuestoUsd <= presupuestoMaximo);
}

/**
 * Imprime un formato limpio y ordenado de la información de la ciudad
 */
export function imprimirDestino(lugar: DestinoViaje): void {
    console.log(`Destino : ${lugar.ciudad}, ${lugar.pais}`);
    console.log(`Costo   : $${lugar.presupuestoUsd} USD`);
    // Usamos .join() para mostrar las actividades separadas por comas de forma estética
    console.log(`Planes  : ${lugar.actividades.join(", ")}`);
    console.log("----------------------------------------");
}