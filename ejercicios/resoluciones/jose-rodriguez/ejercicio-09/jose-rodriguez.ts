export {};


// 1. DEFINICIÓN DEL ENUM (GÉNEROS MUSICALES)
// Un enum real con un mínimo de cinco géneros asignados explícitamente
enum GeneroMusical {
    Rock = "ROCK",
    Pop = "POP",
    Jazz = "JAZZ",
    Reggae = "REGGAE",
    Electronica = "ELECTRONICA"
}

// 2. CONTRATO DE DATOS (INTERFAZ)
interface Cancion {
    titulo: string;
    artista: string;
    duracionSegundos: number;
    genero: GeneroMusical; // Restringido estrictamente al Enum
}

// 3. CREACIÓN DE LA PLAYLIST (ARRAY)
const miPlaylist: Cancion[] = [
    {
        titulo: "Bohemian Rhapsody",
        artista: "Queen",
        duracionSegundos: 355,
        genero: GeneroMusical.Rock // Asignación controlada
    },
    {
        titulo: "Blinding Lights",
        artista: "The Weeknd",
        duracionSegundos: 200,
        genero: GeneroMusical.Pop
    },
    {
        titulo: "Take Five",
        artista: "Dave Brubeck",
        duracionSegundos: 324,
        genero: GeneroMusical.Jazz
    },
    {
        titulo: "Is This Love",
        artista: "Bob Marley",
        duracionSegundos: 232,
        genero: GeneroMusical.Reggae
    },
    {
        titulo: "Strobe",
        artista: "deadmau5",
        duracionSegundos: 637,
        genero: GeneroMusical.Electronica
    },
    {
        titulo: "Back in Black",
        artista: "AC/DC",
        duracionSegundos: 255,
        genero: GeneroMusical.Rock
    }
];

// 4. RETO EXTRA: FILTRADO POR GÉNERO

/**
 * Filtra las canciones de una lista según el género musical elegido
 */
function filtrarPorGenero(lista: Cancion[], generoElegido: GeneroMusical): Cancion[] {
    return lista.filter(cancion => cancion.genero === generoElegido);
}

// Elegimos el género por el cual queremos filtrar la playlist
const generoAFiltrar = GeneroMusical.Rock;
const playlistFiltrada = filtrarPorGenero(miPlaylist, generoAFiltrar);

// 5. RESULTADO ESPERADO (IMPRESIÓN)

console.log("========================================");
console.log(` PLAYLIST FILTRADA POR: ${generoAFiltrar} `);
console.log("========================================");

if (playlistFiltrada.length === 0) {
    console.log("No se encontraron canciones para este género.");
} else {
    playlistFiltrada.forEach((cancion) => {
        const minutos = Math.floor(cancion.duracionSegundos / 60);
        const segundos = cancion.duracionSegundos % 60;
        // Formateamos los segundos para que siempre muestren dos dígitos (ej: 05 en vez de 5)
        const tiempoFormateado = `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;

        console.log(`  ${cancion.titulo}`);
        console.log(`   Artista : ${cancion.artista}`);
        console.log(`   Duración: ${tiempoFormateado}`);
        console.log("----------------------------------------");
    });
}