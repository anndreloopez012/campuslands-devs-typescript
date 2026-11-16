// Ejercicio 13: Modulos - utilidades
// Resolucion: Dulce Morales
// Este modulo tiene toda la logica. index.ts solo la importa y la usa.

export type Destino = {
  ciudad: string;
  pais: string;
  presupuestoUsd: number;
  dias: number;
  actividades: string[];
};

// Reto extra: solo los destinos que caben en el presupuesto maximo
export function filtrarPorPresupuesto(destinos: Destino[], presupuestoMaximo: number): Destino[] {
  return destinos.filter((destino: Destino): boolean => destino.presupuestoUsd <= presupuestoMaximo);
}

export function ordenarPorPrecio(destinos: Destino[]): Destino[] {
  // Copia con [...] para no modificar el array original
  return [...destinos].sort((a: Destino, b: Destino): number => a.presupuestoUsd - b.presupuestoUsd);
}

export function costoPorDia(destino: Destino): number {
  return Math.round(destino.presupuestoUsd / destino.dias);
}

export function formatearDestino(destino: Destino): string {
  const lugar: string = `${destino.ciudad}, ${destino.pais}`;
  return `${lugar.padEnd(29)} $${destino.presupuestoUsd} (${destino.dias} dias, ~$${costoPorDia(destino)}/dia) | ${destino.actividades.join(", ")}`;
}

export function mostrarDestinos(titulo: string, destinos: Destino[]): void {
  console.log(`=== ${titulo} ===`);
  if (destinos.length === 0) {
    console.log("No hay destinos disponibles.");
    return;
  }
  destinos.forEach((destino: Destino, indice: number): void => {
    console.log(`${indice + 1}. ${formatearDestino(destino)}`);
  });
}
