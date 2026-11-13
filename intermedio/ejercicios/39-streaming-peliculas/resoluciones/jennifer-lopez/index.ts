export {};

type GeneroCinematografico = 'Ciencia Ficcion' | 'Thriller Psicologico' | 'Drama' | 'Animacion' | 'Documental';
type EstadoCatalogoStreaming = 'Disponible' | 'EstrenoExclusivo' | 'Proximamente' | 'LicenciaExpirada';

interface FichaPeliculaStreaming {
  readonly peliculaId: string;
  readonly titulo: string;
  readonly director: string;
  readonly anioEstreno: number;
  readonly genero: GeneroCinematografico;
  readonly duracionMinutos: number;
  readonly calificacionCritica: number;
  readonly reproduccionesMes: number;
  estado: EstadoCatalogoStreaming;
}

interface ResumenRecomendacionStreaming {
  readonly posicionTop: number;
  readonly identificador: string;
  readonly obra: string;
  readonly genero: GeneroCinematografico;
  readonly indiceAfinidad: number;
  readonly etiquetaSugerencia: string;
}

const catalogoPlataformaGlobal: readonly FichaPeliculaStreaming[] = [
  {
    peliculaId: "MOV-3901",
    titulo: "Horizonte de Eventos",
    director: "Denis Villeneuve",
    anioEstreno: 2024,
    genero: "Ciencia Ficcion",
    duracionMinutos: 158,
    calificacionCritica: 9.2,
    reproduccionesMes: 4850000,
    estado: "EstrenoExclusivo",
  },
  {
    peliculaId: "MOV-3902",
    titulo: "El Laberinto de Cristal",
    director: "Bong Joon-ho",
    anioEstreno: 2022,
    genero: "Thriller Psicologico",
    duracionMinutos: 134,
    calificacionCritica: 8.9,
    reproduccionesMes: 3200000,
    estado: "Disponible",
  },
  {
    peliculaId: "MOV-3903",
    titulo: "Crónicas del Viento Estelar",
    director: "Makoto Shinkai",
    anioEstreno: 2023,
    genero: "Animacion",
    duracionMinutos: 122,
    calificacionCritica: 8.7,
    reproduccionesMes: 2950000,
    estado: "Disponible",
  },
  {
    peliculaId: "MOV-3904",
    titulo: "Ecos en la Niebla",
    director: "Céline Sciamma",
    anioEstreno: 2021,
    genero: "Drama",
    duracionMinutos: 118,
    calificacionCritica: 8.4,
    reproduccionesMes: 1450000,
    estado: "Disponible",
  },
  {
    peliculaId: "MOV-3905",
    titulo: "Océanos Profundos 4K",
    director: "Alastair Fothergill",
    anioEstreno: 2025,
    genero: "Documental",
    duracionMinutos: 95,
    calificacionCritica: 9.0,
    reproduccionesMes: 1900000,
    estado: "EstrenoExclusivo",
  },
  {
    peliculaId: "MOV-3906",
    titulo: "Sombras del Ayer",
    director: "David Fincher",
    anioEstreno: 2018,
    genero: "Thriller Psicologico",
    duracionMinutos: 142,
    calificacionCritica: 7.9,
    reproduccionesMes: 850000,
    estado: "LicenciaExpirada",
  }
];

function validarPeliculaReproducible(pelicula: FichaPeliculaStreaming): boolean {
  return (
    (pelicula.estado === "Disponible" || pelicula.estado === "EstrenoExclusivo") &&
    pelicula.duracionMinutos > 0 &&
    pelicula.calificacionCritica >= 0
  );
}

function calcularIndiceAfinidad(pelicula: FichaPeliculaStreaming, generoPreferido: GeneroCinematografico): number {
  const baseCritica = pelicula.calificacionCritica * 8;
  const bonoGenero = pelicula.genero === generoPreferido ? 18 : 0;
  const bonoPopularidad = Math.min(10, pelicula.reproduccionesMes / 500000);
  const bonoEstreno = pelicula.estado === "EstrenoExclusivo" ? 5 : 0;
  const puntajeTotal = Math.min(100, baseCritica + bonoGenero + bonoPopularidad + bonoEstreno);
  return Number(puntajeTotal.toFixed(1));
}

function clasificarSugerenciaUsuario(afinidad: number, estado: EstadoCatalogoStreaming): string {
  if (afinidad >= 90) return "Match Imperdible (Top 1% del Catálogo)";
  if (estado === "EstrenoExclusivo") return "Novedad Destacada Recomendada";
  if (afinidad >= 75) return "Alta Compatibilidad con tu Perfil";
  return "Sugerencia Complementaria";
}

function generarRecomendacionesStreaming(
  catalogo: readonly FichaPeliculaStreaming[],
  generoFavorito: GeneroCinematografico
): readonly ResumenRecomendacionStreaming[] {
  const peliculasActivas = catalogo.filter(validarPeliculaReproducible);

  const evaluadas = peliculasActivas
    .map(pelicula => {
      const afinidad = calcularIndiceAfinidad(pelicula, generoFavorito);
      return {
        identificador: pelicula.peliculaId,
        obra: `${pelicula.titulo} (${pelicula.anioEstreno}) - Dir. ${pelicula.director}`,
        genero: pelicula.genero,
        indiceAfinidad: afinidad,
        etiquetaSugerencia: clasificarSugerenciaUsuario(afinidad, pelicula.estado),
      };
    })
    .sort((a, b) => b.indiceAfinidad - a.indiceAfinidad);

  return evaluadas.map((item, indice) => ({
    posicionTop: indice + 1,
    ...item,
  }));
}

function imprimirReporteRecomendador(titulo: string, recomendaciones: readonly ResumenRecomendacionStreaming[]): void {
  console.log(`=== [RECOMENDADOR DE STREAMING] ${titulo} ===`);
  recomendaciones.forEach(item => {
    console.log(
      `#${item.posicionTop} [${item.identificador}] ${item.obra} | Género: ${item.genero} | Afinidad: ${item.indiceAfinidad}% | Sugerencia: ${item.etiquetaSugerencia}`
    );
  });
  console.log("=================================================================================\n");
}

const recomendacionesPerfilSciFi = generarRecomendacionesStreaming(catalogoPlataformaGlobal, "Ciencia Ficcion");
imprimirReporteRecomendador("Top Personalizado para Perfil Ciencia Ficción", recomendacionesPerfilSciFi);

// Caso: Maratón cinematográfico épico de más de 4 horas con puntuación perfecta de crítica y audiencia masiva
const peliculaCasoLimite: readonly FichaPeliculaStreaming[] = [
  {
    peliculaId: "MOV-9999",
    titulo: "La Odisea Galáctica: Edición del Director",
    director: "Christopher Nolan",
    anioEstreno: 2026,
    genero: "Ciencia Ficcion",
    duracionMinutos: 248,
    calificacionCritica: 9.9,
    reproduccionesMes: 18500000,
    estado: "EstrenoExclusivo",
  }
];

const resultadoLimite = generarRecomendacionesStreaming(peliculaCasoLimite, "Ciencia Ficcion");
imprimirReporteRecomendador("Caso: Producción Épica Extendida de Afinidad Máxima", resultadoLimite);