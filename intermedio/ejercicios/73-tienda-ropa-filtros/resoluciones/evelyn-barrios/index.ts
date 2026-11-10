export {};

type TallaPrenda = "XS" | "S" | "M" | "L" | "XL";
type CategoriaRopa = "Hoodies" | "Camisetas" | "Pantalones" | "Accesorios";

interface PrendaRopaDTO {
  readonly sku: string;
  readonly nombre: string;
  readonly categoria: CategoriaRopa;
  readonly tallasDisponibles: readonly TallaPrenda[];
  readonly precioEur: number;
  readonly enOferta: boolean;
}

interface CriteriosBusquedaTiendaDTO {
  readonly categoria?: CategoriaRopa;
  readonly tallaRequerida?: TallaPrenda;
  readonly precioMaximo?: number;
  readonly soloOfertas?: boolean;
}

class CatalogoTiendaRopa {
  private inventario: PrendaRopaDTO[] = [];

  cargarInventario(items: readonly PrendaRopaDTO[]): void {
    this.inventario = [...items];
  }

  filtrarPrendas(criterios: CriteriosBusquedaTiendaDTO): readonly PrendaRopaDTO[] {
    return this.inventario.filter((item) => {
      if (criterios.categoria && item.categoria !== criterios.categoria) return false;
      if (criterios.tallaRequerida && !item.tallasDisponibles.includes(criterios.tallaRequerida)) return false;
      if (criterios.precioMaximo && item.precioEur > criterios.precioMaximo) return false;
      if (criterios.soloOfertas && !item.enOferta) return false;
      return true;
    });
  }
}

function main() {
  console.log("=== TIENDA DE ROPA CON FILTROS (ARQUITECTURA DTO) ===");
  const catalogo = new CatalogoTiendaRopa();

  const prendas: PrendaRopaDTO[] = [
    { sku: "HOD-01", nombre: "Oversized Cyber Hoodie", categoria: "Hoodies", tallasDisponibles: ["M", "L", "XL"], precioEur: 65, enOferta: true },
    { sku: "TSH-02", nombre: "Graphic Street Tee", categoria: "Camisetas", tallasDisponibles: ["S", "M", "L"], precioEur: 28, enOferta: false },
    { sku: "PNT-03", nombre: "Cargo Pants Techwear", categoria: "Pantalones", tallasDisponibles: ["M", "L"], precioEur: 75, enOferta: true },
    { sku: "CAP-04", nombre: "Minimalist Cap", categoria: "Accesorios", tallasDisponibles: ["M"], precioEur: 22, enOferta: false },
  ];

  catalogo.cargarInventario(prendas);

  const filtroL = catalogo.filtrarPrendas({ tallaRequerida: "L", soloOfertas: true });
  console.log(`Prendas encontradas en oferta talla L: ${filtroL.length}`);
  filtroL.forEach((p) => {
    console.log(`- [${p.sku}] ${p.nombre} (${p.categoria}) - €${p.precioEur} (Oferta: ${p.enOferta})`);
  });
}

main();
