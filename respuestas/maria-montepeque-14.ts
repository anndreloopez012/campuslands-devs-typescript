export {};

// Ejercicio 14: Async/Await

/** Generos validos dentro de nuestro catalogo simulado. */
type Genero = "ciencia ficcion" | "deportes" | "accion";

/** Forma de cada pelicula que "devuelve" la API simulada. */
type PeliculaApi = {
  readonly id: number;
  readonly titulo: string;
  readonly genero: Genero;
  readonly rating: number;
};

// Datos locales que reemplazan a una API externa real.
const peliculasSimuladas: readonly PeliculaApi[] = [
  { id: 1, titulo: "Nebula 9", genero: "ciencia ficcion", rating: 4.7 },
  { id: 2, titulo: "Gol Final", genero: "deportes", rating: 4.1 },
  { id: 3, titulo: "Motores de Acero", genero: "accion", rating: 4.4 },
];

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function consultarPeliculas(genero?: Genero): Promise<PeliculaApi[]> {
  await esperar(300);

  // Manejo de error
  if (peliculasSimuladas.length === 0) {
    throw new Error("No hay peliculas disponibles.");
  }

  // Sin filtro
  if (!genero) {
    return [...peliculasSimuladas];
  }

  // Con filtro
  const filtradas = peliculasSimuladas.filter(
    (pelicula) => pelicula.genero === genero,
  );

  // Otro caso de error controlado
  if (filtradas.length === 0) {
    throw new Error(`No se encontraron peliculas del genero "${genero}".`);
  }

  return filtradas;
}

/** Orquesta la consulta y muestra el resultado o el error controlado. */
async function ejecutarConsulta(): Promise<void> {
  try {
    const peliculas = await consultarPeliculas("ciencia ficcion");
    console.log("Peliculas obtenidas asincronicamente:");
    console.table(peliculas);
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("No fue posible consultar peliculas:", mensaje);
  }
}

// Top-level await
await ejecutarConsulta();
