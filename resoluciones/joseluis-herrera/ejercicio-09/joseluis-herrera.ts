enum GenerosMusicales {
  Reguetton = "Reguetton",
  Cumbia = "Cumbia",
  Rap = "Rap",
  Rock = "Rock alternativo",
  HipHop = "HipHop"
}

type playlist = {
    cancion: string, 
    duracion: number,   
    artista: string,
    genero: GenerosMusicales
}

const canciones: playlist [] = [
   {
    cancion: "Un Preview",
    duracion: 165,
    artista: "Bad Bunny",
    genero: GenerosMusicales.Reguetton
  },
  {
    cancion: "Oye Mujer",
    duracion: 252,
    artista: "Raymix",
    genero: GenerosMusicales.Cumbia
  },
  {
    cancion: "Lose Yourself",
    duracion: 326,
    artista: "Eminem",
    genero: GenerosMusicales.Rap
  },
  {
    cancion: "In the End",
    duracion: 216,
    artista: "Linkin Park",
    genero: GenerosMusicales.Rock
  },
  {
    cancion: "HUMBLE.",
    duracion: 177,
    artista: "Kendrick Lamar",
    genero: GenerosMusicales.Rap
  }
];

const filtrado = canciones.filter (cancion => cancion.genero === GenerosMusicales.Rap);
console.log(filtrado);