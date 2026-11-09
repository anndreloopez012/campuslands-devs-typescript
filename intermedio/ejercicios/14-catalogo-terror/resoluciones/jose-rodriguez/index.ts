
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type SubgeneroTerror =
    | 'Slasher'
    | 'Paranormal'
    | 'Gore'
    | 'Psicologico'
    | 'Monstruos'
    | 'FoundFootage';

export type ClasificacionEdad = 'PG-13' | 'R' | 'NC-17' | 'Unrated';

export interface PeliculaTerror {
    readonly id: string;
    readonly titulo: string;
    readonly director: string;
    readonly anioEstreno: number;
    readonly subgenero: SubgeneroTerror;
    readonly clasificacion: ClasificacionEdad;
    readonly duracionMinutos: number;
    readonly calificacionImdb: number; // Evaluacion de 0.0 a 10.0
    readonly presupuestoUSD: number;
    readonly recaudacionUSD: number;
}

export interface MetricasCatalogoTerror {
    readonly totalPeliculas: number;
    readonly promedioCalificacionImdb: number;
    readonly duracionPromedioMinutos: number;
    readonly peliculaMejorValorada: PeliculaTerror | null;
    readonly recaudacionTotalUSD: number;
    readonly retornoInversionPromedioPct: number;
    readonly desglosePorSubgenero: Readonly<Record<SubgeneroTerror, number>>;
}

