export {};

type CondicionClimatica = "Soleado Caluroso" | "Lluvia Fria" | "Nieve Invernal" | "Templado";

interface PrendaVestir {
  readonly id: string;
  readonly nombre: string;
  readonly categoria: "Superior" | "Inferior" | "Calzado" | "Accesorio";
  readonly climaApto: CondicionClimatica;
}

class ArmarioInteligente<T extends PrendaVestir> {
  private prendas: T[] = [];

  registrarPrenda(prenda: T): void {
    this.prendas.push(prenda);
  }

  generarOutfitParaClima(clima: CondicionClimatica): T[] {
    return this.prendas.filter((p) => p.climaApto === clima);
  }

  totalPrendas(): number {
    return this.prendas.length;
  }
}

const armario = new ArmarioInteligente<PrendaVestir>();
armario.registrarPrenda({ id: "p-01", nombre: "Parka Impermeable Termica", categoria: "Superior", climaApto: "Lluvia Fria" });
armario.registrarPrenda({ id: "p-02", nombre: "Botas de Cuero Selladas", categoria: "Calzado", climaApto: "Lluvia Fria" });
armario.registrarPrenda({ id: "p-03", nombre: "Camiseta de Lino Fresca", categoria: "Superior", climaApto: "Soleado Caluroso" });

console.log("=== OUTFIT SEGUN CLIMA ===");
const outfitLluvia = armario.generarOutfitParaClima("Lluvia Fria");
console.log(`Prendas sugeridas para Lluvia Fria: ${outfitLluvia.map((p) => p.nombre).join(", ")}`);