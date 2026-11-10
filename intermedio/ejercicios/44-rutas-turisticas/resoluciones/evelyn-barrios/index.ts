export {};

type DificultadRecorrido = "Facil" | "Moderado" | "Exigente";

interface HitoTuristico {
  readonly id: string;
  readonly nombre: string;
  readonly tiempoEstimadoHoras: number;
  readonly costoIngresoUsd: number;
  readonly dificultad: DificultadRecorrido;
}

class ItinerarioInteligente<T extends HitoTuristico> {
  private hitos: T[] = [];

  agregarPunto(hito: T): void {
    this.hitos.push(hito);
  }

  calcularTiempoTotal(): number {
    return this.hitos.reduce((acc, h) => acc + h.tiempoEstimadoHoras, 0);
  }

  calcularPresupuestoEntradas(): number {
    return this.hitos.reduce((acc, h) => acc + h.costoIngresoUsd, 0);
  }

  obtenerListado(): readonly T[] {
    return this.hitos;
  }
}

const rutaRoma = new ItinerarioInteligente<HitoTuristico>();
rutaRoma.agregarPunto({ id: "h-01", nombre: "Coliseo Romano", tiempoEstimadoHoras: 2.5, costoIngresoUsd: 22, dificultad: "Facil" });
rutaRoma.agregarPunto({ id: "h-02", nombre: "Foro Romano y Palatino", tiempoEstimadoHoras: 2.0, costoIngresoUsd: 18, dificultad: "Moderado" });

console.log("=== RUTAS TURISTICAS INTELIGENTES ===");
console.log(`Puntos en ruta: ${rutaRoma.obtenerListado().length}`);
console.log(`Tiempo total proyectado: ${rutaRoma.calcularTiempoTotal()} horas`);
console.log(`Presupuesto de accesos: $${rutaRoma.calcularPresupuestoEntradas()} USD`);