export interface ResumenCatalogoTerror {
    readonly totalPeliculasValidas: number;
    readonly metricas: MetricasCatalogoTerror;
    readonly peliculasProcesadas: readonly PeliculaTerror[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarPeliculaTerror(pelicula: PeliculaTerror): ResultadoValidacion<PeliculaTerror> {
    const errores: string[] = [];

    if (pelicula.calificacionImdb < 0 || pelicula.calificacionImdb > 10) {
        errores.push(`La pelicula "${pelicula.titulo}" tiene una calificacion IMDb invalida (${pelicula.calificacionImdb}).`);
    }

    if (pelicula.duracionMinutos <= 0 || pelicula.duracionMinutos > 360) {
        errores.push(`La duracion de "${pelicula.titulo}" esta fuera del rango permitido (${pelicula.duracionMinutos} min).`);
    }

    if (pelicula.anioEstreno < 1895 || pelicula.anioEstreno > 2030) {
        errores.push(`El anio de estreno (${pelicula.anioEstreno}) de "${pelicula.titulo}" es invalido.`);
    }

    if (pelicula.presupuestoUSD < 0 || pelicula.recaudacionUSD < 0) {
        errores.push(`Los valores financieros de "${pelicula.titulo}" no pueden ser negativos.`);
    }

    if (pelicula.titulo.trim().length === 0 || pelicula.director.trim().length === 0) {
        errores.push('La pelicula debe incluir un titulo y director validos.');
    }

    return errores.length === 0
        ? { esValido: true, datos: pelicula }
        : { esValido: false, errores };
}

export function validarCatalogoRaw(peliculas: readonly PeliculaTerror[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (peliculas.length === 0) {
        advertencias.push('El catalogo de terror no contiene peliculas registradas.');
    }

    for (const pelicula of peliculas) {
        if (idsVistos.has(pelicula.id)) {
            advertencias.push(`Registro duplicado detectado: "${pelicula.titulo}" (ID: ${pelicula.id}).`);
        }
        idsVistos.add(pelicula.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS

const SUBGENEROS_DISPONIBLES: readonly SubgeneroTerror[] = [
    'Slasher',
    'Paranormal',
    'Gore',
    'Psicologico',
    'Monstruos',
    'FoundFootage'
];

export function calcularMetricasCatalogo(peliculas: readonly PeliculaTerror[]): MetricasCatalogoTerror {
    if (peliculas.length === 0) {
        const desgloseVacio = SUBGENEROS_DISPONIBLES.reduce((acc, sub) => {
            acc[sub] = 0;
            return acc;
        }, {} as Record<SubgeneroTerror, number>);

        return {
            totalPeliculas: 0,
            promedioCalificacionImdb: 0,
            duracionPromedioMinutos: 0,
            peliculaMejorValorada: null,
            recaudacionTotalUSD: 0,
            retornoInversionPromedioPct: 0,
            desglosePorSubgenero: desgloseVacio
        };
    }

    const sumaCalificacion = peliculas.reduce((acc, p) => acc + p.calificacionImdb, 0);
    const promedioCalificacionImdb = Number((sumaCalificacion / peliculas.length).toFixed(1));

    const sumaDuracion = peliculas.reduce((acc, p) => acc + p.duracionMinutos, 0);
    const duracionPromedioMinutos = Number((sumaDuracion / peliculas.length).toFixed(0));

    const recaudacionTotalUSD = Number(
        peliculas.reduce((acc, p) => acc + p.recaudacionUSD, 0).toFixed(2)
    );

    const peliculaMejorValorada = [...peliculas].sort(
        (a, b) => b.calificacionImdb - a.calificacionImdb
    )[0] ?? null;

    const sumaRetornos = peliculas.reduce((acc, p) => {
        if (p.presupuestoUSD <= 0) return acc;
        const retorno = ((p.recaudacionUSD - p.presupuestoUSD) / p.presupuestoUSD) * 100;
        return acc + retorno;
    }, 0);

    const peliculasConPresupuesto = peliculas.filter((p) => p.presupuestoUSD > 0).length;
    const retornoInversionPromedioPct = peliculasConPresupuesto > 0
        ? Number((sumaRetornos / peliculasConPresupuesto).toFixed(1))
        : 0;

    const desglosePorSubgenero = peliculas.reduce((acc, p) => {
        acc[p.subgenero] = (acc[p.subgenero] ?? 0) + 1;
        return acc;
    }, SUBGENEROS_DISPONIBLES.reduce((acc, sub) => ({ ...acc, [sub]: 0 }), {} as Record<SubgeneroTerror, number>));

    return {
        totalPeliculas: peliculas.length,
        promedioCalificacionImdb,
        duracionPromedioMinutos,
        peliculaMejorValorada,
        recaudacionTotalUSD,
        retornoInversionPromedioPct,
        desglosePorSubgenero
    };
}

export function procesarCatalogoTerror(peliculasRaw: readonly PeliculaTerror[]): ResumenCatalogoTerror {
    const advertencias: string[] = [...validarCatalogoRaw(peliculasRaw)];
    const peliculasValidas: PeliculaTerror[] = [];

    for (const raw of peliculasRaw) {
        const res = validarPeliculaTerror(raw);
        if (res.esValido) {
            peliculasValidas.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasCatalogo(peliculasValidas);

    return {
        totalPeliculasValidas: peliculasValidas.length,
        metricas,
        peliculasProcesadas: peliculasValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenCatalogoTerror(resumen: ResumenCatalogoTerror, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` CATALOGO DE PELICULAS DE TERROR - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Peliculas Validadas : ${resumen.totalPeliculasValidas}`);
    console.log(`Promedio IMDb       : ${resumen.metricas.promedioCalificacionImdb} / 10.0`);
    console.log(`Duracion Promedio   : ${resumen.metricas.duracionPromedioMinutos} min`);
    console.log(`Recaudacion Total   : $${resumen.metricas.recaudacionTotalUSD.toLocaleString()}`);
    console.log(`ROI Promedio        : ${resumen.metricas.retornoInversionPromedioPct}%`);
    console.log(`Mejor Valorada      : ${resumen.metricas.peliculaMejorValorada ? `${resumen.metricas.peliculaMejorValorada.titulo} (${resumen.metricas.peliculaMejorValorada.calificacionImdb} IMDb)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE CATALOGO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR SUBGENERO:`);
    Object.entries(resumen.metricas.desglosePorSubgenero).forEach(([subgenero, cantidad]) => {
        console.log(`   - ${subgenero.padEnd(14)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.peliculasProcesadas.map((p) => ({
            ID: p.id,
            Titulo: p.titulo,
            Director: p.director,
            Anio: p.anioEstreno,
            Subgenero: p.subgenero,
            Clasif: p.clasificacion,
            Duracion: `${p.duracionMinutos}m`,
            IMDb: p.calificacionImdb,
            Presupuesto: `$${p.presupuestoUSD.toLocaleString()}`,
            Recaudacion: `$${p.recaudacionUSD.toLocaleString()}`
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: Catálogo Clásico y Moderno de Cine de Terror (Caso Normal) ---
const catalogoTerrorNormal: readonly PeliculaTerror[] = [
    {
        id: 'MOV-001',
        titulo: 'El Resplandor',
        director: 'Stanley Kubrick',
        anioEstreno: 1980,
        subgenero: 'Psicologico',
        clasificacion: 'R',
        duracionMinutos: 146,
        calificacionImdb: 8.4,
        presupuestoUSD: 19000000,
        recaudacionUSD: 47300000
    },
    {
        id: 'MOV-002',
        titulo: 'Hereditary',
        director: 'Ari Aster',
        anioEstreno: 2018,
        subgenero: 'Paranormal',
        clasificacion: 'R',
        duracionMinutos: 127,
        calificacionImdb: 7.3,
        presupuestoUSD: 10000000,
        recaudacionUSD: 82800000
    },
    {
        id: 'MOV-003',
        titulo: 'Scream',
        director: 'Wes Craven',
        anioEstreno: 1996,
        subgenero: 'Slasher',
        clasificacion: 'R',
        duracionMinutos: 111,
        calificacionImdb: 7.4,
        presupuestoUSD: 15000000,
        recaudacionUSD: 173000000
    },
    {
        id: 'MOV-004',
        titulo: 'El Proyecto de la Bruja de Blair',
        director: 'Daniel Myrick',
        anioEstreno: 1999,
        subgenero: 'FoundFootage',
        clasificacion: 'R',
        duracionMinutos: 81,
        calificacionImdb: 6.5,
        presupuestoUSD: 60000,
        recaudacionUSD: 248600000
    }
];

// --- CASO 2: Puntuación Fuera de Rango, Duración Negativa e ID Duplicado (Caso Límite) ---
const catalogoTerrorLimite: readonly PeliculaTerror[] = [
    {
        id: 'MOV-005',
        titulo: 'Pelicula Con Rating Invalido',
        director: 'Director Anonimo',
        anioEstreno: 2024,
        subgenero: 'Gore',
        clasificacion: 'Unrated',
        duracionMinutos: 90,
        calificacionImdb: 11.5, // Rating fuera de rango (>10.0) -> Invalido
        presupuestoUSD: 500000,
        recaudacionUSD: 1000000
    },
    {
        id: 'MOV-006',
        titulo: 'Pelicula Duracion Negativa',
        director: 'Director Error',
        anioEstreno: 2023,
        subgenero: 'Monstruos',
        clasificacion: 'PG-13',
        duracionMinutos: -10, // Duracion negativa -> Invalido
        calificacionImdb: 5.0,
        presupuestoUSD: 2000000,
        recaudacionUSD: 0
    },
    {
        id: 'MOV-001', // ID Duplicado con El Resplandor
        titulo: 'El Resplandor Copia',
        director: 'Stanley Kubrick',
        anioEstreno: 1980,
        subgenero: 'Psicologico',
        clasificacion: 'R',
        duracionMinutos: 146,
        calificacionImdb: 8.4,
        presupuestoUSD: 19000000,
        recaudacionUSD: 47300000
    }
];

// Ejecución
const resumenNormal = procesarCatalogoTerror(catalogoTerrorNormal);
mostrarResumenCatalogoTerror(resumenNormal, 'Caso Normal - Seleccion de Grandes Exitos de Terror');

const resumenLimite = procesarCatalogoTerror(catalogoTerrorLimite);
mostrarResumenCatalogoTerror(resumenLimite, 'Caso Limite - Ratings Invalidos y Registros Duplicados');