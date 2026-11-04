export {};

type Talla = "S" | "M" | "L" | "XL";

interface Stock {
  readonly talla: Talla;
  readonly unidades: number;
}

interface Prenda {
  readonly id: number;
  readonly nombre: string;
  readonly marca: string;
  readonly precio: number;
  readonly descuento: number;
  readonly stock: readonly Stock[];
}

interface PrendaDrop {
  readonly nombre: string;
  readonly precioFinal: number;
  readonly unidadesTotales: number;
  readonly agotada: boolean;
}

const drop: readonly Prenda[] = [
  { id: 1, nombre: "Hoodie Oversize", marca: "Urbano", precio: 60, descuento: 0.1, stock: [{ talla: "M", unidades: 5 }, { talla: "L", unidades: 3 }] },
  { id: 2, nombre: "Gorra Snapback", marca: "Urbano", precio: 25, descuento: 0, stock: [{ talla: "M", unidades: 10 }] },
  { id: 3, nombre: "Jogger Cargo", marca: "Calle", precio: 48, descuento: 0.25, stock: [{ talla: "S", unidades: 0 }, { talla: "M", unidades: 0 }] },
  { id: 4, nombre: "Camiseta Grafica", marca: "Calle", precio: 30, descuento: 0.05, stock: [{ talla: "S", unidades: 7 }, { talla: "XL", unidades: 2 }] },
  { id: 5, nombre: "Chaqueta Rota", marca: "Calle", precio: -10, descuento: 0, stock: [{ talla: "L", unidades: 1 }] },
  { id: 6, nombre: "Medias", marca: "", precio: 8, descuento: 1.5, stock: [{ talla: "M", unidades: 4 }] },
];

const esPrendaValida = (prenda: Prenda): boolean =>
  prenda.nombre.trim().length > 0 &&
  prenda.marca.trim().length > 0 &&
  prenda.precio > 0 &&
  prenda.descuento >= 0 &&
  prenda.descuento <= 1 &&
  prenda.stock.every((s) => s.unidades >= 0);

const prepararPrenda = (prenda: Prenda): PrendaDrop => {
  const unidadesTotales = prenda.stock.reduce((acc, s) => acc + s.unidades, 0);

  return {
    nombre: prenda.nombre,
    precioFinal: Math.round(prenda.precio * (1 - prenda.descuento) * 100) / 100,
    unidadesTotales,
    agotada: unidadesTotales === 0,
  };
};

const validas = drop.filter(esPrendaValida);
const invalidas = drop.filter((prenda) => !esPrendaValida(prenda));
const catalogo = validas.map(prepararPrenda);
const disponibles = catalogo.filter((prenda) => !prenda.agotada);
const valorInventario = disponibles.reduce(
  (acc, prenda) => acc + prenda.precioFinal * prenda.unidadesTotales,
  0,
);

console.log("Ejercicio 18: Drop de ropa streetwear");
console.log(`Prendas validas: ${validas.length} | invalidas: ${invalidas.length}`);
invalidas.forEach((prenda) =>
  console.log(`  - #${prenda.id} "${prenda.nombre}" tiene datos invalidos`),
);
catalogo.forEach((prenda) =>
  console.log(
    `  ${prenda.nombre}: $${prenda.precioFinal} - ${prenda.agotada ? "AGOTADA" : `${prenda.unidadesTotales} unidad(es)`}`,
  ),
);
console.log(
  `Valor del inventario disponible: $${Math.round(valorInventario * 100) / 100}`,
);
