export {};

// Ejercicio 5: Type Alias
// Contexto: Catalogo de ropa
// Resolucion: Dulce Morales

// Union literals: solo se aceptan estos valores
type Talla = "XS" | "S" | "M" | "L" | "XL";
type CategoriaRopa = "camiseta" | "pantalon" | "chaqueta" | "vestido";

// Alias reutilizables para no repetir estructuras
type Porcentaje = number; // de 0 a 100
type Precio = {
  base: number;
  descuento: Porcentaje;
};

// Combinacion de alias para formar el producto
type ProductoRopa = {
  codigo: string;
  nombre: string;
  categoria: CategoriaRopa;
  tallasDisponibles: Talla[];
  precio: Precio;
};

const catalogo: ProductoRopa[] = [
  {
    codigo: "CH-001",
    nombre: "Chaqueta de mezclilla",
    categoria: "chaqueta",
    tallasDisponibles: ["S", "M", "L"],
    precio: { base: 450, descuento: 20 },
  },
  {
    codigo: "CA-014",
    nombre: "Camiseta oversize",
    categoria: "camiseta",
    tallasDisponibles: ["M", "L", "XL"],
    precio: { base: 180, descuento: 0 },
  },
  {
    codigo: "VE-007",
    nombre: "Vestido de lino",
    categoria: "vestido",
    tallasDisponibles: ["XS", "S", "M"],
    precio: { base: 620, descuento: 35 },
  },
];

// Ejemplo de que la talla esta restringida (descomenta para ver el error):
// const tallaInvalida: Talla = "XXL";

// Reto extra: precio final con descuento
function calcularPrecioFinal(precio: Precio): number {
  const montoDescuento: number = (precio.base * precio.descuento) / 100;
  return precio.base - montoDescuento;
}

function mostrarProducto(producto: ProductoRopa): void {
  const precioFinal: number = calcularPrecioFinal(producto.precio);
  console.log(`[${producto.codigo}] ${producto.nombre}`);
  console.log(`  Categoria: ${producto.categoria}`);
  console.log(`  Tallas:    ${producto.tallasDisponibles.join(", ")}`);
  console.log(`  Precio:    $${producto.precio.base.toFixed(2)}`);
  console.log(`  Descuento: ${producto.precio.descuento}%`);
  console.log(`  Final:     $${precioFinal.toFixed(2)}`);
}

console.log("=========== CATALOGO DE ROPA ===========");
catalogo.forEach((producto: ProductoRopa): void => {
  mostrarProducto(producto);
});
console.log("========================================");
