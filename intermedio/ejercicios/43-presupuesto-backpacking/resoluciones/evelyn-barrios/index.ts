export {};

type CategoriaBackpacking = "Hostal" | "Transporte Local" | "Comida Callejera" | "Entradas";

interface GastoViaje {
  readonly id: string;
  readonly concepto: string;
  readonly montoUsd: number;
  readonly categoria: CategoriaBackpacking;
}

class CajaBackpacker<T extends GastoViaje> {
  private gastos: T[] = [];
  private presupuestoDisponible: number;

  constructor(fondoInicial: number) {
    this.presupuestoDisponible = fondoInicial;
  }

  anotarGasto(gasto: T): boolean {
    if (gasto.montoUsd <= this.presupuestoDisponible) {
      this.gastos.push(gasto);
      this.presupuestoDisponible = Number((this.presupuestoDisponible - gasto.montoUsd).toFixed(2));
      return true;
    }
    return false;
  }

  obtenerSaldoRestante(): number {
    return this.presupuestoDisponible;
  }

  obtenerGastoPorCategoria(categoria: CategoriaBackpacking): number {
    return this.gastos
      .filter((g) => g.categoria === categoria)
      .reduce((acc, g) => acc + g.montoUsd, 0);
  }
}

const cajaRuta = new CajaBackpacker<GastoViaje>(500);
cajaRuta.anotarGasto({ id: "g-01", concepto: "Cama en dormitorio compartido Hostal", montoUsd: 18, categoria: "Hostal" });
cajaRuta.anotarGasto({ id: "g-02", concepto: "Pad Thai en mercado nocturno", montoUsd: 4.5, categoria: "Comida Callejera" });

console.log("=== PRESUPUESTO BACKPACKING ===");
console.log(`Fondo remanente: $${cajaRuta.obtenerSaldoRestante()} USD`);
console.log(`Gastos en Hostales: $${cajaRuta.obtenerGastoPorCategoria("Hostal")} USD`);