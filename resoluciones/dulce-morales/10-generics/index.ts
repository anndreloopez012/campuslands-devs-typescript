export {};

// Ejercicio 10: Generics
// Contexto: Inventario de videojuegos

// Interfaz base para asegurar que los elementos tengan un ID
interface ElementoInventario {
  id: number;
}

// Interfaces específicas para el Reto Extra
interface Videojuego extends ElementoInventario {
  titulo: string;
  plataforma: string;
}

interface Periferico extends ElementoInventario {
  nombre: string;
  tipo: string;
}

// Función genérica restringida con 'extends' para conservar tipado estricto
function buscarPorId<T extends ElementoInventario>(
  inventario: T[],
  id: number,
): T | undefined {
  return inventario.find((item) => item.id === id);
}

// Inventarios de prueba
const inventarioJuegos: Videojuego[] = [
  { id: 1, titulo: "The Legend of Zelda", plataforma: "Nintendo Switch" },
  { id: 2, titulo: "Elden Ring", plataforma: "PC" },
];

const inventarioPerifericos: Periferico[] = [
  { id: 10, nombre: "Mouse Gamer", tipo: "Óptico" },
  { id: 20, nombre: "Teclado Mecánico", tipo: "RGB" },
];

// Ejecución con Videojuegos
const juegoEncontrado = buscarPorId(inventarioJuegos, 2);
if (juegoEncontrado) {
  // TypeScript conserva las propiedades específicas de Videojuego
  console.log(
    `Juego Encontrado: ${juegoEncontrado.titulo} (${juegoEncontrado.plataforma})`,
  );
}

// Ejecución con Periféricos (Reto Extra)
const perifericoEncontrado = buscarPorId(inventarioPerifericos, 10);
if (perifericoEncontrado) {
  // TypeScript conserva las propiedades específicas de Periferico
  console.log(
    `Periférico Encontrado: ${perifericoEncontrado.nombre} - Tipo: ${perifericoEncontrado.tipo}`,
  );
}
