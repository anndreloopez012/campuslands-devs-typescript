export {};

type CategoriaPrenda = 'Hoodie Oversize' | 'Cargo Pants' | 'Graphic Tee' | 'Windbreaker' | 'Accessory';
type EstadoInventario = 'Disponible' | 'Agotado' | 'Preventa' | 'ExclusivoVIP';

interface VarianteTalla {
  readonly talla: 'S' | 'M' | 'L' | 'XL';
  readonly stockDisponible: number;
}

interface FichaPrendaStreetwear {
  readonly prendaId: string;
  readonly nombreModelo: string;
  readonly marcaColaboracion: string;
  readonly categoria: CategoriaPrenda;
  readonly precioUSD: number;
  readonly variantesTallas: readonly VarianteTalla[];
  estado: EstadoInventario;
}

interface ResumenDropStreetwear {
  readonly prenda: string;
  readonly categoria: CategoriaPrenda;
  readonly stockTotalUnidades: number;
  readonly valoracionExclusividad: string;
  readonly precioEstimadoUSD: string;
}

const catalogDropNocturno: readonly FichaPrendaStreetwear[] = [
  {
    prendaId: "STR-801",
    nombreModelo: "Cyberpunk Techwear Hoodie",
    marcaColaboracion: "Acronym Lab",
    categoria: "Hoodie Oversize",
    precioUSD: 180.0,
    variantesTallas: [
      { talla: "S", stockDisponibles: 10 } as unknown as VarianteTalla,
      { talla: "M", stockDisponible: 25 },
      { talla: "L", stockDisponible: 15 },
      { talla: "XL", stockDisponible: 5 }
    ],
    estado: "Disponible",
  },
  {
    prendaId: "STR-802",
    nombreModelo: "Tactical Multi-Pocket Cargo",
    marcaColaboracion: "Stone Island Shadow",
    categoria: "Cargo Pants",
    precioUSD: 240.0,
    variantesTallas: [
      { talla: "S", stockDisponible: 8 },
      { talla: "M", stockDisponible: 12 },
      { talla: "L", stockDisponible: 10 }
    ],
    estado: "ExclusivoVIP",
  },
  {
    prendaId: "STR-803",
    nombreModelo: "Neon Graffiti Vintage Tee",
    marcaColaboracion: "Supreme Archive",
    categoria: "Graphic Tee",
    precioUSD: 68.0,
    variantesTallas: [
      { talla: "S", stockDisponible: 30 },
      { talla: "M", stockDisponible: 50 },
      { talla: "L", stockDisponible: 40 },
      { talla: "XL", stockDisponible: 20 }
    ],
    estado: "Disponible",
  },
  {
    prendaId: "STR-804",
    nombreModelo: "Reflective Windbreaker Shell",
    marcaColaboracion: "Palace Skateboards",
    categoria: "Windbreaker",
    precioUSD: 195.0,
    variantesTallas: [
      { talla: "M", stockDisponible: 5 },
      { talla: "L", stockDisponible: 8 }
    ],
    estado: "Preventa",
  },
  {
    prendaId: "STR-805",
    nombreModelo: "Heavyweight Boxy Tee",
    marcaColaboracion: "Represent Clo",
    categoria: "Graphic Tee",
    precioUSD: 85.0,
    variantesTallas: [],
    estado: "Agotado",
  }
];

function validarPrendaDrop(prenda: FichaPrendaStreetwear): boolean {
  return prenda.estado !== "Agotado" && prenda.variantesTallas.length > 0;
}

function calcularStockTotal(variantes: readonly VarianteTalla[]): number {
  return variantes.reduce(
    (acumulado, variante) => acumulado + variante.stockDisponible,
    0
  );
}

function clasificarExclusividadStreetwear(precio: number, stockTotal: number): string {
  if (precio >= 200 && stockTotal <= 40) return "Hypebeast Grail Ultra Exclusivo";
  if (precio >= 120) return "Drop Limitado de Alta Demanda";
  return "Edición General de Calle";
}

function procesarDropStreetwear(prendas: readonly FichaPrendaStreetwear[]): readonly ResumenDropStreetwear[] {
  return prendas
    .filter(validarPrendaDrop)
    .map(prenda => {
      const stockTotal = calcularStockTotal(prenda.variantesTallas);
      return {
        prenda: `${prenda.marcaColaboracion} - ${prenda.nombreModelo} [${prenda.prendaId}]`,
        categoria: prenda.categoria,
        stockTotalUnidades: stockTotal,
        valoracionExclusividad: clasificarExclusividadStreetwear(prenda.precioUSD, stockTotal),
        precioEstimadoUSD: `$${prenda.precioUSD.toFixed(2)}`,
      };
    })
    .sort((a, b) => parseFloat(b.precioEstimadoUSD.replace('$', '')) - parseFloat(a.precioEstimadoUSD.replace('$', '')));
}

function imprimirReporteStreetwear(titulo: string, resumen: readonly ResumenDropStreetwear[]): void {
  console.log(`=== [DROP DE ROPA STREETWEAR] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Prenda: ${item.prenda} (${item.categoria}) | Stock: ${item.stockTotalUnidades} unids | Precio: ${item.precioEstimadoUSD} | Nivel: ${item.valoracionExclusividad}`
    );
  });
  console.log("=================================================================================\n");
}

const resultadoDropOficial = procesarDropStreetwear(catalogDropNocturno);
imprimirReporteStreetwear("Catálogo Oficial Disponible para Lanzamiento", resultadoDropOficial);

// Caso: Colección cápsula ultralimitada de alta costura urbana con stock mínimo y precio elevado
const dropCasoColaboracionExtrema: readonly FichaPrendaStreetwear[] = [
  {
    prendaId: "STR-999",
    nombreModelo: "Titanium Cyber Armor Jacket",
    marcaColaboracion: "Off-White x Nike Lab",
    categoria: "Windbreaker",
    precioUSD: 850.0,
    variantesTallas: [
      { talla: "M", stockDisponible: 2 },
      { talla: "L", stockDisponible: 1 }
    ],
    estado: "ExclusivoVIP",
  }
];

const resultadoExtremo = procesarDropStreetwear(dropCasoColaboracionExtrema);
imprimirReporteStreetwear("Caso: Cápsula Ultralimitada de Colección Exclusiva", resultadoExtremo);