export {};

// Ejercicio 05: Type Alias
// Contexto: Catálogo de Ropa Streetwear

type CategoriaPrenda = "hoodies" | "camisetas" | "pantalones" | "calzado" | "accesorios";
type Talla = "XS" | "S" | "M" | "L" | "XL";
type Moneda = "USD" | "EUR";

type Prenda = {
  readonly sku: string;
  nombre: string;
  categoria: CategoriaPrenda;
  talla: Talla;
  precio: number;
  moneda: Moneda;
  enStock: boolean;
  descuentoPorcentaje?: number;
};

const inventarioRopa: Prenda[] = [
  {
    sku: "ST-HD-001",
    nombre: "Cyberpunk Oversized Hoodie",
    categoria: "hoodies",
    talla: "L",
    precio: 75.0,
    moneda: "USD",
    enStock: true,
    descuentoPorcentaje: 15
  },
  {
    sku: "ST-TS-002",
    nombre: "Minimalist Acid Wash Tee",
    categoria: "camisetas",
    talla: "M",
    precio: 35.0,
    moneda: "USD",
    enStock: true
  },
  {
    sku: "ST-CR-003",
    nombre: "Cargo Techwear Pant",
    categoria: "pantalones",
    talla: "M",
    precio: 90.0,
    moneda: "USD",
    enStock: false
  }
];

function calcularPrecioFinal(prenda: Prenda): number {
  if (!prenda.descuentoPorcentaje) return prenda.precio;
  const ahorro = (prenda.precio * prenda.descuentoPorcentaje) / 100;
  return Number((prenda.precio - ahorro).toFixed(2));
}

console.log("=== CATÁLOGO STREETWEAR ===");
inventarioRopa.forEach((item) => {
  const precioFinal = calcularPrecioFinal(item);
  const estado = item.enStock ? "DISPONIBLE" : "AGOTADO";
  const promo = item.descuentoPorcentaje ? `(${item.descuentoPorcentaje}% OFF -> $${precioFinal})` : "";
  console.log(`[${item.sku}] ${item.nombre} | Talla: ${item.talla} | $${item.precio} ${promo} | ${estado}`);
});
