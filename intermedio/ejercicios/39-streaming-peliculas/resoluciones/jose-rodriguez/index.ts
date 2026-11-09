
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions y Literales)

export type GeneroPelicula =
    | 'Accion'
    | 'CienciaFiccion'
    | 'Drama'
    | 'Comedia'
    | 'Terror'
    | 'Romance'
    | 'Animacion'
    | 'Documental';

export type ClasificacionEdad = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
export type PlataformaStreaming = 'Netflix' | 'PrimeVideo' | 'DisneyPlus' | 'HBO' | 'AppleTV';
export type CalidadStreaming = 'SD' | 'HD' | '4K_UHD';

export interface PeliculaStreaming {
    readonly id: string;
    readonly titulo: string;
    readonly director: string;
    readonly anioLanzamiento: number;
    readonly duracionMinutos: number;
    readonly generos: readonly GeneroPelicula[];
    readonly clasificacion: ClasificacionEdad;
    readonly calificacionImdb: number; // 0.0 a 10.0
    readonly plataformas: readonly PlataformaStreaming[];
    readonly esContenidoOriginal: boolean;
}

export interface PerfilUsuarioStreaming {
    readonly id: string;
    readonly nombre: string;
    readonly generosFavoritos: readonly GeneroPelicula[];
    readonly duracionMaximaMinutos: number;
    readonly plataformasSuscritas: readonly PlataformaStreaming[];
    readonly incluyeContenidoMaduro: boolean;
    readonly calificacionMinimaDeseada: number;
}

export interface RecomendacionPelicula {
    readonly pelicula: PeliculaStreaming;
    readonly puntajeCoincidencia: number; // 0 a 100
    readonly razonesRecomendacion: readonly string[];
    readonly plataformaDisponible: PlataformaStreaming | null;
}

export interface MetricasRecomendador {
    readonly totalPeliculasCatalogo: number;
    readonly peliculasRecomendadas: number;
    readonly porcentajeRecomendado: number;
    readonly calificacionPromedioCatalogo: number;
    readonly duracionPromedioMinutos: number;
    readonly mejorRecomendacion: RecomendacionPelicula | null;
    readonly desglosePorGenero: Readonly<Record<GeneroPelicula, number>>;
    readonly desglosePorPlataforma: Readonly<Record<PlataformaStreaming, number>>;
}

