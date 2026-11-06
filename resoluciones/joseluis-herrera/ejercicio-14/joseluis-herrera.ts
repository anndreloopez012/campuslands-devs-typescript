export {};

type Pelicula = {
    id: number;
    titulo: string;
    universo: "Marvel" | "DC"; 
};


const misPeliculas: Pelicula[] = [
    { id: 1, titulo: "Spider-Man: No Way Home", universo: "Marvel" },
    { id: 2, titulo: "The Batman", universo: "DC" },
    { id: 3, titulo: "Avengers: Endgame", universo: "Marvel" }
];


function esperarTiempo(segundos: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, segundos));
}


async function buscarPorUniverso(universo?: string): Promise<Pelicula[]> {
    
    await esperarTiempo(500);

    if (universo) {
        return misPeliculas.filter(peli => peli.universo === universo);
    }
    return misPeliculas;
}

async function mostrarPantallaPrincipal(): Promise<void> {
    try {
        console.log(" Cargando películas de Marvel...");

        const peliculasFiltradas = await buscarPorUniverso("Marvel");

        console.log(peliculasFiltradas);

    } catch (error) {
        console.error("Lo sentimos, no pudimos cargar las películas.");
    }
}

mostrarPantallaPrincipal();