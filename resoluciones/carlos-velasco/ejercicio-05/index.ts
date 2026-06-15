export {};

// Ejercicio 5: Type Alias
// Contexto: Catalogo de ropa

// TODO: define alias para Talla, CategoriaRopa y ProductoRopa.

type CategoriaRopa = "zapatos" | "pantalon" | "camisa" | "vestido" | "traje";
type Talla = "S" | "M" | "L" | "XL";

type CatalogoRopa = {
  tallas: Talla[];
  categoria: CategoriaRopa;
  producto: string;
  precio: number;
  descuento: number;
};

const productos_vendidos: CatalogoRopa =
{
  producto: "Zapatos de cuero",
  categoria: "zapatos",
  tallas: ["M", "L"],
  precio: 80.50,
  descuento: 0.10
};
const totalPrecios = productos_vendidos.precio - (productos_vendidos.precio * productos_vendidos.descuento)

console.log(`
    datos del producto:
    ${productos_vendidos}
    El total del catálogo es: ${totalPrecios}`);