export {};

// Ejercicio 14: Async/Await
// Contexto: Consulta de API de peliculas

interface Pelicula {
  id: number;
  titulo: string;
  genero: string;
  rating: number;
}

// Datos locales simulados de la API
const baseDatosPeliculas: Pelicula[] = [
  { id: 1, titulo: "Nebula 9", genero: "ciencia ficcion", rating: 4.7 },
  { id: 2, titulo: "Gol Final", genero: "deportes", rating: 4.1 },
  { id: 3, titulo: "Motores de Acero", genero: "accion", rating: 4.4 },
];

// Función que simula una petición de red con latencia y manejo de éxito/error
function obtenerPeliculasDeAPI(exito: boolean = true): Promise<Pelicula[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (exito) {
        resolve(baseDatosPeliculas);
      } else {
        reject(
          new Error("Error 500: No se pudo conectar al servidor de películas."),
        );
      }
    }, 1500); // Retraso de 1.5 segundos
  });
}

// Función asíncrona principal para consultar la API y aplicar el Reto Extra
async function ejecutarConsulta(): Promise<void> {
  try {
    console.log("Consultando servidor de películas...");
    const peliculas = await obtenerPeliculasDeAPI(true); // Cambiar a 'false' para probar el catch

    // Reto Extra: Filtrar por género de ciencia ficción
    const filtradas = peliculas.filter((p) => p.genero === "ciencia ficcion");

    console.log("\n--- Películas de Ciencia Ficción Encontradas ---");
    filtradas.forEach((p) =>
      console.log(`- ${p.titulo} (Rating: ${p.rating})`),
    );
  } catch (error: any) {
    // Control de errores de forma segura
    console.error(`\n[ERROR CONTROLADO]: ${error.message}`);
  }
}

// Ejecución del flujo asíncrono
ejecutarConsulta();
