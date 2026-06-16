export {};

// Ejercicio 9: Enums
// Contexto: Generos musicales

// TODO: crea un enum para generos musicales.

// Ejercicio 09: Enums - Generos musicales

enum GeneroMusical {
    Rock = "Rock",
    Pop = "Pop",
    Jazz = "Jazz"
}

interface Cancion {
    titulo: string;
    artista: string;
    genero: GeneroMusical;
}

const playlist: Cancion[] = [
    { titulo: "Bohemian Rhapsody", artista: "Queen", genero: GeneroMusical.Rock },
    { titulo: "Billie Jean", artista: "Michael Jackson", genero: GeneroMusical.Pop },
    { titulo: "So What", artista: "Miles Davis", genero: GeneroMusical.Jazz },
    { titulo: "Hotel California", artista: "Eagles", genero: GeneroMusical.Rock }
];

function filtrarPorGenero(generoBuscado: GeneroMusical): Cancion[] {
    return playlist.filter(cancion => cancion.genero === generoBuscado);
}

const cancionesFiltradas = filtrarPorGenero(GeneroMusical.Rock);

console.log(`--- Playlist filtrada por: ${GeneroMusical.Rock} ---`);
cancionesFiltradas.forEach(c => {
    console.log(`"${c.titulo}" de ${c.artista}`);
});