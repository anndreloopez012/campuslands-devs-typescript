export {};

type Talla = "XS" | "S" | "M" | "L" | "XL";
type CategoriaRopa = "camiseta" | "chaqueta" | "pantalon" | "tenis";

type ProductoRopa = {
  id: string;
  nombre: string;
  categoria: CategoriaRopa;
  talla: Talla;
  precio: number;
  descuentoPorcentaje: number;
};

const producto: ProductoRopa = {
  id: "ROP-1001",
  nombre: "Chaqueta urbana Campus",
  categoria: "chaqueta",
  talla: "M",
  precio: 180000,
  descuentoPorcentaje: 15,
};

const precioFinal: number = producto.precio * (1 - producto.descuentoPorcentaje / 100);

console.log(producto);
console.log(`Precio final: $${precioFinal.toLocaleString("es-CO")}`);
