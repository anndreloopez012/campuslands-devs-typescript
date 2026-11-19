export {};

// Ejercicio 10: Generics
// Contexto: Inventario de videojuegos
// Resolucion: Dulce Morales

// Lo minimo que necesita un elemento para poder buscarse por id
type ConId = {
  id: number;
};

type Videojuego = ConId & {
  titulo: string;
  plataforma: "PC" | "PlayStation" | "Xbox" | "Switch";
  precio: number;
  stock: number;
};

type Periferico = ConId & {
  nombre: string;
  tipo: "control" | "audifonos" | "teclado" | "mouse";
  inalambrico: boolean;
  precio: number;
};

// Funcion generica: T puede ser cualquier tipo, siempre que tenga `id: number`.
// Retorna T (con todas sus propiedades) o undefined si no lo encuentra. Nunca `any`.
function buscarPorId<T extends ConId>(inventario: T[], id: number): T | undefined {
  return inventario.find((elemento: T): boolean => elemento.id === id);
}

const videojuegos: Videojuego[] = [
  { id: 101, titulo: "Elden Ring", plataforma: "PC", precio: 59.99, stock: 12 },
  { id: 102, titulo: "Zelda: Tears of the Kingdom", plataforma: "Switch", precio: 69.99, stock: 5 },
  { id: 103, titulo: "Halo Infinite", plataforma: "Xbox", precio: 39.99, stock: 0 },
];

const perifericos: Periferico[] = [
  { id: 201, nombre: "DualSense", tipo: "control", inalambrico: true, precio: 69.99 },
  { id: 202, nombre: "HyperX Cloud II", tipo: "audifonos", inalambrico: false, precio: 79.99 },
  { id: 203, nombre: "Logitech G Pro", tipo: "mouse", inalambrico: true, precio: 129.99 },
];

// Busqueda de un videojuego: TypeScript sabe que el resultado es Videojuego | undefined
const juego: Videojuego | undefined = buscarPorId(videojuegos, 102);

console.log("=========== BUSQUEDA DE VIDEOJUEGO ===========");
if (juego !== undefined) {
  // Aqui TypeScript ya sabe que `juego` es Videojuego: autocompleta titulo, plataforma, stock...
  const disponibilidad: string = juego.stock > 0 ? `${juego.stock} en stock` : "agotado";
  console.log(`#${juego.id} ${juego.titulo} (${juego.plataforma}) - $${juego.precio} - ${disponibilidad}`);
} else {
  console.log("Videojuego no encontrado");
}

// Caso no encontrado: retorna undefined
const juegoInexistente: Videojuego | undefined = buscarPorId(videojuegos, 999);
console.log(`Buscar id 999: ${juegoInexistente === undefined ? "no encontrado (undefined)" : juegoInexistente.titulo}`);

// Reto extra: la MISMA funcion sirve para perifericos
const periferico: Periferico | undefined = buscarPorId(perifericos, 203);

console.log("\n=========== BUSQUEDA DE PERIFERICO ===========");
if (periferico !== undefined) {
  // Aqui TypeScript sabe que es Periferico: tiene `nombre`, `tipo` e `inalambrico`
  const conexion: string = periferico.inalambrico ? "inalambrico" : "con cable";
  console.log(`#${periferico.id} ${periferico.nombre} (${periferico.tipo}, ${conexion}) - $${periferico.precio}`);
} else {
  console.log("Periferico no encontrado");
}

// Esto marcaria error: un Periferico no tiene `titulo`
// console.log(periferico?.titulo);
