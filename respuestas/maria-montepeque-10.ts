export {};

// Ejercicio 10: Generics

// 1) Tipo base: cualquier cosa que tenga "id" se puede buscar.
type ConId = {
  id: string;
};

// 2) Tipos concretos del inventario. Ambos cumplen con ConId
type Videojuego = ConId & {
  titulo: string;
  plataforma: "PC" | "PlayStation" | "Xbox" | "Nintendo";
  stock: number;
};

type Periferico = ConId & {
  nombre: string;
  tipo: "mouse" | "teclado" | "control";
  precio: number;
};

// 3) Función GENÉRICA — el corazón del ejercicio.
function buscarPorId<T extends ConId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

// 4) Datos de prueba del inventario.
const videojuegos: Videojuego[] = [
  { id: "VG-01", titulo: "Arena Royale", plataforma: "PC", stock: 12 },
  { id: "VG-02", titulo: "Quest of Titans", plataforma: "Xbox", stock: 5 },
];

const perifericos: Periferico[] = [
  { id: "PF-01", nombre: "Mouse competitivo", tipo: "mouse", precio: 160000 },
];

// 5) Uso real + demostración de que TS CONSERVA el tipo.
const juego = buscarPorId(videojuegos, "VG-01");
if (juego) {
  console.log(
    ` ${juego.titulo} — ${juego.plataforma} (stock: ${juego.stock})`,
  );
} else {
  console.log("Videojuego no encontrado.");
}

// 6) Reto extra: la MISMA función para periféricos.
const periferico = buscarPorId(perifericos, "PF-01");
if (periferico) {
  console.log(`  ${periferico.nombre} — $${periferico.precio}`);
} else {
  console.log("Periférico no encontrado.");
}

// 7) Caso "no encontrado" -> retorna undefined.
const inexistente = buscarPorId(videojuegos, "VG-99");
console.log(inexistente); // undefined
