
//alias 
type tallas =  "XS" | "S" | "M" | "L" | "XL"

type categorias = "camiseta" | "chaqueta" | "pantalon" | "tenis";

type producto_ropa = { 
    nombre: string; 
    color: string; 
    talla: tallas; 
    categoria: categorias; 
    precio: number; 
    descuento: number;
}

const producto: producto_ropa = {
    nombre: "Chaqueta de Spiderman ",
    color: "blanco con negro",
    talla: "L",
    categoria: "chaqueta",
    precio: 120, 
    descuento: 10
}

let descuento_producto : number = producto.precio * (producto.descuento / 100); 
let precio_final : number = producto.precio - descuento_producto;

console.log(producto)
console.log("El precio de la chaqueta con el descuento es de:" + precio_final);


