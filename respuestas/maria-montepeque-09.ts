export {};

// Ejercicio 9: Enums

// 1. El enum es la unica fuente de verdad para los generos validos.
enum GeneroMusical {
  Rock = "rock",
  Rap = "rap",
  Salsa = "salsa",
  Electronica = "electronica",
  Reggaeton = "reggaeton",
}

// 2. Cada cancion se tipa con el enum: el campo `genero` solo
type Cancion = {
  titulo: string;
  artista: string;
  genero: GeneroMusical;
  duracionSegundos: number;
};

// 3. Playlist clasificada. Si intentaramos poner
const playlist: Cancion[] = [
  {
    titulo: "Ciudad Lunar",
    artista: "Nova Beat",
    genero: GeneroMusical.Electronica,
    duracionSegundos: 218,
  },
  {
    titulo: "Barrio Alto",
    artista: "MC Norte",
    genero: GeneroMusical.Rap,
    duracionSegundos: 196,
  },
  {
    titulo: "Rueda de Fuego",
    artista: "La Clave",
    genero: GeneroMusical.Salsa,
    duracionSegundos: 240,
  },
  {
    titulo: "Trueno Suave",
    artista: "Los Picos",
    genero: GeneroMusical.Rock,
    duracionSegundos: 205,
  },
  {
    titulo: "Noche de Barrio",
    artista: "DJ Marea",
    genero: GeneroMusical.Reggaeton,
    duracionSegundos: 187,
  },
  {
    titulo: "Verso Frio",
    artista: "MC Norte",
    genero: GeneroMusical.Rap,
    duracionSegundos: 172,
  },
];

// 4. Reto extra: filtrar la playlist por un genero elegido.
function filtrarPorGenero(
  canciones: Cancion[],
  genero: GeneroMusical,
): Cancion[] {
  return canciones.filter((cancion) => cancion.genero === genero);
}

// 5. Elegimos un genero y mostramos el resultado.
const generoBuscado: GeneroMusical = GeneroMusical.Rap;
const cancionesFiltradas: Cancion[] = filtrarPorGenero(playlist, generoBuscado);

console.log(`Playlist filtrada por genero: ${generoBuscado}`);
console.table(cancionesFiltradas);
