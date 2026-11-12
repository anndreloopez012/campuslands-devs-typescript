
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions y Literales)

export type GeneroMusical =
    | 'Rock'
    | 'Pop'
    | 'Metal'
    | 'Indie'
    | 'HipHop'
    | 'Electronica';

export type BloqueSetlist =
    | 'Apertura'
    | 'CuerpoPrincipal'
    | 'Acustico'
    | 'Climax'
    | 'Encore';

export type EstadoCancion =
    | 'Confirmada'
    | 'EnTensaEspera'
    | 'Opcional'
    | 'Descartada';

export interface CancionConcierto {
    readonly id: string;
    readonly titulo: string;
    readonly album: string;
    readonly duracionSegundos: number;
    readonly bpm: number;
    readonly genero: GeneroMusical;
    readonly bloque: BloqueSetlist;
    readonly esSingle: boolean;
    readonly estado: EstadoCancion;
}

export interface SetlistConcierto {
    readonly id: string;
    readonly nombreTour: string;
    readonly artista: string;
    readonly recinto: string;
    readonly ciudad: string;
    readonly fecha: string;
    readonly duracionMaxMinutos: number;
    readonly canciones: readonly CancionConcierto[];
}

export interface MetricasSetlist {
    readonly totalCanciones: number;
    readonly cancionesConfirmadas: number;
    readonly duracionTotalSegundos: number;
    readonly duracionTotalMinutos: number;
    readonly bpmPromedio: number;
    readonly porcentajeSingles: number;
    readonly cancionMasLarga: CancionConcierto | null;
    readonly cancionMasCorta: CancionConcierto | null;
    readonly desglosePorBloque: Readonly<Record<BloqueSetlist, number>>;
    readonly desglosePorGenero: Readonly<Record<GeneroMusical, number>>;
}

