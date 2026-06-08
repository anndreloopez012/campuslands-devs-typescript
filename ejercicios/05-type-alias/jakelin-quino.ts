export {};

// Ejercicio 5: Type Alias
// Contexto: Catalogo de ropa

// TODO: define alias para Talla, CategoriaRopa y ProductoRopa.
console.log("----------- Ejercicio 5: Type Alias -----------");

type Talla = "XS" | "S" | "M" | "L" | "XL";
type CategoriaRopa = "playeras" | "blusas" | "pnatalones";

type ProductoRopa = {
  codigo: string;
  nombre: string;
  categoria: CategoriaRopa;
  talla: Talla;
  precio: number;
};

const producto: ProductoRopa = {
  codigo: "GT-001",
  nombre: "Playera de algodón",
  categoria: "playeras",
  talla: "S",
  precio: 40,
};

const precioFinal: number = producto.precio * (1 + 0.12); //IVA del 12%
console.log(producto);
console.log(`Precio final: Q${precioFinal.toFixed(2)}`);
