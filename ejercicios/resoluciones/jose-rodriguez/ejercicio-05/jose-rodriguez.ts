export {};


// 1. DEFINICIÓN DE ALIAS DE TIPOS (TYPES)


// Union Literals para restringir los valores exactos permitidos
type Talla = "S" | "M" | "L" | "XL";
type Categoria = "Caballero" | "Dama" | "Niños" | "Unisex";

// Combinamos los alias anteriores dentro de la estructura del objeto Producto
type ProductoRopa = {
    id: number;
    nombre: string;
    marca: string;
    categoria: Categoria; // Reutiliza el alias Categoria
    talla: Talla;         // Reutiliza el alias Talla
    precioOriginal: number;
    descuento: number;    // Porcentaje de descuento (ej. 0.20 para 20%)
};


// 2. CREACIÓN DEL OBJETO (PRODUCTO)


const nuevoProducto: ProductoRopa = {
    id: 101,
    nombre: "Chaqueta Cortaviento Impermeable",
    marca: "GearX",
    categoria: "Unisex", // Válido según el alias Categoria
    talla: "M",          // Válido según el alias Talla
    precioOriginal: 89.99,
    descuento: 0.15      // 15% de descuento
};


// 3. RETO EXTRA: CÁLCULO DEL PRECIO FINAL


/**
 * Calcula el precio final aplicando el porcentaje de descuento
 */
function calcularPrecioFinal(producto: ProductoRopa): number {
    const rebaja = producto.precioOriginal * producto.descuento;
    return producto.precioOriginal - rebaja;
}

const precioFinal = calcularPrecioFinal(nuevoProducto);


// 4. RESULTADO ESPERADO (IMPRESIÓN)


console.log("========================================");
console.log("       👕 DETALLE DE PRODUCTO           ");
console.log("========================================");
console.log(`Producto    : ${nuevoProducto.nombre}`);
console.log(`Marca       : ${nuevoProducto.marca}`);
console.log(`Categoría   : ${nuevoProducto.categoria}`);
console.log(`Talla       : ${nuevoProducto.talla}`);
console.log(`Precio Base : $${nuevoProducto.precioOriginal.toFixed(2)} USD`);
console.log(`Descuento   : ${nuevoProducto.descuento * 100}%`);
console.log("----------------------------------------");
console.log(`💰 PRECIO FINAL : $${precioFinal.toFixed(2)} USD`);
console.log("========================================");