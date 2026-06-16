
// 1. CONTRATO DE DATOS (INTERFAZ)
// Definimos la estructura exacta basada en las llaves de tu datos.json
interface Pelicula {
    id: number;
    titulo: string;
    genero: string;
    rating: number;
}

// 2. SIMULACIÓN DE LA API (PROMESA)

/**
 * Función que simula una petición de red asíncrona para obtener películas.
 * Tiene un 10% de probabilidad de fallar para probar el manejo de errores.
 */
function obtenerPeliculasDesdeServidor(): Promise<Pelicula[]> {
    return new Promise((resolve, reject) => {
        // Simulamos un retraso de red de 1.5 segundos (latencia)
        setTimeout(() => {
            const exito = Math.random() > 0.1; // 90% probabilidad de éxito

            if (exito) {
                // Importación dinámica para cargar los datos locales de tu JSON
                    import("./datos.json", { with: { type: "json" } })
                    .then((modulo) => resolve(modulo.default))
                    .catch((error) => reject("Error al leer el archivo de datos local."));
            } else {
                // Forzamos un error controlado del servidor
                reject("Error 500: No se pudo conectar con el servidor de películas.");
            }
        }, 1500);
    });
}

// 3. FUNCIÓN ASÍNCRONA PRINCIPAL

// Orquesta la petición asíncrona, aplica el filtro del Reto Extra y maneja fallos
async function ejecutarConsultaCine(): Promise<void> {
    console.log("========================================");
    console.log("Conectando al servidor de películas...");
    console.log("========================================");

    // Usamos try/catch de forma obligatoria para interceptar cualquier excepción
    try {
        // Esperamos a que la promesa se resuelva de manera asíncrona
        const catalogoCompleto: Pelicula[] = await obtenerPeliculasDesdeServidor();

        console.log("Datos recibidos con éxito.\n");

   
        // RETO EXTRA: Filtrar por Ciencia Ficción

        const generoObjetivo = "ciencia ficcion";
        const peliculasFiltradas = catalogoCompleto.filter(
            (p) => p.genero.toLowerCase() === generoObjetivo
        );

        console.log(`PELÍCULAS DE [${generoObjetivo.toUpperCase()}]:`);
        console.log("----------------------------------------");

        if (peliculasFiltradas.length === 0) {
            console.log(`No se encontraron películas del género ${generoObjetivo}.`);
        } else {
            peliculasFiltradas.forEach((pelicula) => {
                console.log(`${pelicula.titulo}`);
                console.log(`Calificación: ${pelicula.rating} / 5.0`);
                console.log(`Código ID    : ${pelicula.id}`);
                console.log("----------------------------------------");
            });
        }

    } catch (error) {
        // Bloque de contingencia ante caídas del servidor o errores de lectura
        console.error("\n OCURRIÓ UN ERROR EN LA OPERACIÓN:");
        console.error(`Mensaje: ${error}`);
        console.log("========================================");
    }
}


// 4. INVOCACIÓN

ejecutarConsultaCine();