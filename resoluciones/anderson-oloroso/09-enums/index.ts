export {};

// Ejercicio 9: Enums
// Contexto: Generos musicales

// TODO: crea un enum para generos musicales.

enum generosMusicales {
  ROCK = "rock",
  HIPHOP = "hiphop",
  CLASICA = "clasica",
  ELECTRONICA = "electronica",
  REGGAETON = "reggaeton",
}

interface Cancion {
  titulo: string;
  artista: string;
  genero: generosMusicales;
}

const cancion1: Cancion = {
  titulo: "Devuelveme a mi chica",
  artista: "Hombres G",
  genero: generosMusicales.ROCK,
};

const cancion2: Cancion = {
  titulo: "Lose Yourself",
  artista: "Eminem",
  genero: generosMusicales.HIPHOP,
};

const cancion3: Cancion = {
  titulo: "Fur Elise",
  artista: "Ludwig van Beethoven",
  genero: generosMusicales.CLASICA,
};

const cancion4: Cancion = {
  titulo: "The Nights",
  artista: "Avicii",
  genero: generosMusicales.ELECTRONICA,
};

const cancion5: Cancion = {
  titulo: "Calma",
  artista: "Pedro Capó ft. Farruko",
  genero: generosMusicales.REGGAETON,
};

console.log(cancion1);
console.log(cancion2);
console.log(cancion3);
console.log(cancion4);
console.log(cancion5);
