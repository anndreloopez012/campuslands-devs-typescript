export {};

enum GeneroMusical {
  Rock = "rock",
  Rap = "rap",
  Salsa = "salsa",
  Electronica = "electronica",
  Reggaeton = "reggaeton",
}

type Cancion = {
  titulo: string;
  artista: string;
  genero: GeneroMusical;
  duracionSegundos: number;
};

const playlist: Cancion[] = [
  { titulo: "Ciudad Lunar", artista: "Nova Beat", genero: GeneroMusical.Electronica, duracionSegundos: 218 },
  { titulo: "Barrio Alto", artista: "MC Norte", genero: GeneroMusical.Rap, duracionSegundos: 196 },
  { titulo: "Rueda de Fuego", artista: "La Clave", genero: GeneroMusical.Salsa, duracionSegundos: 240 },
];

const generoBuscado: GeneroMusical = GeneroMusical.Rap;
const cancionesFiltradas: Cancion[] = playlist.filter((cancion) => cancion.genero === generoBuscado);

console.table(cancionesFiltradas);
