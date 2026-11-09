
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type GeneroMusical = 'Electronic' | 'Rock' | 'Pop' | 'HipHop' | 'Jazz' | 'Indie';

export interface Cancion {
    readonly id: string;
    readonly titulo: string;
    readonly artista: string;
    readonly album: string;
    readonly duracionSegundos: number;
    readonly bpm: number;
    readonly genero: GeneroMusical;
    readonly explicita: boolean;
}

export interface PlaylistDJ {
    readonly id: string;
    readonly titulo: string;
    readonly djCreador: string;
    readonly limiteDuracionSegundos: number;
    readonly canciones: readonly Cancion[];
}

export interface MetricasPlaylist {
    readonly duracionTotalSegundos: number;
    readonly duracionPromedioSegundos: number;
    readonly bpmPromedio: number;
    readonly cancionMasLarga: Cancion | null;
    readonly cancionMasCorta: Cancion | null;
    readonly desglosePorGenero: Readonly<Record<GeneroMusical, number>>;
}

export interface ResumenCuracionPlaylist {
    readonly playlistId: string;
    readonly titulo: string;
    readonly djCreador: string;
    readonly totalCancionesValidas: number;
    readonly metricas: MetricasPlaylist;
    readonly cancionesProcesadas: readonly Cancion[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarCancion(cancion: Cancion): ResultadoValidacion<Cancion> {
    const errores: string[] = [];

    if (cancion.duracionSegundos <= 0 || cancion.duracionSegundos > 1800) {
        errores.push(`La cancion "${cancion.titulo}" contiene una duracion invalida (${cancion.duracionSegundos}s).`);
    }

    if (cancion.bpm <= 0 || cancion.bpm > 300) {
        errores.push(`El BPM de la cancion "${cancion.titulo}" esta fuera del rango operativo de mezcla (${cancion.bpm} BPM).`);
    }

    if (cancion.titulo.trim().length === 0 || cancion.artista.trim().length === 0) {
        errores.push('La cancion debe registrar un titulo y artista validos.');
    }

    return errores.length === 0
        ? { esValido: true, datos: cancion }
        : { esValido: false, errores };
}

export function validarPlaylist(playlist: PlaylistDJ): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (playlist.canciones.length === 0) {
        advertencias.push('La playlist no contiene ninguna cancion asignada.');
    }

    for (const cancion of playlist.canciones) {
        if (idsVistos.has(cancion.id)) {
            advertencias.push(`Cancion duplicada detectada: "${cancion.titulo}" (ID: ${cancion.id}).`);
        }
        idsVistos.add(cancion.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS

const GENEROS_DISPONIBLES: readonly GeneroMusical[] = [
    'Electronic',
    'Rock',
    'Pop',
    'HipHop',
    'Jazz',
    'Indie'
];

export function calcularMetricasPlaylist(canciones: readonly Cancion[]): MetricasPlaylist {
    if (canciones.length === 0) {
        const desgloseVacio = GENEROS_DISPONIBLES.reduce((acc, genero) => {
            acc[genero] = 0;
            return acc;
        }, {} as Record<GeneroMusical, number>);

        return {
            duracionTotalSegundos: 0,
            duracionPromedioSegundos: 0,
            bpmPromedio: 0,
            cancionMasLarga: null,
            cancionMasCorta: null,
            desglosePorGenero: desgloseVacio
        };
    }

    const duracionTotalSegundos = canciones.reduce((acc, c) => acc + c.duracionSegundos, 0);
    const duracionPromedioSegundos = Number((duracionTotalSegundos / canciones.length).toFixed(0));

    const sumaBpm = canciones.reduce((acc, c) => acc + c.bpm, 0);
    const bpmPromedio = Number((sumaBpm / canciones.length).toFixed(1));

    const cancionMasLarga = [...canciones].sort((a, b) => b.duracionSegundos - a.duracionSegundos)[0] ?? null;
    const cancionMasCorta = [...canciones].sort((a, b) => a.duracionSegundos - b.duracionSegundos)[0] ?? null;

    const desglosePorGenero = canciones.reduce((acc, c) => {
        acc[c.genero] = (acc[c.genero] ?? 0) + 1;
        return acc;
    }, GENEROS_DISPONIBLES.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<GeneroMusical, number>));

    return {
        duracionTotalSegundos,
        duracionPromedioSegundos,
        bpmPromedio,
        cancionMasLarga,
        cancionMasCorta,
        desglosePorGenero
    };
}

export function procesarCuracionPlaylist(playlistRaw: PlaylistDJ): ResumenCuracionPlaylist {
    const advertencias: string[] = [...validarPlaylist(playlistRaw)];
    const cancionesValidas: Cancion[] = [];

    for (const raw of playlistRaw.canciones) {
        const res = validarCancion(raw);
        if (res.esValido) {
            cancionesValidas.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasPlaylist(cancionesValidas);

    if (metricas.duracionTotalSegundos > playlistRaw.limiteDuracionSegundos) {
        advertencias.push(
            `Duracion excedida: La playlist suma ${formatearDuracion(metricas.duracionTotalSegundos)} superando el limite de ${formatearDuracion(playlistRaw.limiteDuracionSegundos)}.`
        );
    }

    return {
        playlistId: playlistRaw.id,
        titulo: playlistRaw.titulo,
        djCreador: playlistRaw.djCreador,
        totalCancionesValidas: cancionesValidas.length,
        metricas,
        cancionesProcesadas: cancionesValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function formatearDuracion(segundosTotales: number): string {
    if (segundosTotales <= 0) return '00:00';
    const minutos = Math.floor(segundosTotales / 60);
    const segundos = segundosTotales % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

export function mostrarResumenPlaylist(resumen: ResumenCuracionPlaylist, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` CURADOR DE PLAYLIST DJ - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Playlist            : ${resumen.titulo}`);
    console.log(`DJ Creador          : ${resumen.djCreador}`);
    console.log(`Canciones Validadas : ${resumen.totalCancionesValidas}`);
    console.log(`Duracion Total      : ${formatearDuracion(resumen.metricas.duracionTotalSegundos)} (Promedio: ${formatearDuracion(resumen.metricas.duracionPromedioSegundos)})`);
    console.log(`BPM Promedio        : ${resumen.metricas.bpmPromedio} BPM`);
    console.log(`Cancion Mas Larga   : ${resumen.metricas.cancionMasLarga ? `${resumen.metricas.cancionMasLarga.titulo} (${formatearDuracion(resumen.metricas.cancionMasLarga.duracionSegundos)})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE CURACION (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR GENERO MUSICAL:`);
    Object.entries(resumen.metricas.desglosePorGenero).forEach(([genero, cantidad]) => {
        console.log(`   - ${genero.padEnd(12)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.cancionesProcesadas.map((c) => ({
            ID: c.id,
            Titulo: c.titulo,
            Artista: c.artista,
            Genero: c.genero,
            BPM: c.bpm,
            Duracion: formatearDuracion(c.duracionSegundos),
            Explicita: c.explicita ? 'SI' : 'NO'
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: Set de DJ Electrónico / House (Caso Normal) ---
const playlistNormal: PlaylistDJ = {
    id: 'PL-ELECTRO-01',
    titulo: 'Deep House Sunset Session',
    djCreador: 'DJ Nora En Pure',
    limiteDuracionSegundos: 3600, // 60 minutos
    canciones: [
        {
            id: 'track-01',
            titulo: 'Spire',
            artista: 'Monolink',
            album: 'Under Dark',
            duracionSegundos: 285,
            bpm: 122,
            genero: 'Electronic',
            explicita: false
        },
        {
            id: 'track-02',
            titulo: 'Opus',
            artista: 'Eric Prydz',
            album: 'Opus',
            duracionSegundos: 543,
            bpm: 126,
            genero: 'Electronic',
            explicita: false
        },
        {
            id: 'track-03',
            titulo: 'Innerbloom',
            artista: 'RUFUS DU SOL',
            album: 'Bloom',
            duracionSegundos: 578,
            bpm: 120,
            genero: 'Indie',
            explicita: false
        },
        {
            id: 'track-04',
            titulo: 'Cola',
            artista: 'CamelPhat',
            album: 'Cola EP',
            duracionSegundos: 223,
            bpm: 124,
            genero: 'Electronic',
            explicita: false
        }
    ]
};

// --- CASO 2: BPM Inválido, ID Duplicado y Exceso de Tiempo (Caso Límite) ---
const playlistLimite: PlaylistDJ = {
    id: 'PL-FAIL-02',
    titulo: 'Mix Erroneo Club',
    djCreador: 'DJ Inexperto',
    limiteDuracionSegundos: 300, // Limite corto de 5 minutos
    canciones: [
        {
            id: 'track-05',
            titulo: 'Track BPM Imposible',
            artista: 'Desconocido',
            album: 'Demo',
            duracionSegundos: 200,
            bpm: 450, // BPM fuera de rango (>300) -> Invalido
            genero: 'Rock',
            explicita: false
        },
        {
            id: 'track-06',
            titulo: 'Track Sin Tiempo',
            artista: 'Desconocido',
            album: 'Demo',
            duracionSegundos: 0, // Duracion 0 -> Invalido
            bpm: 128,
            genero: 'Pop',
            explicita: false
        },
        {
            id: 'track-01', // ID Duplicado con track-01
            titulo: 'Spire Copia',
            artista: 'Monolink',
            album: 'Under Dark',
            duracionSegundos: 285,
            bpm: 122,
            genero: 'Electronic',
            explicita: false
        }
    ]
};

// Ejecución
const resumenNormal = procesarCuracionPlaylist(playlistNormal);
mostrarResumenPlaylist(resumenNormal, 'Caso Normal - Deep House Sunset Session');

const resumenLimite = procesarCuracionPlaylist(playlistLimite);
mostrarResumenPlaylist(resumenLimite, 'Caso Limite - BPM Invalido y Canciones Duplicadas');