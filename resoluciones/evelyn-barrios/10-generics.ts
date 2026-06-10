export {};

interface ConId {
  id: number | string;
}

function obtenerPorId<T extends ConId>(
  lista: T[],
  id: number | string,
): T | undefined {
  return lista.find((item) => item.id === id);
}

const juegos = [
  { id: 10, titulo: "Zelda" },
  { id: 20, titulo: "Halo" },
];
const perifericos = [
  { id: "M1", nombre: "Mouse" },
  { id: "T1", nombre: "Teclado" },
];

const miJuego = obtenerPorId(juegos, 10);
const miMouse = obtenerPorId(perifericos, "M1");

console.log("Encontrados:", miJuego?.titulo, "y", miMouse?.nombre);
