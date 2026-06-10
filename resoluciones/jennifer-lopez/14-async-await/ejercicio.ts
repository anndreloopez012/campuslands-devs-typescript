export {};

type Pelicula = {
  id: number;
  titulo: string;
  genero: string;
  rating: number;
};

const peliculasLocales: Pelicula[] = [
  { id: 1, titulo: "Nebula 9", genero: "ciencia ficcion", rating: 4.7 },
  { id: 2, titulo: "Gol Final", genero: "deportes", rating: 4.1 },
  { id: 3, titulo: "Motores de Acero", genero: "accion", rating: 4.4 }
];

function obtenerPeliculasDeAPI(debeFallar: boolean = false): Promise<Pelicula[]> {
  return new Promise((resolve, reject) => {
    console.log(" Conectando al servidor de películas... Porfavor espere.");
    setTimeout(() => {
      if (debeFallar) {
        reject(new Error("Error: No se pudo conectar con la base de datos de películas."));
      } else {
        resolve(peliculasLocales);
      }
    }, 2000);
  });
}

async function ejecutarConsulta() {
  try {
    const peliculas = await obtenerPeliculasDeAPI(false); 
    console.log("Datos obtenidos exitosamente.");
-
    console.log("\n --- PELÍCULAS DE CIENCIA FICCIÓN ---");
    const peliculasCienciaFiccion = peliculas.filter(p => p.genero === "ciencia ficcion");

    if (peliculasCienciaFiccion.length === 0) {
      console.log("No se encontraron películas de ese género.");
    } else {
      peliculasCienciaFiccion.forEach(p => {
        console.log(`-  ${p.titulo} | Rating: ${p.rating}`);
      });
    }

  } catch (error: any) {
    console.error(` Ocurrió un error controlado: ${error.message}`);
  }
}
ejecutarConsulta();