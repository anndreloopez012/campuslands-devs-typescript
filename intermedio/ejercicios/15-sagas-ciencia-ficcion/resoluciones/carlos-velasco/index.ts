export {};

// tipos
interface PeliculaSaga {
  readonly titulo: string;
  anio: number;
  orden: number;
  calificacion: number;
  recaudacionMillones: number;
}

interface Saga {
  readonly nombre: string;
  peliculas: PeliculaSaga[];
}

// datos
const sagas: Saga[] = [
  { nombre: 'Orbita Perdida', peliculas: [
    { titulo: 'Orbita Perdida', anio: 2014, orden: 1, calificacion: 7.8, recaudacionMillones: 320 },
    { titulo: 'Orbita Perdida II', anio: 2017, orden: 2, calificacion: 8.1, recaudacionMillones: 450 },
    { titulo: 'Orbita Perdida III', anio: 2021, orden: 3, calificacion: 6.9, recaudacionMillones: 390 },
  ] },
  { nombre: 'Tierra Hueca', peliculas: [
    { titulo: 'Tierra Hueca', anio: 2018, orden: 1, calificacion: 7.2, recaudacionMillones: 210 },
    { titulo: 'Tierra Hueca: El Regreso', anio: 2022, orden: 2, calificacion: 8.4, recaudacionMillones: 510 },
  ] },
];

// validacion
function validarSaga(saga: Saga): string[] {
  const errores: string[] = [];

  if (saga.peliculas.length === 0) errores.push(`${saga.nombre}: sin peliculas`);
  if (!saga.peliculas.every((pelicula) => pelicula.calificacion >= 0 && pelicula.calificacion <= 10)) errores.push(`${saga.nombre}: calificacion fuera de rango`);
  if (!saga.peliculas.every((pelicula) => pelicula.orden > 0)) errores.push(`${saga.nombre}: orden invalido`);

  return errores;
}

// calculos
function calificacionPromedio(saga: Saga): number {
  const suma = saga.peliculas.reduce((total, pelicula) => total + pelicula.calificacion, 0);
  return Number((suma / saga.peliculas.length).toFixed(1));
}

function recaudacionTotal(saga: Saga): number {
  return saga.peliculas.reduce((total, pelicula) => total + pelicula.recaudacionMillones, 0);
}

function mejorPelicula(saga: Saga): PeliculaSaga | null {
  if (saga.peliculas.length === 0) return null;
  return saga.peliculas.reduce((mejor, pelicula) => (pelicula.calificacion > mejor.calificacion ? pelicula : mejor));
}

function ordenarSagas(sagas: Saga[]): Saga[] {
  return [...sagas].sort((a, b) => recaudacionTotal(b) - recaudacionTotal(a));
}

// salida
function mostrarResumen(sagas: Saga[]): void {
  console.log('=== Analizador de sagas sci-fi ===');
  console.log('Sagas por recaudacion:');
  ordenarSagas(sagas).forEach((saga) => {
    const errores = validarSaga(saga);
    const mejor = mejorPelicula(saga);
    console.log(`${saga.nombre} | Promedio: ${calificacionPromedio(saga)} | Recaudacion: $${recaudacionTotal(saga)}M | Mejor: ${mejor ? `${mejor.titulo} (${mejor.calificacion})` : 'n/a'}${errores.length > 0 ? ` | ${errores.join('; ')}` : ''}`);
  });
}

mostrarResumen(sagas);
