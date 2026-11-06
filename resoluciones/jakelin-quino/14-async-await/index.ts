export {};

// Ejercicio 14: Async/Await
// Contexto: Consulta de API de peliculas

// TODO: crea una funcion async que consulte peliculas simuladas.
console.log("---------Ejercicio 14: Async/Await---------")

const peliculasSimuladas = [
    { id: 1, titulo: "Inception", genero: "Ciencia Ficción" },
    { id: 2, titulo: "The Dark Knight", genero: "Acción" },
    { id: 3, titulo: "Interstellar", genero: "Ciencia Ficción" }
];

const obtenerPeliculasAPI = (): Promise<typeof peliculasSimuladas> => {
    return new Promise((resolve, reject) => {
        const exito = true; 
        setTimeout(() => {
            if (exito) {
                resolve(peliculasSimuladas);
            } else {
                reject("Error 500: No se pudo conectar con el servidor de películas.");
            }
        }, 2000);
    });
};

async function consultarPeliculas() {
    console.log("Cargando películas...");
    try {
        const peliculas = await obtenerPeliculasAPI();
        console.log("Películas obtenidas con éxito:");
        console.log(peliculas);
    } catch (error) {
        console.error("Hubo un problema al obtener las películas:");
        console.error(error);
    }
}

consultarPeliculas();