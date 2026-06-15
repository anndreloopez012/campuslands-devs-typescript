export {};
// Ejercicio 14: Async/Await
// Contexto: Consulta de API de peliculas

// TODO: crea una funcion async que consulte peliculas simuladas.
import peliculas from "./datos.json" with { type: "json" };

interface Pelicula {
    id: number;
    titulo: string;
    genero: string;
    rating: number;
}

async function obtenerPeliculas(): Promise<Pelicula[]> {
    return new Promise((resolve, reject) => {
        console.log("Conectando con la base de datos...");
        setTimeout(() => {
            if (peliculas !== null && peliculas.length > 0) {
                resolve(peliculas);
            } else {
                reject('Error: Los datos están vacíos o la conexión falló');
            }
        }, 1500);
    });
}

async function ejecutarApp() {
    try {
        const listaPeliculas = await obtenerPeliculas();
        console.log("¡Datos obtenidos correctamente!");
        const scifi = listaPeliculas.filter(p => p.genero === "ciencia ficcion");
        console.log("--- Películas de Ciencia Ficción ---");
        scifi.forEach(p => console.log(`- ${p.titulo} (Rating: ${p.rating})`));

    } catch (error) {
        console.error("Hubo un problema al consultar la API:", error);
    }
}

ejecutarApp();