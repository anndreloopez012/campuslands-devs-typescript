export {};

type SubgeneroTerror = 'Sobrenatural' | 'Slasher' | 'Psychological' | 'Found Footage' | 'Gore';
type ClasificacionMiedos = 'Estreno Exclusivo' | 'Catalogo General' | 'Culto Clasico' | 'Restringida';

interface FichaPeliculaTerror {
  readonly peliculaId: string;
  readonly titulo: string;
  readonly director: string;
  readonly subgenero: SubgeneroTerror;
  readonly duracionMinutos: number;
  readonly calificacionRottenTomatoes: number; // Porcentaje (ej: 88)
  readonly recaudacionMillonesUSD: number;
  estado: ClasificacionMiedos;
}

interface ResumenCatalogoTerror {
  readonly pelicula: string;
  readonly subgenero: SubgeneroTerror;
  readonly duracionFormato: string;
  readonly nivelTerrorScore: number;
  readonly categoriaExhibicion: string;
}

const videotecaNocturna: readonly FichaPeliculaTerror[] = [
  {
    peliculaId: "HOR-901",
    titulo: "Hereditary",
    director: "Ari Aster",
    subgenero: "Sobrenatural",
    duracionMinutos: 127,
    calificacionRottenTomatoes: 89,
    recaudacionMillonesUSD: 82.5,
    estado: "Culto Clasico",
  },
  {
    peliculaId: "HOR-902",
    titulo: "Talk to Me",
    director: "Danny y Michael Philippou",
    subgenero: "Sobrenatural",
    duracionMinutos: 95,
    calificacionRottenTomatoes: 94,
    recaudacionMillonesUSD: 92.1,
    estado: "Estreno Exclusivo",
  },
  {
    peliculaId: "HOR-903",
    titulo: "Terrifier 2",
    director: "Damien Leone",
    subgenero: "Gore",
    duracionMinutos: 138,
    calificacionRottenTomatoes: 85,
    recaudacionMillonesUSD: 15.7,
    estado: "Restringida",
  },
  {
    peliculaId: "HOR-904",
    titulo: "The Witch",
    director: "Robert Eggers",
    subgenero: "Psychological",
    duracionMinutos: 92,
    calificacionRottenTomatoes: 90,
    recaudacionMillonesUSD: 40.4,
    estado: "Culto Clasico",
  },
  {
    peliculaId: "HOR-905",
    titulo: "Scream VI",
    director: "Matt Bettinelli-Olpin",
    subgenero: "Slasher",
    duracionMinutos: 123,
    calificacionRottenTomatoes: 76,
    recaudacionMillonesUSD: 169.0,
    estado: "Catalogo General",
  }
];

function validarPeliculaCatalogo(pelicula: FichaPeliculaTerror): boolean {
  return pelicula.estado !== "Restringida" && pelicula.calificacionRottenTomatoes >= 70;
}

function calcularIndiceTerror(pelicula: FichaPeliculaTerror): number {
  const factorCritica = pelicula.calificacionRottenTomatoes * 0.8;
  const factorComercial = Math.min(pelicula.recaudacionMillonesUSD * 0.15, 25);
  const penalizacionDuracion = pelicula.duracionMinutos > 130 ? 10 : 0;
  const puntajeBruto = factorCritica + factorComercial - penalizacionDuracion;
  return Number(puntajeBruto.toFixed(2));
}

function formatearDuracionHoras(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const minsRestantes = minutos % 60;
  return `${horas}h ${minsRestantes}m`;
}

function clasificarImpactoTerror(score: number): string {
  if (score >= 90) return "Obra Maestra del Terror Contemporáneo";
  if (score >= 75) return "Éxito Taquillero Aclamado";
  if (score >= 60) return "Película Recomendada de Culto";
  return "Estándar de Catálogo";
}

function procesarCatalogoTerror(peliculas: readonly FichaPeliculaTerror[]): readonly ResumenCatalogoTerror[] {
  return peliculas
    .filter(validarPeliculaCatalogo)
    .map(pelicula => {
      const score = calcularIndiceTerror(pelicula);
      return {
        pelicula: `${pelicula.titulo} - Dir. ${pelicula.director} [${pelicula.peliculaId}]`,
        subgenero: pelicula.subgenero,
        duracionFormato: formatearDuracionHoras(pelicula.duracionMinutos),
        nivelTerrorScore: score,
        categoriaExhibicion: clasificarImpactoTerror(score),
      };
    })
    .sort((a, b) => b.nivelTerrorScore - a.nivelTerrorScore);
}

function imprimirReporteTerror(titulo: string, resumen: readonly ResumenCatalogoTerror[]): void {
  console.log(`=== [CATÁLOGO DE PELÍCULAS DE MIEDO] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. ${item.pelicula} (${item.subgenero}) | Duración: ${item.duracionFormato} | Score: ${item.nivelTerrorScore} | Categoría: ${item.categoriaExhibicion}`
    );
  });
  console.log("========================================================================\n");
}

const catalogoOficialEstreno = procesarCatalogoTerror(videotecaNocturna);
imprimirReporteTerror("Ranking de Películas en Exhibición Nocturna", catalogoOficialEstreno);

// Caso: Obra experimental de terror psicológico con duración extensa y aclamación crítica máxima
const peliculaCasoExtremo: readonly FichaPeliculaTerror[] = [
  {
    peliculaId: "HOR-999",
    titulo: "The Endless Labyrinth",
    director: "Vaelen Voss",
    subgenero: "Psychological",
    duracionMinutos: 155,
    calificacionRottenTomatoes: 98,
    recaudacionMillonesUSD: 5.2,
    estado: "Culto Clasico",
  }
];

const resultadoExtremo = procesarCatalogoTerror(peliculaCasoExtremo);
imprimirReporteTerror("Caso: Película de Culto Experimental Extensa", resultadoExtremo);