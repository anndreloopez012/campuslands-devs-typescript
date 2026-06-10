export {};

// Ejercicio 5: Type Alias
// Contexto: Catalogo de ropa

// TODO: define alias para Talla, CategoriaRopa y ProductoRopa.

type Talla = "XS" | "S" | "M" | "L" | "XL" | "XXL";
type CategoriaRopa = "Hombre" | "Mujer" | "Niño" | "Niña" | "Unisex";
type ProductoRopa = {
  id: number;
  nombre: string;
  talla: Talla;
  categoria: CategoriaRopa;
  precioBase: number;
  descuento?: number;
};
const catalogo: ProductoRopa[] = [
  {
    id: 1,
    nombre: "Chaqueta de Mezclilla",
    categoria: "Unisex",
    talla: "M",
    precioBase: 60,
    descuento: 15, // 15% de descuento
  },
  {
    id: 2,
    nombre: "Vestido de Verano",
    categoria: "Mujer",
    talla: "S",
    precioBase: 45,
    // Este no tiene descuento, y es válido porque es opcional
  },
  {
    id: 3,
    nombre: "Camiseta Deportiva",
    categoria: "Hombre",
    talla: "XL",
    precioBase: 30,
    descuento: 10, // 10% de descuento
  },
  {
    id: 4,
    nombre: "Mameluco para Bebé",
    categoria: "Niño",
    talla: "XS",
    precioBase: 30,
    descuento: 15, // 15% de descuento
  },
];

const reportecatalogo = catalogo.map((producto) => {
  const porcentajeDescuento = producto.descuento ? producto.descuento : 0;
  const precioFinal = producto.precioBase * (1 - porcentajeDescuento / 100);
  return `Producto: ${producto.nombre} 
     Categoría: ${producto.categoria} | Talla: ${producto.talla}
     Precio Base: $${producto.precioBase} | Descuento: ${porcentajeDescuento}%
     Precio Final: $${precioFinal.toFixed(2)}`;
});

console.log("Reporte del Catálogo de Ropa");
console.log(reportecatalogo.join("\n\n"));
