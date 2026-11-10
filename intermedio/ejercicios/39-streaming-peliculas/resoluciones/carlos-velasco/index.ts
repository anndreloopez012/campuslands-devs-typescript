export {};

// tipos
type GeneroPelicula = 'accion' | 'comedia' | 'drama' | 'sci-fi';

interface Pelicula {
  readonly titulo: string;
  genero: GeneroPelicula;
  anio: number;
  calificacion: number;
}

interface PreferenciasUsuario {
  readonly usuario: string;
  generosFavoritos: GeneroPelicula[];
  anioMinimo: number;
}

// clases
class RecomendadorStreaming {
  private readonly catalogo: Pelicula[];

  constructor(catalogo: Pelicula[]) {
    this.catalogo = [...catalogo];
  }

  recomendaciones(preferencias: PreferenciasUsuario, limite: number): Pelicula[] {
    return this.catalogo
      .filter((pelicula) => preferencias.generosFavoritos.includes(pelicula.genero))
      .filter((pelicula) => pelicula.anio >= preferencias.anioMinimo)
      .filter((pelicula) => pelicula.calificacion > 0)
      .sort((a, b) => b.calificacion - a.calificacion)
      .slice(0, limite);
  }

  generosDisponibles(): GeneroPelicula[] {
    return [...new Set(this.catalogo.map((pelicula) => pelicula.genero))];
  }

  porGenero(genero: GeneroPelicula): Pelicula[] {
    return this.catalogo.filter((pelicula) => pelicula.genero === genero);
  }
}

// generics
function agruparPor<T, K extends string>(items: T[], clave: (item: T) => K): Record<K, T[]> {
  return items.reduce<Record<K, T[]>>((grupos, item) => {
    const grupo = clave(item);
    (grupos[grupo] ??= []).push(item);
    return grupos;
  }, {} as Record<K, T[]>);
}

// datos
const catalogo: Pelicula[] = [
  { titulo: 'Impacto Final', genero: 'accion', anio: 2022, calificacion: 8.1 },
  { titulo: 'Codigo Neptuno', genero: 'sci-fi', anio: 2024, calificacion: 8.9 },
  { titulo: 'Risas de Verano', genero: 'comedia', anio: 2021, calificacion: 6.5 },
  { titulo: 'El Ultimo Faro', genero: 'drama', anio: 2023, calificacion: 7.8 },
  { titulo: 'Marea Solar', genero: 'sci-fi', anio: 2019, calificacion: 7.2 },
];

const preferencias: PreferenciasUsuario = { usuario: 'Velas', generosFavoritos: ['sci-fi', 'accion'], anioMinimo: 2020 };

// salida
function mostrarResumen(catalogo: Pelicula[], preferencias: PreferenciasUsuario): void {
  console.log('=== Recomendador de streaming ===');
  const recomendador = new RecomendadorStreaming(catalogo);

  console.log(`Recomendaciones para ${preferencias.usuario}:`);
  recomendador.recomendaciones(preferencias, 3).forEach((pelicula, indice) => {
    console.log(`${indice + 1}. ${pelicula.titulo} (${pelicula.genero}, ${pelicula.anio}) | Nota: ${pelicula.calificacion}`);
  });
  console.log('Generos disponibles:', recomendador.generosDisponibles().join(', '));

  const grupos = agruparPor(catalogo, (pelicula) => pelicula.genero);
  Object.entries(grupos).forEach(([genero, peliculas]) => {
    console.log(`${genero}: ${peliculas.length} titulos`);
  });
}

mostrarResumen(catalogo, preferencias);
