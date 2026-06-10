export {};

type Talla = "S" | "M" | "L" | "XL";
type CategoriaRopa = "Deportiva" | "Casual" | "Formal";

type ProductoRopa = {
  readonly id: string;
  nombre: string;
  talla: Talla;
  categoria: CategoriaRopa;
  precio: number;
};

const prendaNueva: ProductoRopa = {
  id: "ROP-500",
  nombre: "Camiseta Tech",
  talla: "M",
  categoria: "Deportiva",
  precio: 29.99,
};

console.log(`Producto: ${prendaNueva.nombre} - Precio: $${prendaNueva.precio}`);
