export {};

type SubgeneroTerror = "Psicologico" | "Slasher" | "Paranormal" | "Gore" | "Cosmico";
type NivelSustos = "Bajo" | "Moderado" | "Extremo";

interface PeliculaTerror {
  readonly id: string;
  readonly titulo: string;
  readonly director: string;
  readonly anioEstreno: number;
  readonly subgenero: SubgeneroTerror;
  readonly jumpScares: NivelSustos;
  readonly calificacionRottenTomatoes: number;
}

interface ResumenCatalogoTerror {
  readonly totalPeliculas: number;
  readonly clasicosAclamados: readonly PeliculaTerror[];
  readonly promedioCalificacion: number;
}

function filtrarCatalogoTerror(peliculas: readonly PeliculaTerror[]): ResumenCatalogoTerror {
  if (peliculas.length === 0) {
    return { totalPeliculas: 0, clasicosAclamados: [], promedioCalificacion: 0 };
  }

  const aclamadas = peliculas
    .filter((p) => p.calificacionRottenTomatoes >= 80)
    .sort((a, b) => b.calificacionRottenTomatoes - a.calificacionRottenTomatoes);

  const sumaPuntajes = peliculas.reduce((acc, p) => acc + p.calificacionRottenTomatoes, 0);
  const promedio = Number((sumaPuntajes / peliculas.length).toFixed(1));

  return {
    totalPeliculas: peliculas.length,
    clasicosAclamados: aclamadas,
    promedioCalificacion: promedio,
  };
}

const coleccionTerror: PeliculaTerror[] = [
  { id: "mv-01", titulo: "Hereditary", director: "Ari Aster", anioEstreno: 2018, subgenero: "Psicologico", jumpScares: "Moderado", calificacionRottenTomatoes: 90 },
  { id: "mv-02", titulo: "Halloween", director: "John Carpenter", anioEstreno: 1978, subgenero: "Slasher", jumpScares: "Moderado", calificacionRottenTomatoes: 96 },
  { id: "mv-03", titulo: "The Conjuring", director: "James Wan", anioEstreno: 2013, subgenero: "Paranormal", jumpScares: "Extremo", calificacionRottenTomatoes: 86 },
];

console.log("=== CATALOGO DE PELICULAS DE TERROR ===");
const reporteTerror = filtrarCatalogoTerror(coleccionTerror);
console.log(`Titulos en catalogo: ${reporteTerror.totalPeliculas} | Calificacion media: ${reporteTerror.promedioCalificacion}%`);
console.log("Obras maestras destacadas:");
reporteTerror.clasicosAclamados.forEach((m) => {
  console.log(`- ${m.titulo} (${m.anioEstreno}) [${m.subgenero}] - Score: ${m.calificacionRottenTomatoes}%`);
});