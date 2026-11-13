export {};

// Ejercicio 9: Enums
enum GeneroMusical {
    Rock,
    Pop,
    Reggaeton,
    Electronica,
    Bachata
}
type Cancion = {
    titulo: string;
    artista: string;
    genero: GeneroMusical;
};
const playlist: Cancion[] = [
    {
        titulo: "La Bachata del Amor",
        artista: "Prince Royce",
        genero: GeneroMusical.Bachata
    },
    {
        titulo: "Blinding Lights",
        artista: "The Weeknd",
        genero: GeneroMusical.Pop
    },
    {
        titulo: "Titanium",
        artista: "David Guetta",
        genero: GeneroMusical.Electronica
    },
    {
        titulo: "Bohemian Rhapsody",
        artista: "Queen",
        genero: GeneroMusical.Rock
    },
    {
        titulo: "Dakiti",
        artista: "Bad Bunny",
        genero: GeneroMusical.Reggaeton
    }
];
const generoElegido: GeneroMusical = GeneroMusical.Rock;
const cancionesFiltradas: Cancion[] = playlist.filter(
    cancion => cancion.genero === generoElegido
);
console.log("Playlist filtrada:");
for (const cancion of cancionesFiltradas) {
    console.log(`${cancion.titulo} - ${cancion.artista}`);
}
