export {};

// Ejercicio 5: Type Alias
// Contexto: Catalogo de ropa

// TODO: define alias para Talla, CategoriaRopa y ProductoRopa.

type Talla = "S" | "M" | "L" | "XL";
type CategoriaRopa = "Camisa" | "Pantalon" | "Chaqueta" | "Vestido";
type ProductoRopa = {
  nombre: string;
  talla: Talla;
  categoria: CategoriaRopa;
  precio: number;
};

const talla: Talla = "M";
const categoria: CategoriaRopa = "Camisa";
const producto: ProductoRopa = {
  nombre: "Camisa de algodón",
  talla: talla,
  categoria: categoria,
  precio: 29.99,
};

console.log("Producto de ropa:");
for (const i in producto) {
  console.log(`${i}: ${producto[i as keyof ProductoRopa]}`);
}
