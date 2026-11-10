export {};

// tipos
type ClasificacionEdad = 'siete' | 'trece' | 'dieciseis' | 'dieciocho';

interface PeliculaTerror {
  readonly titulo: string;
  readonly director: string;
  anio: number;
  duracionMinutos: number;
  clasificacion: ClasificacionEdad;
  sustosPorMinuto: number;
}

// datos
const catalogo: PeliculaTerror[] = [
  { titulo: 'Pasillo 9', director: 'R. Duarte', anio: 2019, duracionMinutos: 98, clasificacion: 'dieciseis', sustosPorMinuto: 0.4 },
  { titulo: 'El Faro Mudo', director: 'L. Iriarte', anio: 2021, duracionMinutos: 112, clasificacion: 'dieciocho', sustosPorMinuto: 0.6 },
  { titulo: 'Vecinos', director: 'R. Duarte', anio: 2023, duracionMinutos: 87, clasificacion: 'trece', sustosPorMinuto: 0.2 },
  { titulo: 'Cuarto Frio', director: 'M. Solano', anio: 2024, duracionMinutos: 105, clasificacion: 'dieciseis', sustosPorMinuto: 0.5 },
];

// validacion
function validarPelicula(pelicula: PeliculaTerror): boolean {
  return pelicula.duracionMinutos > 0 && pelicula.sustosPorMinuto >= 0 && pelicula.anio > 1900;
}

// calculos
function sustosTotales(pelicula: PeliculaTerror): number {
  return Number((pelicula.sustosPorMinuto * pelicula.duracionMinutos).toFixed(0));
}

function nivelMiedo(pelicula: PeliculaTerror): 'bajo' | 'medio' | 'alto' {
  if (pelicula.sustosPorMinuto >= 0.5) return 'alto';
  if (pelicula.sustosPorMinuto >= 0.3) return 'medio';
  return 'bajo';
}

function filtrarPorClasificacion(catalogo: PeliculaTerror[], permitidas: ClasificacionEdad[]): PeliculaTerror[] {
  return catalogo.filter((pelicula) => permitidas.includes(pelicula.clasificacion) && validarPelicula(pelicula));
}

function agruparPorDirector(catalogo: PeliculaTerror[]): Record<string, number> {
  return catalogo.reduce<Record<string, number>>((acumulador, pelicula) => {
    acumulador[pelicula.director] = (acumulador[pelicula.director] ?? 0) + 1;
    return acumulador;
  }, {});
}

function masRecientes(catalogo: PeliculaTerror[], limite: number): string[] {
  return [...catalogo].sort((a, b) => b.anio - a.anio).slice(0, limite).map((pelicula) => `${pelicula.titulo} (${pelicula.anio})`);
}

// salida
function mostrarResumen(catalogo: PeliculaTerror[]): void {
  console.log('=== Catalogo de peliculas de miedo ===');
  console.log('Peliculas para menores de 16:', filtrarPorClasificacion(catalogo, ['siete', 'trece']).map((pelicula) => pelicula.titulo).join(', '));
  console.log('Peliculas por director:', agruparPorDirector(catalogo));
  console.log('Mas recientes:', masRecientes(catalogo, 2).join(', '));

  catalogo.forEach((pelicula) => {
    console.log(`${pelicula.titulo} | ${nivelMiedo(pelicula)} | Sustos estimados: ${sustosTotales(pelicula)}`);
  });
}

mostrarResumen(catalogo);
