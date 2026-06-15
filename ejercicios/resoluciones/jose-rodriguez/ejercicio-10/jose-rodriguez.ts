export {};


// 1. ESTRUCTURAS DE DATOS (CONTRATOS)


// Interfaz base: Cualquier objeto del inventario DEBE tener un 'id' numérico
interface ElementoInventario {
  id: number;
}

// Estructura para el Reto Extra: Videojuegos
interface Videojuego extends ElementoInventario {
  titulo: string;
  plataforma: string;
  precio: number;
}

// Estructura para el Reto Extra: Periféricos
interface Periferico extends ElementoInventario {
  nombre: string;
  marca: string;
  tipoConexion: "USB" | "Inalámbrico";
}


// 2. FUNCIÓN GENÉRICA DE BÚSQUEDA


/**
 * Busca un elemento en un arreglo por su ID.
 * Usamos <T extends ElementoInventario> para restringir que cualquier tipo 'T'
 * que usemos obligatoriamente debe tener la propiedad 'id'.
 */
function buscarPorId<T extends ElementoInventario>(
  lista: T[],
  idBuscar: number,
): T | undefined {
  return lista.find((elemento) => elemento.id === idBuscar);
}


// 3. DATOS DE PRUEBA (INVENTARIOS)


const inventarioVideojuegos: Videojuego[] = [
  { id: 101, titulo: "Elden Ring", plataforma: "PS5", precio: 59.99 },
  {
    id: 102,
    titulo: "Zelda: Tears of the Kingdom",
    plataforma: "Nintendo Switch",
    precio: 69.99,
  },
  { id: 103, titulo: "Cyberpunk 2077", plataforma: "PC", precio: 39.99 },
];

const inventarioPerifericos: Periferico[] = [
  {
    id: 501,
    nombre: "Mouse G Pro",
    marca: "Logitech",
    tipoConexion: "Inalámbrico",
  },
  {
    id: 502,
    nombre: "Teclado Apex 7",
    marca: "SteelSeries",
    tipoConexion: "USB",
  },
];

//4. EJECUCION Y VALIDACION DE TIPOS

console.log("==================================================");
console.log("      PROBANDO BÚSQUEDA GENÉRICA             ");
console.log("==================================================");

// --- BÚSQUEDA DE VIDEOJUEGO ---
// TypeScript deduce automáticamente que juegoEncontrado es de tipo 'Videojuego | undefined'
const juegoEncontrado = buscarPorId(inventarioVideojuegos, 102);

if (juegoEncontrado) {
  console.log("Videojuego Encontrado:");
  // ¡Conservamos las propiedades específicas del videojuego con autocompletado!
  console.log(`- Título: ${juegoEncontrado.titulo}`);
  console.log(`- Plataforma: ${juegoEncontrado.plataforma}`);
  console.log(`- Precio: $${juegoEncontrado.precio} USD`);
} else {
  console.log("Videojuego no encontrado.");
}

console.log("--------------------------------------------------");

// --- BÚSQUEDA DE PERIFÉRICO ---
// TypeScript deduce automáticamente que accesorioEncontrado es de tipo 'Periferico | undefined'
const accesorioEncontrado = buscarPorId(inventarioPerifericos, 501);

if (accesorioEncontrado) {
  console.log("Periférico Encontrado:");
  // ¡Conservamos las propiedades específicas del periférico!
  console.log(`- Nombre: ${accesorioEncontrado.nombre}`);
  console.log(`- Marca: ${accesorioEncontrado.marca}`);
  console.log(`- Conexión: ${accesorioEncontrado.tipoConexion}`);
} else {
  console.log(" Periférico no encontrado.");
}

console.log("--------------------------------------------------");

// --- CASO NO ENCONTRADO ---
const juegoFantasma = buscarPorId(inventarioVideojuegos, 999);
console.log(` Buscando ID 999: ${juegoFantasma}`); // Imprimirá 'undefined'
console.log("==================================================");
