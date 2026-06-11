export {};

type ConId = {
  id: string;
};

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

function buscarPorId<T extends ConId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

const videojuegos: Videojuego[] = [
  { id: "VG-01", titulo: "Arena Royale", plataforma: "PC", stock: 12 },
  { id: "VG-02", titulo: "Quest of Titans", plataforma: "Xbox", stock: 5 },
];

const perifericos: Periferico[] = [
  { id: "PF-01", nombre: "Mouse competitivo", tipo: "mouse", precio: 160000 },
];

console.log(buscarPorId(videojuegos, "VG-01"));
console.log(buscarPorId(perifericos, "PF-01"));
