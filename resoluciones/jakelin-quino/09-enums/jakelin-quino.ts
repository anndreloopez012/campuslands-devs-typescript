export {};

// Ejercicio 9: Enums
// Contexto: Generos musicales

// TODO: crea un enum para generos musicales.

console.log("----------- Ejercicio 9: Enums -----------")

enum GeneroMusical {
  Rock = "ROCK",
  Pop = "POP",
  Reggeton = "REGGETON",
  Electonica = "ELECTRONICA",
  Jazz = "JAZZ"
}

type Cancion = {
  titulo: string;
  artista: string;
  genero: GeneroMusical;
};

const miPlaylist: Cancion[] = [
  { titulo: "Bohemian Rhapsody", artista: "Queen", genero: GeneroMusical.Rock },
  { titulo: "Blinding Lights", artista: "The Weeknd", genero: GeneroMusical.Pop },
  { titulo: "Gasolina", artista: "Daddy Yankee", genero: GeneroMusical.Reggeton },
  { titulo: "Levels", artista: "Avicii", genero: GeneroMusical.Electonica },
  { titulo: "Hotel California", artista: "Eagles", genero: GeneroMusical.Rock }
];

function filtrarPorGenero(lista: Cancion[], generoBuscado: GeneroMusical): Cancion[] {
  let cancionesFiltradas: Cancion[] = [];  
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].genero === generoBuscado) {
      cancionesFiltradas.push(lista[i]);
    }
  }
  return cancionesFiltradas;
}

const generoAFiltrar = GeneroMusical.Rock;
const cancionesDeRock = filtrarPorGenero(miPlaylist, generoAFiltrar);

console.log(`--- Playlist de ${generoAFiltrar} ---`);
for (let i = 0; i < cancionesDeRock.length; i++) {
  console.log(`- ${cancionesDeRock[i].titulo} por ${cancionesDeRock[i].artista}`);
}