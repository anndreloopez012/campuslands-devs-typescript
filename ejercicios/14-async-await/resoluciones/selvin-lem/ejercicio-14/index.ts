export {};

// Ejercicio 14: Async/Await
// Contexto: Consulta de API de peliculas

// TODO: crea una funcion async que consulte peliculas simuladas.

interface RegistroMultimedia {
    idRegistro: number;
    nombreOriginal: string;
    clasificacionGenero: string;
    puntuacionCritica: number;
}

const catalogoServidor: RegistroMultimedia[] = [
    { 
        idRegistro: 101, 
        nombreOriginal: "Horizonte Estelar", 
        clasificacionGenero: "ciencia ficcion", 
        puntuacionCritica: 4.8 
    },
    { 
        idRegistro: 102, 
        nombreOriginal: "Cancha de Fuego", 
        clasificacionGenero: "deportes", 
        puntuacionCritica: 3.9 
    },
    { 
        idRegistro: 103, 
        nombreOriginal: "Furia en el Asfalto", 
        clasificacionGenero: "accion", 
        puntuacionCritica: 4.5 
    }
];

const emularRetrasoRed = (tiempoMs: number): Promise<void> => {
    return new Promise((completado) => setTimeout(completado, tiempoMs));
};

async function requerirDatosPorGenero(generoFiltro?: string): Promise<RegistroMultimedia[]> {
    await emularRetrasoRed(400);
    if (!catalogoServidor || catalogoServidor.length === 0) {
        throw new Error("La base de datos del servidor respondió con un estado vacío (404).");
    }
    if (generoFiltro) {
        return catalogoServidor.filter(
            (item) => item.clasificacionGenero.toLowerCase() === generoFiltro.toLowerCase()
        );
    }

    return catalogoServidor;
}
async function inicializarAplicacion(): Promise<void> {
    console.log("================== SISTEMA DE PETICIONES ASÍNCRONAS ==================");
    console.log("Conectando con la API de contenidos... Por favor, espere.");
    console.log("---------------------------------------------------------------------");

    try {
        const datosRecibidos = await requerirDatosPorGenero("ciencia ficcion");
        
        console.log("Datos recuperados exitosamente desde el servidor local:");
        console.log("---------------------------------------------------------------------");
        console.table(datosRecibidos);

    } catch (fallo) {
        const detalleError = fallo instanceof Error ? fallo.message : "Error de comunicación desconocido.";
        console.error(" ERROR CRÍTICO DEL SISTEMA:");
        console.error(`No se pudo procesar la solicitud de catálogo. Motivo: ${detalleError}`);
    } finally {
        console.log("=====================================================================");
    }
}

inicializarAplicacion().catch((err) => console.error("Fallo general de hilo:", err));