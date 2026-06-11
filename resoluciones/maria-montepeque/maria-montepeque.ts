export {};

// Ejercicio 14: Async/Await

type Pelicula = { id: number; titulo: string; genero: string; rating: number };
const db: Pelicula[] = [
  { id: 1, titulo: "Nebula 9", genero: "ciencia ficcion", rating: 4.7 },
  { id: 2, titulo: "Gol Final", genero: "deportes", rating: 4.1 },
  { id: 3, titulo: "Motores de Acero", genero: "accion", rating: 4.4 },
];
const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function consultarPeliculas(genero?: string): Promise<Pelicula[]> {
  await esperar(300);
  if (db.length === 0) throw new Error("No hay peliculas disponibles.");
  return genero ? db.filter((p) => p.genero === genero) : db;
}
async function ejecutar(): Promise<void> {
  try {
    console.table(await consultarPeliculas("ciencia ficcion"));
  } catch (e) {
    console.error(
      "No fue posible consultar peliculas:",
      e instanceof Error ? e.message : e,
    );
  }
}
ejecutar();