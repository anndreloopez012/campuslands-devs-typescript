export {};

// Ejercicio 9: Enums
// Contexto: Generos musicales

// Definición del Enum para los géneros musicales
enum GeneroMusical {
  Rock = "Rock",
  Pop = "Pop",
  Jazz = "Jazz",
  Electronica = "Electrónica",
  Clasica = "Clásica",
}

// Estructura de una Canción
interface Cancion {
  titulo: string;
  artista: string;
  genero: GeneroMusical; // Uso obligatorio del enum
}

// Playlist de prueba
const playlist: Cancion[] = [
  { titulo: "Bohemian Rhapsody", artista: "Queen", genero: GeneroMusical.Rock },
  {
    titulo: "Blinding Lights",
    artista: "The Weeknd",
    genero: GeneroMusical.Pop,
  },
  { titulo: "Take Five", artista: "Dave Brubeck", genero: GeneroMusical.Jazz },
  { titulo: "Strobe", artista: "deadmau5", genero: GeneroMusical.Electronica },
  {
    titulo: "Symphony No. 5",
    artista: "Beethoven",
    genero: GeneroMusical.Clasica,
  },
  { titulo: "Back in Black", artista: "AC/DC", genero: GeneroMusical.Rock },
];

// Reto Extra: Función para filtrar canciones por género
function filtrarPorGenero(
  lista: Cancion[],
  generoBuscado: GeneroMusical,
): Cancion[] {
  return lista.filter((cancion) => cancion.genero === generoBuscado);
}

// Ejecución y filtrado por un género elegido (Rock)
const generoSeleccionado = GeneroMusical.Rock;
const cancionesFiltradas = filtrarPorGenero(playlist, generoSeleccionado);

// Impresión de resultados
console.log(`--- Playlist de Género: ${generoSeleccionado} ---`);
cancionesFiltradas.forEach((c) => console.log(`- ${c.titulo} de ${c.artista}`));
