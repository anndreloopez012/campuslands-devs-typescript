// Ejercicio 14: Async/Await
// Contexto: Consulta de API de peliculas
// Resolucion: Dulce Morales
// No se usa ninguna API real: los datos vienen de datos.json y la latencia se simula.

import datos from "./datos.json" with { type: "json" };

type Pelicula = {
  id: number;
  titulo: string;
  genero: string;
  rating: number;
};

const peliculasLocales: Pelicula[] = datos;

// Error propio para distinguir los fallos de la "API" de otros errores
class ErrorApi extends Error {
  public readonly codigo: number;

  constructor(mensaje: string, codigo: number) {
    super(mensaje);
    this.name = "ErrorApi";
    this.codigo = codigo;
  }
}

// Simula la latencia de red con setTimeout dentro de una promesa
function esperar(milisegundos: number): Promise<void> {
  return new Promise<void>((resolve: () => void): void => {
    setTimeout(resolve, milisegundos);
  });
}

// "API" simulada: devuelve todas las peliculas, o falla si el servidor esta caido
async function obtenerPeliculas(servidorDisponible: boolean = true): Promise<Pelicula[]> {
  await esperar(500);
  if (!servidorDisponible) {
    throw new ErrorApi("El servidor de peliculas no responde", 503);
  }
  return peliculasLocales;
}

// "API" simulada: busca una pelicula por id, o falla si no existe
async function obtenerPeliculaPorId(id: number): Promise<Pelicula> {
  await esperar(300);
  const pelicula: Pelicula | undefined = peliculasLocales.find((p: Pelicula): boolean => p.id === id);
  if (pelicula === undefined) {
    throw new ErrorApi(`No existe una pelicula con id ${id}`, 404);
  }
  return pelicula;
}

// Reto extra: filtra por genero de ciencia ficcion
async function obtenerCienciaFiccion(): Promise<Pelicula[]> {
  const peliculas: Pelicula[] = await obtenerPeliculas();
  return peliculas.filter((pelicula: Pelicula): boolean => pelicula.genero === "ciencia ficcion");
}

function formatearPelicula(pelicula: Pelicula): string {
  return `#${pelicula.id} ${pelicula.titulo.padEnd(18)} | ${pelicula.genero.padEnd(15)} | ${pelicula.rating}`;
}

// Convierte cualquier error en un mensaje controlado
function describirError(error: unknown): string {
  if (error instanceof ErrorApi) {
    return `Error ${error.codigo}: ${error.message}`;
  }
  if (error instanceof Error) {
    return `Error inesperado: ${error.message}`;
  }
  return "Error desconocido";
}

async function main(): Promise<void> {
  console.log("Consultando catalogo...");
  try {
    const peliculas: Pelicula[] = await obtenerPeliculas();
    console.log(`=== CATALOGO (${peliculas.length} peliculas) ===`);
    peliculas.forEach((pelicula: Pelicula): void => console.log(formatearPelicula(pelicula)));
  } catch (error: unknown) {
    console.log(describirError(error));
  }

  console.log("\nConsultando ciencia ficcion...");
  try {
    const cienciaFiccion: Pelicula[] = await obtenerCienciaFiccion();
    console.log(`=== CIENCIA FICCION (${cienciaFiccion.length}) ===`);
    cienciaFiccion.forEach((pelicula: Pelicula): void => console.log(formatearPelicula(pelicula)));
  } catch (error: unknown) {
    console.log(describirError(error));
  }

  console.log("\nBuscando pelicula con id 6...");
  try {
    const pelicula: Pelicula = await obtenerPeliculaPorId(6);
    console.log(`Encontrada: ${formatearPelicula(pelicula)}`);
  } catch (error: unknown) {
    console.log(describirError(error));
  }

  // Errores controlados: la app no se cae, muestra un mensaje
  console.log("\nBuscando pelicula con id 42...");
  try {
    const pelicula: Pelicula = await obtenerPeliculaPorId(42);
    console.log(`Encontrada: ${formatearPelicula(pelicula)}`);
  } catch (error: unknown) {
    console.log(describirError(error));
  }

  console.log("\nConsultando con el servidor caido...");
  try {
    const peliculas: Pelicula[] = await obtenerPeliculas(false);
    console.log(`Recibidas ${peliculas.length} peliculas`);
  } catch (error: unknown) {
    console.log(describirError(error));
  }
}

main();
