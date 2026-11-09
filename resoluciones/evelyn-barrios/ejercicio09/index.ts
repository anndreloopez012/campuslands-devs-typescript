export {};

// Ejercicio 9: Enums
// Contexto: Generos musicales

// TODO: crea un enum para generos musicales.

enum GeneroMusical {
 Rock = "Rock",
 Pop = "Pop",
 Jazz = "Jazz",
 Techno = "Techno",
}


interface Cancion {
 titulo: string;
 artista: string;
 genero: GeneroMusical;
}


const playlist: Cancion[] = [
 { titulo: "Bohemian Rhapsody", artista: "Queen", genero: GeneroMusical.Rock },
 { titulo: "Midnight", artista: "Kavinsky", genero: GeneroMusical.Techno },
];


console.log(`Mi género favorito es: ${GeneroMusical.Techno}`);
