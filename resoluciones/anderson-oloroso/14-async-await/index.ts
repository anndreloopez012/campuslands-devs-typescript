export {};
import datos from "./datos.json" with { type: "json" };

// Ejercicio 14: Async/Await
// Contexto: Consulta de API de peliculas

// TODO: crea una funcion async que consulte peliculas simuladas.

interface PeliculasInfo {
  id: number;
  titulo: string;
  genero: string;
  rating: number;
}

function solicitarPelis(): Promise<PeliculasInfo[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const listaPeliculas = datos as PeliculasInfo[];

      if (listaPeliculas && listaPeliculas.length > 0) {
        resolve(listaPeliculas);
      } else {
        reject(new Error("El catálogo de datos está vacío o corrupto."));
      }
    }, 1000);
  });
}

async function todosLosDatos(): Promise<void> {
  try {
    console.log("Obteniendo informacion ...");

    const todoElCatalogo = await solicitarPelis();

    console.log("¡Todos los datos han sido cargados con éxito!\n");
    console.log("=== PELÍCULAS ===");

    console.log(JSON.stringify(todoElCatalogo, null, 2));
  } catch (error) {
    console.error("=== ERROR EN LA CARGA DE DATOS ===");
    if (error instanceof Error) {
      console.error(`Detalle: ${error.message}`);
    }
  }
}

async function filtro(genero: string) {
  const xGeneros: PeliculasInfo[] = [];
  try {
    console.log("Filtrando peliculas por genero...");

    const todoElCatalogo = await solicitarPelis();
    todoElCatalogo.forEach((peli) => {
      if (peli.genero === genero) {
        xGeneros.push(peli);
      }
    });
    xGeneros.forEach((pelis) => {
      console.log(pelis);
    });
  } catch (error) {
    console.error("=== ERROR AL FILTRAR POR GENERO ===");
    if (error instanceof Error) {
      console.error(`Detalle: ${error.message}`);
    }
  }
}

todosLosDatos();
filtro("accion");
