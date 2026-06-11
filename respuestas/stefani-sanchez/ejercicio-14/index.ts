export {};

type PeliculaApi = {
  id: number;
  titulo: string;
  genero: string;
  rating: number;
};

const peliculasSimuladas: PeliculaApi[] = [
  { id: 1, titulo: "Nebula 9", genero: "ciencia ficcion", rating: 4.7 },
  { id: 2, titulo: "Gol Final", genero: "deportes", rating: 4.1 },
  { id: 3, titulo: "Motores de Acero", genero: "accion", rating: 4.4 },
];

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function consultarPeliculas(genero?: string): Promise<PeliculaApi[]> {
  await esperar(300);

  if (peliculasSimuladas.length === 0) {
    throw new Error("No hay peliculas disponibles.");
  }

  return genero
    ? peliculasSimuladas.filter((pelicula) => pelicula.genero === genero)
    : peliculasSimuladas;
}

async function ejecutarConsulta(): Promise<void> {
  try {
    const peliculas = await consultarPeliculas("ciencia ficcion");
    console.table(peliculas);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    console.error("No fue posible consultar peliculas:", mensaje);
  }
}

await ejecutarConsulta();