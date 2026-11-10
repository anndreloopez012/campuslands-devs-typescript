export {};

// tipos
type Genero = 'synthwave' | 'indie' | 'rock' | 'electronica';

interface Cancion {
  readonly titulo: string;
  readonly artista: string;
  genero: Genero;
  duracionSegundos: number;
  reproducciones: number;
  explicita: boolean;
}

interface Playlist {
  readonly nombre: string;
  canciones: Cancion[];
}

// datos
const biblioteca: Cancion[] = [
  { titulo: 'Neon Drive', artista: 'Kai Steel', genero: 'synthwave', duracionSegundos: 214, reproducciones: 82000, explicita: false },
  { titulo: 'Cafes y Lluvia', artista: 'Mora Lite', genero: 'indie', duracionSegundos: 189, reproducciones: 45000, explicita: false },
  { titulo: 'Ruido Blanco', artista: 'Cordoba 7', genero: 'rock', duracionSegundos: 265, reproducciones: 91000, explicita: true },
  { titulo: 'Pulso Digital', artista: 'Kai Steel', genero: 'electronica', duracionSegundos: 302, reproducciones: 120000, explicita: false },
  { titulo: 'Ultima Senal', artista: 'Vega Nix', genero: 'synthwave', duracionSegundos: 241, reproducciones: 38000, explicita: false },
];

// validacion
function validarCancion(cancion: Cancion): boolean {
  return cancion.duracionSegundos > 0 && cancion.reproducciones >= 0;
}

// calculos
function duracionTotal(canciones: Cancion[]): number {
  return canciones.reduce((total, cancion) => total + cancion.duracionSegundos, 0);
}

function formatearDuracion(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${resto.toString().padStart(2, '0')}`;
}

function filtrarPorGenero(biblioteca: Cancion[], genero: Genero): Cancion[] {
  return biblioteca.filter((cancion) => cancion.genero === genero && validarCancion(cancion));
}

function cancionesSinExplicitas(biblioteca: Cancion[]): Cancion[] {
  return biblioteca.filter((cancion) => !cancion.explicita && validarCancion(cancion));
}

function crearPlaylist(nombre: string, canciones: Cancion[]): Playlist {
  return { nombre, canciones: [...canciones] };
}

function masEscuchadas(biblioteca: Cancion[], limite: number): Cancion[] {
  return [...biblioteca].sort((a, b) => b.reproducciones - a.reproducciones).slice(0, limite);
}

// salida
function mostrarResumen(biblioteca: Cancion[]): void {
  const playlist = crearPlaylist('Mix Nocturno', cancionesSinExplicitas(biblioteca));

  console.log('=== Curador de playlist ===');
  console.log(`Playlist "${playlist.nombre}" | Canciones: ${playlist.canciones.length} | Duracion: ${formatearDuracion(duracionTotal(playlist.canciones))}`);
  console.log('Top reproducciones:');
  masEscuchadas(biblioteca, 3).forEach((cancion, indice) => {
    console.log(`${indice + 1}. ${cancion.titulo} - ${cancion.artista} | ${cancion.reproducciones}`);
  });
  console.log(`Synthwave disponible: ${filtrarPorGenero(biblioteca, 'synthwave').length}`);
}

mostrarResumen(biblioteca);
