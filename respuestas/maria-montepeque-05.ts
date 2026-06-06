export {};

// Ejercicio 5: Type Alias

// 1. Alias con union literals: solo se permiten estos valores exactos.
type Talla = "XS" | "S" | "M" | "L" | "XL";
type CategoriaRopa = "camiseta" | "chaqueta" | "pantalon" | "tenis";

// 2. Alias de objeto que REUTILIZA los alias anteriores.
type ProductoRopa = {
  id: string;
  nombre: string;
  categoria: CategoriaRopa;
  talla: Talla;
  precio: number;
  descuentoPorcentaje: number;
};

// 3. Funcion reutilizable para el reto extra
function calcularPrecioFinal(producto: ProductoRopa): number {
  return producto.precio * (1 - producto.descuentoPorcentaje / 100);
}

// 4. Creamos un producto valido
const producto: ProductoRopa = {
  id: "ROP-1001",
  nombre: "Chaqueta urbana Campus",
  categoria: "chaqueta",
  talla: "M",
  precio: 180000,
  descuentoPorcentaje: 15,
};

// 5. Calculamos e imprimimos el resultado esperado.
const precioFinal: number = calcularPrecioFinal(producto);

console.log("Producto:", producto);
console.log(`Categoria: ${producto.categoria}`);
console.log(`Talla: ${producto.talla}`);
console.log(`Precio final: $${precioFinal.toLocaleString("es-CO")}`);
