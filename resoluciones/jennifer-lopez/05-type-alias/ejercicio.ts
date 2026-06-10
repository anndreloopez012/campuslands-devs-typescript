export {};

// Ejercicio 5: Type Alias
type Talla = "XS"|"S"|"M"|"L"|"XL";
type Categoria = "Camisa"|"Pantalon"|"Chaqueta"|"Zapatos";
type ProductoRopa = {
    nombre: string;
    talla: Talla;
    categoria: Categoria;
    precio: number;
    descuento: number;
};
const prendaDestacada: ProductoRopa = {
    nombre: "Chaqueta Storm",
    talla: "L",
    categoria: "Chaqueta",
    precio: 450,
    descuento: 15
};
const precioFinal: number =
    prendaDestacada.precio -
    (prendaDestacada.precio * prendaDestacada.descuento) / 100;
console.log("Producto:", prendaDestacada.nombre);
console.log("Talla:", prendaDestacada.talla);
console.log("Categoria:", prendaDestacada.categoria);
console.log("Precio Final:", precioFinal);
