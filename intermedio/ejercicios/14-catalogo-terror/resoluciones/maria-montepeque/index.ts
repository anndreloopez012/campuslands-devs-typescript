export {};

type SubgeneroTerror =
  | "slasher"
  | "paranormal"
  | "psicologico"
  | "criatura"
  | "found-footage";

const ANIO_MINIMO = 1960;
const ANIO_MAXIMO = 2026;

interface PeliculaTerror {
  readonly id: number;
  readonly titulo: string;
  readonly director: string;
  readonly anio: number;
  readonly subgenero: SubgeneroTerror;
  readonly duracionMinutos: number;
  readonly calificacion: number;
}

interface ResumenSubgenero {
  readonly subgenero: SubgeneroTerror;
  readonly cantidad: number;
  readonly calificacionPromedio: number;
}

const catalogo: readonly PeliculaTerror[] = [
  {
    id: 1,
    titulo: "El Sotano Silencioso",
    director: "Marisol Ayala",
    anio: 2019,
    subgenero: "paranormal",
    duracionMinutos: 98,
    calificacion: 7.8,
  },
  {
    id: 2,
    titulo: "Cuchillos en la Niebla",
    director: "Hector Roldan",
    anio: 2015,
    subgenero: "slasher",
    duracionMinutos: 92,
    calificacion: 6.5,
  },
  {
    id: 3,
    titulo: "Voces del Desvan",
    director: "Marisol Ayala",
    anio: 2022,
    subgenero: "paranormal",
    duracionMinutos: 105,
    calificacion: 8.1,
  },
  {
    id: 4,
    titulo: "La Mente Fracturada",
    director: "Ines Barrera",
    anio: 2021,
    subgenero: "psicologico",
    duracionMinutos: 110,
    calificacion: 8.6,
  },
  {
    id: 5,
    titulo: "Criatura del Pantano",
    director: "Tomas Aguero",
    anio: 2018,
    subgenero: "criatura",
    duracionMinutos: 96,
    calificacion: 6.9,
  },
  {
    id: 6,
    titulo: "Grabacion Final",
    director: "Ines Barrera",
    anio: 2023,
    subgenero: "found-footage",
    duracionMinutos: 88,
    calificacion: 7.2,
  },
  {
    id: 7,
    titulo: "Mascara de Medianoche",
    director: "Hector Roldan",
    anio: 2024,
    subgenero: "slasher",
    duracionMinutos: 94,
    calificacion: 7.5,
  },
  {
    id: 8,
    titulo: "El Reflejo que No Duerme",
    director: "Tomas Aguero",
    anio: 1958,
    subgenero: "paranormal",
    duracionMinutos: 84,
    calificacion: 6.0,
  },
  {
    id: 9,
    titulo: "Ultimo Testigo",
    director: "Marisol Ayala",
    anio: 2020,
    subgenero: "found-footage",
    duracionMinutos: 0,
    calificacion: 5.5,
  },
  {
    id: 10,
    titulo: "El Grito que Regresa",
    director: "Ines Barrera",
    anio: 2017,
    subgenero: "criatura",
    duracionMinutos: 101,
    calificacion: 11.5,
  },
];

const esPeliculaValida = (pelicula: PeliculaTerror): boolean =>
  pelicula.titulo.trim().length > 0 &&
  pelicula.director.trim().length > 0 &&
  pelicula.anio >= ANIO_MINIMO &&
  pelicula.anio <= ANIO_MAXIMO &&
  pelicula.duracionMinutos > 0 &&
  pelicula.calificacion >= 0 &&
  pelicula.calificacion <= 10;

const agruparPorSubgenero = (
  peliculas: readonly PeliculaTerror[],
): ResumenSubgenero[] => {
  const acumulado = new Map<SubgeneroTerror, { cantidad: number; sumaCalificacion: number }>();

  peliculas.forEach((pelicula) => {
    const previo = acumulado.get(pelicula.subgenero) ?? {
      cantidad: 0,
      sumaCalificacion: 0,
    };

    acumulado.set(pelicula.subgenero, {
      cantidad: previo.cantidad + 1,
      sumaCalificacion: previo.sumaCalificacion + pelicula.calificacion,
    });
  });

  return Array.from(acumulado, ([subgenero, datos]) => ({
    subgenero,
    cantidad: datos.cantidad,
    calificacionPromedio: Math.round((datos.sumaCalificacion / datos.cantidad) * 100) / 100,
  })).sort((a, b) => b.calificacionPromedio - a.calificacionPromedio);
};

const generarTopPeliculas = (
  peliculas: readonly PeliculaTerror[],
  limite: number,
): PeliculaTerror[] =>
  [...peliculas]
    .sort((a, b) => b.calificacion - a.calificacion || b.anio - a.anio)
    .slice(0, limite);

const procesarCatalogo = (peliculas: readonly PeliculaTerror[]) => {
  const validas = peliculas.filter(esPeliculaValida);
  const invalidas = peliculas.filter((pelicula) => !esPeliculaValida(pelicula));

  return {
    validas,
    invalidas,
    resumenSubgeneros: agruparPorSubgenero(validas),
    topPeliculas: generarTopPeliculas(validas, 3),
  };
};

// --- Render del Sistema ---
const resumen = procesarCatalogo(catalogo);

console.log(
  `Ejercicio 14: Catalogo de peliculas de miedo\nPeliculas totales: ${catalogo.length}\nPeliculas validas: ${resumen.validas.length}\nPeliculas invalidas: ${resumen.invalidas.length}`,
);

resumen.invalidas.forEach((pelicula) =>
  console.log(`  - #${pelicula.id} "${pelicula.titulo}" tiene datos invalidos`),
);

console.log("Calificacion promedio por subgenero:");
resumen.resumenSubgeneros.forEach((item) =>
  console.log(`  ${item.subgenero}: ${item.calificacionPromedio} (${item.cantidad} pelicula(s))`),
);

console.log("Top 3 peliculas mejor calificadas:");
resumen.topPeliculas.forEach((pelicula, index) =>
  console.log(
    `${index + 1}. ${pelicula.titulo} (${pelicula.anio}) - ${pelicula.calificacion}`,
  ),
);
