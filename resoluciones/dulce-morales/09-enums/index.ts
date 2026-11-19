export {};

// Ejercicio 9: Enums
// Contexto: Generos musicales
// Resolucion: Dulce Morales

// Enum real con valores de texto: evita repetir strings sueltos por todo el codigo
enum GeneroMusical {
  Rock = "Rock",
  Pop = "Pop",
  Reggaeton = "Reggaeton",
  Jazz = "Jazz",
  Electronica = "Electronica",
  Salsa = "Salsa",
}

type Cancion = {
  titulo: string;
  artista: string;
  duracionSegundos: number;
  genero: GeneroMusical; // solo acepta valores del enum
};

const biblioteca: Cancion[] = [
  { titulo: "Bohemian Rhapsody", artista: "Queen", duracionSegundos: 354, genero: GeneroMusical.Rock },
  { titulo: "Blinding Lights", artista: "The Weeknd", duracionSegundos: 200, genero: GeneroMusical.Pop },
  { titulo: "Tusa", artista: "Karol G", duracionSegundos: 201, genero: GeneroMusical.Reggaeton },
  { titulo: "Take Five", artista: "Dave Brubeck", duracionSegundos: 324, genero: GeneroMusical.Jazz },
  { titulo: "Strobe", artista: "deadmau5", duracionSegundos: 637, genero: GeneroMusical.Electronica },
  { titulo: "Pedro Navaja", artista: "Ruben Blades", duracionSegundos: 450, genero: GeneroMusical.Salsa },
  { titulo: "Back in Black", artista: "AC/DC", duracionSegundos: 255, genero: GeneroMusical.Rock },
  { titulo: "Levitating", artista: "Dua Lipa", duracionSegundos: 203, genero: GeneroMusical.Pop },
  { titulo: "Smells Like Teen Spirit", artista: "Nirvana", duracionSegundos: 301, genero: GeneroMusical.Rock },
];

// Esto marcaria error porque "Cumbia" no es un GeneroMusical:
// const cancionInvalida: Cancion = { titulo: "X", artista: "Y", duracionSegundos: 100, genero: "Cumbia" };

function formatearDuracion(segundos: number): string {
  const minutos: number = Math.floor(segundos / 60);
  const resto: number = segundos % 60;
  return `${minutos}:${resto.toString().padStart(2, "0")}`;
}

// Reto extra: filtrar canciones por genero
function filtrarPorGenero(canciones: Cancion[], genero: GeneroMusical): Cancion[] {
  return canciones.filter((cancion: Cancion): boolean => cancion.genero === genero);
}

function contarPorGenero(canciones: Cancion[], genero: GeneroMusical): number {
  return filtrarPorGenero(canciones, genero).length;
}

function mostrarPlaylist(canciones: Cancion[], genero: GeneroMusical): void {
  const playlist: Cancion[] = filtrarPorGenero(canciones, genero);
  const duracionTotal: number = playlist.reduce(
    (total: number, cancion: Cancion): number => total + cancion.duracionSegundos,
    0,
  );

  console.log(`====== PLAYLIST: ${genero.toUpperCase()} ======`);
  playlist.forEach((cancion: Cancion, indice: number): void => {
    console.log(`${indice + 1}. ${cancion.titulo} - ${cancion.artista} (${formatearDuracion(cancion.duracionSegundos)})`);
  });
  console.log(`Canciones: ${playlist.length} | Duracion total: ${formatearDuracion(duracionTotal)}`);
}

// Resumen de cuantas canciones hay de cada genero, recorriendo el enum
console.log("====== CANCIONES POR GENERO ======");
Object.values(GeneroMusical).forEach((genero: GeneroMusical): void => {
  console.log(`${genero.padEnd(12)} ${contarPorGenero(biblioteca, genero)}`);
});
console.log("");

// Genero elegido para la playlist
const generoElegido: GeneroMusical = GeneroMusical.Rock;
mostrarPlaylist(biblioteca, generoElegido);
