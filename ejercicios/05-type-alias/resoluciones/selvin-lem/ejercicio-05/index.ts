export {};

// Ejercicio 5: Type Alias
// Contexto: Catalogo de ropa

// TODO: define alias para Talla, CategoriaRopa y ProductoRopa.

type dimensionPrenda = 38 | 40 | 42 | 44 | 46;
type seccionTienda = "Calzado" | "Formal" | "Deportivo" | "Accesorios";

type articuloInventario = {
    codigoSku: string;
    descripcion: string;
    seccion: seccionTienda;
    tallaAsignada: dimensionPrenda;
    precioBase: number;
    rebajaFija: number;
};

const prendaSeleccionada: articuloInventario = {
    codigoSku: "SKU-9942-X",
    descripcion: "Ropas de vestir para caballero",
    seccion: "Formal",
    tallaAsignada: 42,
    precioBase: 750,
    rebajaFija: 85   
};

const costoFinal: number = prendaSeleccionada.precioBase - prendaSeleccionada.rebajaFija;

console.log("=====Control de Inventario: Detalles del Producto Seleccionado=====");
console.log(`Identificador Único:  ${prendaSeleccionada.codigoSku}`);
console.log(`Descripción:          ${prendaSeleccionada.descripcion}`);
console.log(`Departamento/Sección: ${prendaSeleccionada.seccion}`);
console.log(`Medida / Talla:       Eur ${prendaSeleccionada.tallaAsignada}`);
console.log("--------------------------------------------------");
console.log(`Precio de Lista:      Q ${prendaSeleccionada.precioBase}.00`);
console.log(`Descuento Aplicado:  -Q ${prendaSeleccionada.rebajaFija}.00`);
console.log(`Precio Final:  Q ${costoFinal}.00`);
console.log("======================================================================");