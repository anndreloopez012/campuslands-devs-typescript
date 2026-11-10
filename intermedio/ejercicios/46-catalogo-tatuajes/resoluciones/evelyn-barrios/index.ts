export {};

type EstiloTattoo = "Realismo Sombras" | "Tradicional Americano" | "Geometria Sagrada" | "Acuarela";

interface FlashTattoo {
  readonly id: string;
  readonly titulo: string;
  readonly estilo: EstiloTattoo;
  readonly sesionesEstimadas: number;
  readonly precioBaseUsd: number;
}

class CatalogoEstudioTattoo<T extends FlashTattoo> {
  private coleccion: T[] = [];

  registrarDisenio(disenio: T): void {
    this.coleccion.push(disenio);
  }

  filtrarPorEstilo(estilo: EstiloTattoo): T[] {
    return this.coleccion.filter((d) => d.estilo === estilo);
  }

  calcularIngresoPotencial(): number {
    return this.coleccion.reduce((acc, d) => acc + d.precioBaseUsd, 0);
  }

  obtenerTotalDisenios(): number {
    return this.coleccion.length;
  }
}

const estudio = new CatalogoEstudioTattoo<FlashTattoo>();
estudio.registrarDisenio({ id: "fl-01", titulo: "Tigre Rugiendo", estilo: "Tradicional Americano", sesionesEstimadas: 2, precioBaseUsd: 280 });
estudio.registrarDisenio({ id: "fl-02", titulo: "Mandala Fractal", estilo: "Geometria Sagrada", sesionesEstimadas: 3, precioBaseUsd: 400 });
estudio.registrarDisenio({ id: "fl-03", titulo: "Aguila Imperial", estilo: "Tradicional Americano", sesionesEstimadas: 2, precioBaseUsd: 260 });

console.log("=== CATALOGO DE ESTILOS TATTOO ===");
console.log(`Disenios en vitrina: ${estudio.obtenerTotalDisenios()}`);
console.log(`Disenios Tradicional Americano: ${estudio.filtrarPorEstilo("Tradicional Americano").length}`);
console.log(`Valor del catalogo completo: $${estudio.calcularIngresoPotencial()} USD`);