export interface ResumenSetlistConcierto {
    readonly setlistId: string;
    readonly nombreTour: string;
    readonly artista: string;
    readonly totalCancionesValidas: number;
    readonly metricas: MetricasSetlist;
    readonly cancionesProcesadas: readonly CancionConcierto[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. TYPE GUARDS Y FUNCIONES DE VALIDACIÓN DE DOMINIO

export function formatearDuracion(segundos: number): string {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins}:${segs.toString().padStart(2, '0')}`;
}

export function validarCancion(cancion: CancionConcierto): ResultadoValidacion<CancionConcierto> {
    const errores: string[] = [];

    if (cancion.duracionSegundos <= 0 || cancion.duracionSegundos > 1200) {
        errores.push(`Duracion invalida (${cancion.duracionSegundos}s) para la cancion "${cancion.titulo}".`);
    }

    if (cancion.bpm < 40 || cancion.bpm > 250) {
        errores.push(`BPM fuera de rango (${cancion.bpm}) en "${cancion.titulo}".`);
    }

    if (cancion.titulo.trim().length === 0) {
        errores.push('La cancion debe registrar un titulo valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: cancion }
        : { esValido: false, errores };
}

export function validarSetlistRaw(setlist: SetlistConcierto): readonly string[] {
    const advertencias: string[] = [];
    const idsCanciones = new Set<string>();

    if (setlist.duracionMaxMinutos <= 0) {
        advertencias.push(`Duracion maxima del concierto invalida (${setlist.duracionMaxMinutos} min).`);
    }

    if (setlist.canciones.length === 0) {
        advertencias.push(`El setlist para "${setlist.nombreTour}" no contiene canciones registradas.`);
    }

    for (const c of setlist.canciones) {
        if (idsCanciones.has(c.id)) {
            advertencias.push(`Cancion duplicada detectada por ID: ${c.id} (${c.titulo}).`);
        }
        idsCanciones.add(c.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce, Record y Union Types)

const BLOQUES_SETLIST: readonly BloqueSetlist[] = [
    'Apertura',
    'CuerpoPrincipal',
    'Acustico',
    'Climax',
    'Encore'
];

const GENEROS_MUSICALES: readonly GeneroMusical[] = [
    'Rock',
    'Pop',
    'Metal',
    'Indie',
    'HipHop',
    'Electronica'
];

export function calcularMetricasSetlist(
    canciones: readonly CancionConcierto[],
    duracionMaxMinutos: number
): MetricasSetlist {
    if (canciones.length === 0) {
        const desgloseBloqueVacio = BLOQUES_SETLIST.reduce((acc, b) => {
            acc[b] = 0;
            return acc;
        }, {} as Record<BloqueSetlist, number>);

        const desgloseGeneroVacio = GENEROS_MUSICALES.reduce((acc, g) => {
            acc[g] = 0;
            return acc;
        }, {} as Record<GeneroMusical, number>);

        return {
            totalCanciones: 0,
            cancionesConfirmadas: 0,
            duracionTotalSegundos: 0,
            duracionTotalMinutos: 0,
            bpmPromedio: 0,
            porcentajeSingles: 0,
            cancionMasLarga: null,
            cancionMasCorta: null,
            desglosePorBloque: desgloseBloqueVacio,
            desglosePorGenero: desgloseGeneroVacio
        };
    }

    const cancionesConfirmadas = canciones.filter((c) => c.estado === 'Confirmada').length;

    const duracionTotalSegundos = canciones.reduce((acc, c) => acc + c.duracionSegundos, 0);
    const duracionTotalMinutos = Number((duracionTotalSegundos / 60).toFixed(1));

    const sumaBpm = canciones.reduce((acc, c) => acc + c.bpm, 0);
    const bpmPromedio = Math.round(sumaBpm / canciones.length);

    const totalSingles = canciones.filter((c) => c.esSingle).length;
    const porcentajeSingles = Number(((totalSingles / canciones.length) * 100).toFixed(1));

    const cancionesOrdenadasPorDuracion = [...canciones].sort(
        (a, b) => b.duracionSegundos - a.duracionSegundos
    );

    const cancionMasLarga = cancionesOrdenadasPorDuracion[0] ?? null;
    const cancionMasCorta = cancionesOrdenadasPorDuracion[cancionesOrdenadasPorDuracion.length - 1] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorBloque = canciones.reduce((acc, c) => {
        acc[c.bloque] = (acc[c.bloque] ?? 0) + 1;
        return acc;
    }, BLOQUES_SETLIST.reduce((acc, b) => ({ ...acc, [b]: 0 }), {} as Record<BloqueSetlist, number>));

    const desglosePorGenero = canciones.reduce((acc, c) => {
        acc[c.genero] = (acc[c.genero] ?? 0) + 1;
        return acc;
    }, GENEROS_MUSICALES.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<GeneroMusical, number>));

    return {
        totalCanciones: canciones.length,
        cancionesConfirmadas,
        duracionTotalSegundos,
        duracionTotalMinutos,
        bpmPromedio,
        porcentajeSingles,
        cancionMasLarga,
        cancionMasCorta,
        desglosePorBloque,
        desglosePorGenero
    };
}

export function procesarSetlistConcierto(setlistRaw: SetlistConcierto): ResumenSetlistConcierto {
    const advertencias: string[] = [...validarSetlistRaw(setlistRaw)];
    const cancionesValidas: CancionConcierto[] = [];

    for (const rawCancion of setlistRaw.canciones) {
        const res = validarCancion(rawCancion);
        if (res.esValido) {
            cancionesValidas.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasSetlist(cancionesValidas, setlistRaw.duracionMaxMinutos);

    if (metricas.duracionTotalMinutos > setlistRaw.duracionMaxMinutos) {
        advertencias.push(
            `Exceso de duracion: El setlist (${metricas.duracionTotalMinutos} min) supera el tiempo maximo del recinto (${setlistRaw.duracionMaxMinutos} min).`
        );
    }

    return {
        setlistId: setlistRaw.id,
        nombreTour: setlistRaw.nombreTour,
        artista: setlistRaw.artista,
        totalCancionesValidas: cancionesValidas.length,
        metricas,
        cancionesProcesadas: cancionesValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenSetlist(resumen: ResumenSetlistConcierto, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` SETLIST DE CONCIERTO - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Artista / Tour      : ${resumen.artista} - "${resumen.nombreTour}"`);
    console.log(`Canciones Validadas : ${resumen.totalCancionesValidas}`);
    console.log(`Duracion Total      : ${resumen.metricas.duracionTotalMinutos} min (${formatearDuracion(resumen.metricas.duracionTotalSegundos)})`);
    console.log(`BPM Promedio        : ${resumen.metricas.bpmPromedio} BPM`);
    console.log(`Porcentaje Singles  : ${resumen.metricas.porcentajeSingles}%`);
    console.log(`Cancion Mas Larga   : ${resumen.metricas.cancionMasLarga ? `${resumen.metricas.cancionMasLarga.titulo} (${formatearDuracion(resumen.metricas.cancionMasLarga.duracionSegundos)})` : 'N/A'}`);
    console.log(`Cancion Mas Corta   : ${resumen.metricas.cancionMasCorta ? `${resumen.metricas.cancionMasCorta.titulo} (${formatearDuracion(resumen.metricas.cancionMasCorta.duracionSegundos)})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE SETLIST (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR BLOQUE DEL SHOW:`);
    Object.entries(resumen.metricas.desglosePorBloque).forEach(([bloque, cantidad]) => {
        console.log(`   - ${bloque.padEnd(18)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.cancionesProcesadas.map((c, idx) => ({
            '#': idx + 1,
            Titulo: c.titulo,
            Album: c.album,
            Bloque: c.bloque,
            Genero: c.genero,
            'Duracion': formatearDuracion(c.duracionSegundos),
            BPM: c.bpm,
            Single: c.esSingle ? 'Si' : 'No',
            Estado: c.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const c1: CancionConcierto = { id: 's-01', titulo: 'The Pretender', album: 'Echoes, Silence, Patience & Grace', duracionSegundos: 269, bpm: 173, genero: 'Rock', bloque: 'Apertura', esSingle: true, estado: 'Confirmada' };
const c2: CancionConcierto = { id: 's-02', titulo: 'Learn to Fly', album: 'There Is Nothing Left to Lose', duracionSegundos: 235, bpm: 136, genero: 'Rock', bloque: 'CuerpoPrincipal', esSingle: true, estado: 'Confirmada' };
const c3: CancionConcierto = { id: 's-03', titulo: 'My Hero (Acoustic)', album: 'The Colour and the Shape', duracionSegundos: 250, bpm: 78, genero: 'Indie', bloque: 'Acustico', esSingle: false, estado: 'Confirmada' };
const c4: CancionConcierto = { id: 's-04', titulo: 'Best of You', album: 'In Your Honor', duracionSegundos: 256, bpm: 130, genero: 'Rock', bloque: 'Climax', esSingle: true, estado: 'Confirmada' };
const c5: CancionConcierto = { id: 's-05', titulo: 'Everlong', album: 'The Colour and the Shape', duracionSegundos: 250, bpm: 158, genero: 'Rock', bloque: 'Encore', esSingle: true, estado: 'Confirmada' };

// --- CASO 1: Tour Mundial de Rock (Caso Normal) ---
const setlistNormal: SetlistConcierto = {
    id: 'SET-FF-2026',
    nombreTour: 'Everything or Nothing at All Tour 2026',
    artista: 'Foo Fighters',
    recinto: 'Estadio El Campín',
    ciudad: 'Bogotá',
    fecha: '2026-11-15',
    duracionMaxMinutos: 120,
    canciones: [c1, c2, c3, c4, c5]
};

// --- CASO 2: Duración Excesiva, BPM fuera de Rango y Canción Duplicada (Caso Límite) ---
const cancionCorrupta: CancionConcierto = { id: 's-99', titulo: 'Jam Invalido', album: 'Demo', duracionSegundos: 1500, bpm: 300, genero: 'Metal', bloque: 'CuerpoPrincipal', esSingle: false, estado: 'Opcional' };

const setlistLimiteCorrupto: SetlistConcierto = {
    id: 'SET-FAIL-02',
    nombreTour: 'Tour Con Excesos',
    artista: 'Grupo Prueba',
    recinto: 'Teatro Pequeño',
    ciudad: 'Ciudad de Guatemala',
    fecha: '2026-12-01',
    duracionMaxMinutos: 15, // Tiempo maximo de 15 min -> Exceso de duracion
    canciones: [
        c1,
        cancionCorrupta, // BPM 300 y duracion 1500s -> Invalido
        c1 // ID duplicado
    ]
};

// Ejecución
const resumenNormal = procesarSetlistConcierto(setlistNormal);
mostrarResumenSetlist(resumenNormal, 'Caso Normal - Foo Fighters World Tour');

const resumenLimite = procesarSetlistConcierto(setlistLimiteCorrupto);
mostrarResumenSetlist(resumenLimite, 'Caso Limite - BPM Invalido y Exceso de Tiempo');