export interface ResumenRecomendacionesStreaming {
    readonly usuarioId: string;
    readonly usuarioNombre: string;
    readonly totalPeliculasValidas: number;
    readonly metricas: MetricasRecomendador;
    readonly recomendaciones: readonly RecomendacionPelicula[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. TYPE GUARDS Y FUNCIONES DE VALIDACIÓN DE DOMINIO

export function esContenidoAptoParaAptitud(
    clasificacion: ClasificacionEdad,
    permiteMaduro: boolean
): boolean {
    if (permiteMaduro) return true;
    return clasificacion === 'G' || clasificacion === 'PG' || clasificacion === 'PG-13';
}

export function validarPelicula(pelicula: PeliculaStreaming): ResultadoValidacion<PeliculaStreaming> {
    const errores: string[] = [];

    if (pelicula.anioLanzamiento < 1888 || pelicula.anioLanzamiento > 2027) {
        errores.push(`Año de lanzamiento invalido (${pelicula.anioLanzamiento}) para "${pelicula.titulo}".`);
    }

    if (pelicula.duracionMinutos <= 0 || pelicula.duracionMinutos > 600) {
        errores.push(`Duracion invalida (${pelicula.duracionMinutos} min) para "${pelicula.titulo}".`);
    }

    if (pelicula.calificacionImdb < 0 || pelicula.calificacionImdb > 10.0) {
        errores.push(`Calificacion IMDb fuera de rango (${pelicula.calificacionImdb}) en "${pelicula.titulo}".`);
    }

    if (pelicula.generos.length === 0) {
        errores.push(`La pelicula "${pelicula.titulo}" debe registrar al menos un genero.`);
    }

    if (pelicula.plataformas.length === 0) {
        errores.push(`La pelicula "${pelicula.titulo}" debe estar disponible en al menos una plataforma.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: pelicula }
        : { esValido: false, errores };
}

export function validarPerfilUsuario(perfil: PerfilUsuarioStreaming): ResultadoValidacion<PerfilUsuarioStreaming> {
    const errores: string[] = [];

    if (perfil.duracionMaximaMinutos <= 0) {
        errores.push(`Duracion maxima invalida (${perfil.duracionMaximaMinutos} min) para el usuario "${perfil.nombre}".`);
    }

    if (perfil.calificacionMinimaDeseada < 0 || perfil.calificacionMinimaDeseada > 10) {
        errores.push(`Calificacion minima deseada fuera de rango (${perfil.calificacionMinimaDeseada}) para "${perfil.nombre}".`);
    }

    if (perfil.generosFavoritos.length === 0) {
        errores.push(`El usuario "${perfil.nombre}" debe seleccionar al menos un genero favorito.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: perfil }
        : { esValido: false, errores };
}

export function validarCatalogoRaw(catalogo: readonly PeliculaStreaming[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (catalogo.length === 0) {
        advertencias.push('El catalogo de peliculas esta completamente vacio.');
    }

    for (const p of catalogo) {
        if (idsVistos.has(p.id)) {
            advertencias.push(`Pelicula duplicada detectada por ID: ${p.id} (${p.titulo}).`);
        }
        idsVistos.add(p.id);
    }

    return advertencias;
}

// 3. ALGORITMO DE RECOMENDACIÓN Y CÁLCULOS (reduce, Record, Math)

const GENEROS_PELICULA: readonly GeneroPelicula[] = [
    'Accion',
    'CienciaFiccion',
    'Drama',
    'Comedia',
    'Terror',
    'Romance',
    'Animacion',
    'Documental'
];

const PLATAFORMAS_STREAMING: readonly PlataformaStreaming[] = [
    'Netflix',
    'PrimeVideo',
    'DisneyPlus',
    'HBO',
    'AppleTV'
];

export function calcularCoincidencia(
    pelicula: PeliculaStreaming,
    perfil: PerfilUsuarioStreaming
): RecomendacionPelicula | null {
    // Filtros estrictos de exclusión
    if (!esContenidoAptoParaAptitud(pelicula.clasificacion, perfil.incluyeContenidoMaduro)) {
        return null;
    }

    if (pelicula.duracionMinutos > perfil.duracionMaximaMinutos) {
        return null;
    }

    if (pelicula.calificacionImdb < perfil.calificacionMinimaDeseada) {
        return null;
    }

    const plataformaCoincidente = pelicula.plataformas.find((plat) =>
        perfil.plataformasSuscritas.includes(plat)
    ) ?? null;

    if (!plataformaCoincidente && perfil.plataformasSuscritas.length > 0) {
        return null;
    }

    // Calculo de score (0 a 100)
    let puntaje = 0;
    const razones: string[] = [];

    // Coincidencia de géneros (hasta 40 pts)
    const generosComunes = pelicula.generos.filter((g) => perfil.generosFavoritos.includes(g));
    if (generosComunes.length > 0) {
        const ptsGenero = Math.min(40, generosComunes.length * 20);
        puntaje += ptsGenero;
        razones.push(`Coincide en genero(s) favorito(s): ${generosComunes.join(', ')}`);
    } else {
        return null; // Si no comparte ningún género favorito, se ignora
    }

    // Calidad IMDb (hasta 40 pts)
    const ptsImdb = Math.round((pelicula.calificacionImdb / 10) * 40);
    puntaje += ptsImdb;
    razones.push(`Alta calificacion en IMDb: ${pelicula.calificacionImdb}/10`);

    // Plataforma disponible (10 pts)
    if (plataformaCoincidente) {
        puntaje += 10;
        razones.push(`Disponible en tu servicio suscrito: ${plataformaCoincidente}`);
    }

    // Bonificación Original / Reciente (10 pts)
    if (pelicula.esContenidoOriginal) {
        puntaje += 5;
        razones.push('Contenido original exclusivo');
    }
    if (pelicula.anioLanzamiento >= 2022) {
        puntaje += 5;
        razones.push('Estreno reciente');
    }

    return {
        pelicula,
        puntajeCoincidencia: Math.min(100, puntaje),
        razonesRecomendacion: razones,
        plataformaDisponible: plataformaCoincidente
    };
}

export function calcularMetricasRecomendaciones(
    catalogo: readonly PeliculaStreaming[],
    recomendaciones: readonly RecomendacionPelicula[]
): MetricasRecomendador {
    if (catalogo.length === 0) {
        const desgloseGeneroVacio = GENEROS_PELICULA.reduce((acc, g) => {
            acc[g] = 0;
            return acc;
        }, {} as Record<GeneroPelicula, number>);

        const desglosePlataformaVacio = PLATAFORMAS_STREAMING.reduce((acc, p) => {
            acc[p] = 0;
            return acc;
        }, {} as Record<PlataformaStreaming, number>);

        return {
            totalPeliculasCatalogo: 0,
            peliculasRecomendadas: 0,
            porcentajeRecomendado: 0,
            calificacionPromedioCatalogo: 0,
            duracionPromedioMinutos: 0,
            mejorRecomendacion: null,
            desglosePorGenero: desgloseGeneroVacio,
            desglosePorPlataforma: desglosePlataformaVacio
        };
    }

    const cantidadRecomendadas = recomendaciones.length;
    const porcentajeRecomendado = Number(((cantidadRecomendadas / catalogo.length) * 100).toFixed(1));

    const sumaImdb = catalogo.reduce((acc, p) => acc + p.calificacionImdb, 0);
    const calificacionPromedioCatalogo = Number((sumaImdb / catalogo.length).toFixed(1));

    const sumaDuracion = catalogo.reduce((acc, p) => acc + p.duracionMinutos, 0);
    const duracionPromedioMinutos = Math.round(sumaDuracion / catalogo.length);

    const mejorRecomendacion = [...recomendaciones].sort(
        (a, b) => b.puntajeCoincidencia - a.puntajeCoincidencia
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorGenero = catalogo.reduce((acc, p) => {
        p.generos.forEach((g) => {
            acc[g] = (acc[g] ?? 0) + 1;
        });
        return acc;
    }, GENEROS_PELICULA.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<GeneroPelicula, number>));

    const desglosePorPlataforma = catalogo.reduce((acc, p) => {
        p.plataformas.forEach((plat) => {
            acc[plat] = (acc[plat] ?? 0) + 1;
        });
        return acc;
    }, PLATAFORMAS_STREAMING.reduce((acc, plat) => ({ ...acc, [plat]: 0 }), {} as Record<PlataformaStreaming, number>));

    return {
        totalPeliculasCatalogo: catalogo.length,
        peliculasRecomendadas: cantidadRecomendadas,
        porcentajeRecomendado,
        calificacionPromedioCatalogo,
        duracionPromedioMinutos,
        mejorRecomendacion,
        desglosePorGenero,
        desglosePorPlataforma
    };
}

export function obtenerRecomendacionesStreaming(
    catalogoRaw: readonly PeliculaStreaming[],
    perfilRaw: PerfilUsuarioStreaming
): ResumenRecomendacionesStreaming {
    const advertencias: string[] = [...validarCatalogoRaw(catalogoRaw)];
    const resPerfil = validarPerfilUsuario(perfilRaw);

    if (!resPerfil.esValido) {
        advertencias.push(...resPerfil.errores);
    }

    const peliculasValidas: PeliculaStreaming[] = [];
    for (const rawPeli of catalogoRaw) {
        const resPeli = validarPelicula(rawPeli);
        if (resPeli.esValido) {
            peliculasValidas.push(resPeli.datos);
        } else {
            advertencias.push(...resPeli.errores);
        }
    }

    const recomendaciones: RecomendacionPelicula[] = [];
    if (resPerfil.esValido) {
        for (const peli of peliculasValidas) {
            const rec = calcularCoincidencia(peli, resPerfil.datos);
            if (rec) {
                recomendaciones.push(rec);
            }
        }
    }

    // Ordenar por score descendente
    recomendaciones.sort((a, b) => b.puntajeCoincidencia - a.puntajeCoincidencia);

    const metricas = calcularMetricasRecomendaciones(peliculasValidas, recomendaciones);

    return {
        usuarioId: perfilRaw.id,
        usuarioNombre: perfilRaw.nombre,
        totalPeliculasValidas: peliculasValidas.length,
        metricas,
        recomendaciones,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenRecomendaciones(
    resumen: ResumenRecomendacionesStreaming,
    tituloCaso: string
): void {
    console.log(`\n======================================================================`);
    console.log(` RECOMENDADOR DE STREAMING - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Usuario Target      : ${resumen.usuarioNombre}`);
    console.log(`Peliculas Catalogo  : ${resumen.totalPeliculasValidas}`);
    console.log(`Peliculas Match     : ${resumen.metricas.peliculasRecomendadas} (${resumen.metricas.porcentajeRecomendado}% match del catalogo)`);
    console.log(`IMDb Prom. Catalogo : ${resumen.metricas.calificacionPromedioCatalogo}/10`);
    console.log(`Duracion Promedio   : ${resumen.metricas.duracionPromedioMinutos} min`);
    console.log(`Top Recomendacion   : ${resumen.metricas.mejorRecomendacion ? `"${resumen.metricas.mejorRecomendacion.pelicula.titulo}" (${resumen.metricas.mejorRecomendacion.puntajeCoincidencia}% Match)` : 'Sin recomendaciones'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE RECOMENDACION (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DEL CATALOGO POR PLATAFORMA:`);
    Object.entries(resumen.metricas.desglosePorPlataforma).forEach(([plat, cantidad]) => {
        console.log(`   - ${plat.padEnd(14)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.recomendaciones.map((r) => ({
            Score: `${r.puntajeCoincidencia}%`,
            Pelicula: r.pelicula.titulo,
            'IMDb': `${r.pelicula.calificacionImdb}/10`,
            Duracion: `${r.pelicula.duracionMinutos} min`,
            Clasificacion: r.pelicula.clasificacion,
            Plataforma: r.plataformaDisponible ?? 'Otras',
            Razones: r.razonesRecomendacion.join(' | ')
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const peliInception: PeliculaStreaming = {
    id: 'm-01',
    titulo: 'Inception',
    director: 'Christopher Nolan',
    anioLanzamiento: 2010,
    duracionMinutos: 148,
    generos: ['CienciaFiccion', 'Accion'],
    clasificacion: 'PG-13',
    calificacionImdb: 8.8,
    plataformas: ['HBO', 'PrimeVideo'],
    esContenidoOriginal: false
};

const peliInterstellar: PeliculaStreaming = {
    id: 'm-02',
    titulo: 'Interstellar',
    director: 'Christopher Nolan',
    anioLanzamiento: 2014,
    duracionMinutos: 169,
    generos: ['CienciaFiccion', 'Drama'],
    clasificacion: 'PG-13',
    calificacionImdb: 8.7,
    plataformas: ['PrimeVideo', 'AppleTV'],
    esContenidoOriginal: false
};

const peliSpiderVerse: PeliculaStreaming = {
    id: 'm-03',
    titulo: 'Spider-Man: Across the Spider-Verse',
    director: 'Joaquim Dos Santos',
    anioLanzamiento: 2023,
    duracionMinutos: 140,
    generos: ['Animacion', 'Accion', 'CienciaFiccion'],
    clasificacion: 'PG',
    calificacionImdb: 8.7,
    plataformas: ['HBO', 'Netflix'],
    esContenidoOriginal: false
};

const peliPulpFiction: PeliculaStreaming = {
    id: 'm-04',
    titulo: 'Pulp Fiction',
    director: 'Quentin Tarantino',
    anioLanzamiento: 1994,
    duracionMinutos: 154,
    generos: ['Drama', 'Accion'],
    clasificacion: 'R',
    calificacionImdb: 8.9,
    plataformas: ['Netflix'],
    esContenidoOriginal: false
};

// --- CASO 1: Perfil Fan de Ciencia Ficción y Acción (Caso Normal) ---
const perfilNormal: PerfilUsuarioStreaming = {
    id: 'user-01',
    nombre: 'Jose Rodriguez',
    generosFavoritos: ['CienciaFiccion', 'Accion'],
    duracionMaximaMinutos: 180,
    plataformasSuscritas: ['HBO', 'PrimeVideo'],
    incluyeContenidoMaduro: true,
    calificacionMinimaDeseada: 8.0
};

const catalogoNormal: readonly PeliculaStreaming[] = [
    peliInception,
    peliInterstellar,
    peliSpiderVerse,
    peliPulpFiction
];

// --- CASO 2: Duración Excesiva, Duración Negativa y Perfil sin Géneros (Caso Límite) ---
const peliCorrupta: PeliculaStreaming = {
    id: 'm-99',
    titulo: 'Pelicula Error Duracion',
    director: 'Desconocido',
    anioLanzamiento: 1800, // Año invalido (< 1888)
    duracionMinutos: -120, // Duracion negativa -> Invalida
    generos: [], // Sin generos -> Invalida
    clasificacion: 'NC-17',
    calificacionImdb: 11.5, // IMDb > 10 -> Invalida
    plataformas: [], // Sin plataformas -> Invalida
    esContenidoOriginal: false
};

const perfilLimiteCorrupto: PerfilUsuarioStreaming = {
    id: 'user-99',
    nombre: 'Usuario Restringido Error',
    generosFavoritos: [], // Sin generos favoritos -> Invalido
    duracionMaximaMinutos: 90, // Ninguna pelicula del catalogo entra por tiempo
    plataformasSuscritas: ['DisneyPlus'],
    incluyeContenidoMaduro: false,
    calificacionMinimaDeseada: 9.5
};

const catalogoLimiteCorrupto: readonly PeliculaStreaming[] = [
    peliInception,
    peliCorrupta, // Datos corruptos
    peliInception // ID duplicado
];

// Ejecución
const resumenNormal = obtenerRecomendacionesStreaming(catalogoNormal, perfilNormal);
mostrarResumenRecomendaciones(resumenNormal, 'Caso Normal - Recomendaciones Sci-Fi / Accion');

const resumenLimite = obtenerRecomendacionesStreaming(catalogoLimiteCorrupto, perfilLimiteCorrupto);
mostrarResumenRecomendaciones(resumenLimite, 'Caso Limite - Catalogo Corrupto y Perfil Sin Generos');