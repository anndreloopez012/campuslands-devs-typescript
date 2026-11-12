
// 1. MODELADO DEL DOMINIO CON UNIONES DISCRIMINADAS (Discriminated Unions)

export type GeneroMusical =
    | 'Synthwave'
    | 'Electronica'
    | 'Rock'
    | 'Pop'
    | 'HipHop'
    | 'Jazz';

export type ModoRepeticion =
    | 'SinRepeticion'
    | 'RepetirPlaylist'
    | 'RepetirPista';

export type CalidadAudio =
    | 'Estandar128kbps'
    | 'Alta320kbps'
    | 'LosslessFLAC';

export interface Cancion {
    readonly id: string;
    readonly codigoPista: string;
    readonly titulo: string;
    readonly artista: string;
    readonly album: string;
    readonly genero: GeneroMusical;
    readonly duracionSegundos: number;
    readonly bpm: number;
    readonly calidad: CalidadAudio;
    readonly esExplicita: boolean;
    readonly esFavorita: boolean;
}

export interface ConfiguracionPlaylist {
    readonly id: string;
    readonly codigoPlaylist: string;
    readonly nombrePlaylist: string;
    readonly curador: string;
    readonly permitirContenidoExplicito: boolean;
    readonly modoRepeticionInicial: ModoRepeticion;
    readonly aleatorioActivoInicial: boolean;
}

// Discriminated Unions para el Estado del Reproductor (State Machine)
export type EstadoReproductor =
    | {
        readonly estado: 'Detenido';
        readonly indiceActual: -1;
        readonly progresoSegundos: 0;
        readonly modoRepeticion: ModoRepeticion;
        readonly aleatorioActivo: boolean;
        readonly tiempoTotalEscuchadoSec: number;
        readonly historialReproducidasIds: readonly string[];
    }
    | {
        readonly estado: 'Reproduciendo';
        readonly cancionActual: Cancion;
        readonly indiceActual: number;
        readonly progresoSegundos: number;
        readonly modoRepeticion: ModoRepeticion;
        readonly aleatorioActivo: boolean;
        readonly tiempoTotalEscuchadoSec: number;
        readonly historialReproducidasIds: readonly string[];
    }
    | {
        readonly estado: 'Pausado';
        readonly cancionActual: Cancion;
        readonly indiceActual: number;
        readonly progresoSegundos: number;
        readonly motivoPausa: string;
        readonly modoRepeticion: ModoRepeticion;
        readonly aleatorioActivo: boolean;
        readonly tiempoTotalEscuchadoSec: number;
        readonly historialReproducidasIds: readonly string[];
    }
    | {
        readonly estado: 'PlaylistFinalizada';
        readonly totalPistasCompletadas: number;
        readonly modoRepeticion: ModoRepeticion;
        readonly aleatorioActivo: boolean;
        readonly tiempoTotalEscuchadoSec: number;
        readonly historialReproducidasIds: readonly string[];
    }
    | {
        readonly estado: 'ErrorReproduccion';
        readonly codigoError: string;
        readonly mensajeError: string;
        readonly modoRepeticion: ModoRepeticion;
        readonly aleatorioActivo: boolean;
        readonly tiempoTotalEscuchadoSec: number;
        readonly historialReproducidasIds: readonly string[];
    };

// Discriminated Unions para los Eventos / Acciones del Reducer
export type AccionReproductor =
    | { readonly tipo: 'REPRODUCIR'; readonly indice?: number }
    | { readonly tipo: 'PAUSAR'; readonly motivo: string }
    | { readonly tipo: 'AVANZAR_TIEMPO'; readonly deltaSegundos: number }
    | { readonly tipo: 'SIGUIENTE_PISTA' }
    | { readonly tipo: 'PISTA_ANTERIOR' }
    | { readonly tipo: 'CAMBIAR_MODO_REPETICION'; readonly modo: ModoRepeticion }
    | { readonly tipo: 'ALTERNAR_ALEATORIO' }
    | { readonly tipo: 'TOGGLE_FAVORITA'; readonly cancionId: string }
    | { readonly tipo: 'DETENER' };

export interface MetricasPlaylist {
    readonly totalCancionesValidas: number;
    readonly duracionTotalSegundos: number;
    readonly duracionFormateada: string;
    readonly duracionPromedioSegundos: number;
    readonly bpmPromedio: number;
    readonly totalFavoritas: number;
    readonly pistasUnicasReproducidas: number;
    readonly tiempoTotalEscuchadoSec: number;
    readonly cancionMasLarga: Cancion | null;
    readonly cancionMayorBPM: Cancion | null;
    readonly desglosePorGenero: Readonly<Record<GeneroMusical, number>>;
    readonly desglosePorCalidad: Readonly<Record<CalidadAudio, number>>;
}

export interface ResumenPlaylistInteractiva {
    readonly ejecucionId: string;
    readonly configuracion: ConfiguracionPlaylist;
    readonly totalCancionesValidas: number;
    readonly metricas: MetricasPlaylist;
    readonly cancionesProcesadas: readonly Cancion[];
    readonly estadoFinalReproductor: EstadoReproductor;
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO DE PISTAS (Generics & Encapsulamiento)

export class ContenedorPlaylist<T extends { readonly id: string; readonly codigoPista: string }> {
    private readonly elementos: Map<string, T> = new Map();

    public agregar(item: T): boolean {
        if (this.elementos.has(item.id)) {
            return false;
        }
        this.elementos.set(item.id, item);
        return true;
    }

    public obtenerPorId(id: string): T | undefined {
        return this.elementos.get(id);
    }

    public obtenerTodos(): readonly T[] {
        return Array.from(this.elementos.values());
    }

    public existe(id: string): boolean {
        return this.elementos.has(id);
    }

    public obtenerTamano(): number {
        return this.elementos.size;
    }
}

// 3. VALIDACIONES Y REGLAS DE NEGOCIO MUSICAL

export function validarCancion(
    cancion: Cancion,
    permitirExplicito: boolean
): ResultadoValidacion<Cancion> {
    const errores: string[] = [];

    if (cancion.titulo.trim().length === 0 || cancion.artista.trim().length === 0) {
        errores.push(`La pista "${cancion.codigoPista}" debe tener título y artista válidos.`);
    }

    if (cancion.duracionSegundos <= 0 || cancion.duracionSegundos > 3600) {
        errores.push(
            `Duración fuera de rango (${cancion.duracionSegundos}s) en "${cancion.titulo}" (${cancion.codigoPista}).`
        );
    }

    if (cancion.bpm < 40 || cancion.bpm > 260) {
        errores.push(
            `Tempo BPM inválido (${cancion.bpm} BPM) en "${cancion.titulo}" (${cancion.codigoPista}).`
        );
    }

    if (!permitirExplicito && cancion.esExplicita) {
        errores.push(
            `Filtro parental activo: Se omitió "${cancion.titulo}" de ${cancion.artista} por contenido explícito.`
        );
    }

    return errores.length === 0
        ? { esValido: true, datos: cancion }
        : { esValido: false, errores };
}

export function formatearSegundosAMinutos(segundosTotales: number): string {
    const minutos = Math.floor(segundosTotales / 60);
    const segundos = Math.floor(segundosTotales % 60);
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

// 4. MÁQUINA DE ESTADOS Y REDUCER DEL REPRODUCTOR INTERACTIVO

function calcularSiguienteIndice(
    indiceActual: number,
    totalPistas: number,
    aleatorioActivo: boolean
): number {
    if (totalPistas <= 1) return 0;
    if (!aleatorioActivo) return indiceActual + 1;
    // Selección determinista/controlada distinta al índice actual para evitar repetición inmediata
    return (indiceActual + 2) % totalPistas;
}

export function reducerReproductorPlaylist(
    estadoActual: EstadoReproductor,
    accion: AccionReproductor,
    playlist: readonly Cancion[]
): { readonly nuevoEstado: EstadoReproductor; readonly playlistActualizada: readonly Cancion[] } {
    if (playlist.length === 0 && accion.tipo !== 'CAMBIAR_MODO_REPETICION' && accion.tipo !== 'ALTERNAR_ALEATORIO') {
        return {
            nuevoEstado: {
                estado: 'ErrorReproduccion',
                codigoError: 'PLAYLIST_VACIA',
                mensajeError: 'No existen pistas válidas disponibles para reproducir en la playlist.',
                modoRepeticion: estadoActual.modoRepeticion,
                aleatorioActivo: estadoActual.aleatorioActivo,
                tiempoTotalEscuchadoSec: estadoActual.tiempoTotalEscuchadoSec,
                historialReproducidasIds: estadoActual.historialReproducidasIds
            },
            playlistActualizada: playlist
        };
    }

    switch (accion.tipo) {
        case 'REPRODUCIR': {
            if (estadoActual.estado === 'Pausado' && accion.indice === undefined) {
                return {
                    nuevoEstado: {
                        estado: 'Reproduciendo',
                        cancionActual: estadoActual.cancionActual,
                        indiceActual: estadoActual.indiceActual,
                        progresoSegundos: estadoActual.progresoSegundos,
                        modoRepeticion: estadoActual.modoRepeticion,
                        aleatorioActivo: estadoActual.aleatorioActivo,
                        tiempoTotalEscuchadoSec: estadoActual.tiempoTotalEscuchadoSec,
                        historialReproducidasIds: estadoActual.historialReproducidasIds
                    },
                    playlistActualizada: playlist
                };
            }

            const indiceObjetivo =
                accion.indice !== undefined && accion.indice >= 0 && accion.indice < playlist.length
                    ? accion.indice
                    : estadoActual.estado === 'Reproduciendo'
                        ? estadoActual.indiceActual
                        : 0;

            const cancion = playlist[indiceObjetivo];
            const nuevoHistorial = estadoActual.historialReproducidasIds.includes(cancion.id)
                ? estadoActual.historialReproducidasIds
                : [...estadoActual.historialReproducidasIds, cancion.id];

            return {
                nuevoEstado: {
                    estado: 'Reproduciendo',
                    cancionActual: cancion,
                    indiceActual: indiceObjetivo,
                    progresoSegundos: 0,
                    modoRepeticion: estadoActual.modoRepeticion,
                    aleatorioActivo: estadoActual.aleatorioActivo,
                    tiempoTotalEscuchadoSec: estadoActual.tiempoTotalEscuchadoSec,
                    historialReproducidasIds: nuevoHistorial
                },
                playlistActualizada: playlist
            };
        }

        case 'PAUSAR': {
            if (estadoActual.estado !== 'Reproduciendo') {
                return { nuevoEstado: estadoActual, playlistActualizada: playlist };
            }

            return {
                nuevoEstado: {
                    estado: 'Pausado',
                    cancionActual: estadoActual.cancionActual,
                    indiceActual: estadoActual.indiceActual,
                    progresoSegundos: estadoActual.progresoSegundos,
                    motivoPausa: accion.motivo,
                    modoRepeticion: estadoActual.modoRepeticion,
                    aleatorioActivo: estadoActual.aleatorioActivo,
                    tiempoTotalEscuchadoSec: estadoActual.tiempoTotalEscuchadoSec,
                    historialReproducidasIds: estadoActual.historialReproducidasIds
                },
                playlistActualizada: playlist
            };
        }

        case 'AVANZAR_TIEMPO': {
            if (estadoActual.estado !== 'Reproduciendo') {
                return { nuevoEstado: estadoActual, playlistActualizada: playlist };
            }

            const duracionPista = estadoActual.cancionActual.duracionSegundos;
            const tiempoRestantePista = duracionPista - estadoActual.progresoSegundos;
            const tiempoEfectivoAvanzado = Math.min(accion.deltaSegundos, tiempoRestantePista);
            const nuevoProgreso = estadoActual.progresoSegundos + tiempoEfectivoAvanzado;
            const nuevoTotalEscuchado = estadoActual.tiempoTotalEscuchadoSec + tiempoEfectivoAvanzado;

            // Si aún no termina la canción actual
            if (nuevoProgreso < duracionPista) {
                return {
                    nuevoEstado: {
                        ...estadoActual,
                        progresoSegundos: nuevoProgreso,
                        tiempoTotalEscuchadoSec: nuevoTotalEscuchado
                    },
                    playlistActualizada: playlist
                };
            }

            // Canción completada: evaluar modo de repetición
            if (estadoActual.modoRepeticion === 'RepetirPista') {
                return {
                    nuevoEstado: {
                        ...estadoActual,
                        progresoSegundos: 0,
                        tiempoTotalEscuchadoSec: nuevoTotalEscuchado
                    },
                    playlistActualizada: playlist
                };
            }

            const siguienteIndice = calcularSiguienteIndice(
                estadoActual.indiceActual,
                playlist.length,
                estadoActual.aleatorioActivo
            );

            if (siguienteIndice >= playlist.length) {
                if (estadoActual.modoRepeticion === 'RepetirPlaylist') {
                    const primeraCancion = playlist[0];
                    const nuevoHistorial = estadoActual.historialReproducidasIds.includes(primeraCancion.id)
                        ? estadoActual.historialReproducidasIds
                        : [...estadoActual.historialReproducidasIds, primeraCancion.id];

                    return {
                        nuevoEstado: {
                            estado: 'Reproduciendo',
                            cancionActual: primeraCancion,
                            indiceActual: 0,
                            progresoSegundos: 0,
                            modoRepeticion: estadoActual.modoRepeticion,
                            aleatorioActivo: estadoActual.aleatorioActivo,
                            tiempoTotalEscuchadoSec: nuevoTotalEscuchado,
                            historialReproducidasIds: nuevoHistorial
                        },
                        playlistActualizada: playlist
                    };
                }

                return {
                    nuevoEstado: {
                        estado: 'PlaylistFinalizada',
                        totalPistasCompletadas: estadoActual.historialReproducidasIds.length,
                        modoRepeticion: estadoActual.modoRepeticion,
                        aleatorioActivo: estadoActual.aleatorioActivo,
                        tiempoTotalEscuchadoSec: nuevoTotalEscuchado,
                        historialReproducidasIds: estadoActual.historialReproducidasIds
                    },
                    playlistActualizada: playlist
                };
            }

            const siguienteCancion = playlist[siguienteIndice];
            const historialActualizado = estadoActual.historialReproducidasIds.includes(siguienteCancion.id)
                ? estadoActual.historialReproducidasIds
                : [...estadoActual.historialReproducidasIds, siguienteCancion.id];

            return {
                nuevoEstado: {
                    estado: 'Reproduciendo',
                    cancionActual: siguienteCancion,
                    indiceActual: siguienteIndice,
                    progresoSegundos: 0,
                    modoRepeticion: estadoActual.modoRepeticion,
                    aleatorioActivo: estadoActual.aleatorioActivo,
                    tiempoTotalEscuchadoSec: nuevoTotalEscuchado,
                    historialReproducidasIds: historialActualizado
                },
                playlistActualizada: playlist
            };
        }

        case 'SIGUIENTE_PISTA': {
            const indiceBase =
                estadoActual.estado === 'Reproduciendo' || estadoActual.estado === 'Pausado'
                    ? estadoActual.indiceActual
                    : -1;

            const siguienteIndice = calcularSiguienteIndice(
                indiceBase,
                playlist.length,
                estadoActual.aleatorioActivo
            );

            if (siguienteIndice >= playlist.length) {
                if (estadoActual.modoRepeticion === 'RepetirPlaylist') {
                    return reducerReproductorPlaylist(estadoActual, { tipo: 'REPRODUCIR', indice: 0 }, playlist);
                }
                return {
                    nuevoEstado: {
                        estado: 'PlaylistFinalizada',
                        totalPistasCompletadas: estadoActual.historialReproducidasIds.length,
                        modoRepeticion: estadoActual.modoRepeticion,
                        aleatorioActivo: estadoActual.aleatorioActivo,
                        tiempoTotalEscuchadoSec: estadoActual.tiempoTotalEscuchadoSec,
                        historialReproducidasIds: estadoActual.historialReproducidasIds
                    },
                    playlistActualizada: playlist
                };
            }

            return reducerReproductorPlaylist(estadoActual, { tipo: 'REPRODUCIR', indice: siguienteIndice }, playlist);
        }

        case 'PISTA_ANTERIOR': {
            const indiceBase =
                estadoActual.estado === 'Reproduciendo' || estadoActual.estado === 'Pausado'
                    ? estadoActual.indiceActual
                    : 0;
            const indiceAnterior = Math.max(0, indiceBase - 1);
            return reducerReproductorPlaylist(estadoActual, { tipo: 'REPRODUCIR', indice: indiceAnterior }, playlist);
        }

        case 'CAMBIAR_MODO_REPETICION': {
            return {
                nuevoEstado: {
                    ...estadoActual,
                    modoRepeticion: accion.modo
                },
                playlistActualizada: playlist
            };
        }

        case 'ALTERNAR_ALEATORIO': {
            return {
                nuevoEstado: {
                    ...estadoActual,
                    aleatorioActivo: !estadoActual.aleatorioActivo
                },
                playlistActualizada: playlist
            };
        }

        case 'TOGGLE_FAVORITA': {
            const playlistActualizada = playlist.map((c) =>
                c.id === accion.cancionId ? { ...c, esFavorita: !c.esFavorita } : c
            );

            if (estadoActual.estado === 'Reproduciendo' || estadoActual.estado === 'Pausado') {
                const cancionActualizada =
                    playlistActualizada[estadoActual.indiceActual] ?? estadoActual.cancionActual;
                return {
                    nuevoEstado: {
                        ...estadoActual,
                        cancionActual: cancionActualizada
                    },
                    playlistActualizada
                };
            }

            return { nuevoEstado: estadoActual, playlistActualizada };
        }

        case 'DETENER': {
            return {
                nuevoEstado: {
                    estado: 'Detenido',
                    indiceActual: -1,
                    progresoSegundos: 0,
                    modoRepeticion: estadoActual.modoRepeticion,
                    aleatorioActivo: estadoActual.aleatorioActivo,
                    tiempoTotalEscuchadoSec: estadoActual.tiempoTotalEscuchadoSec,
                    historialReproducidasIds: estadoActual.historialReproducidasIds
                },
                playlistActualizada: playlist
            };
        }

        default:
            return { nuevoEstado: estadoActual, playlistActualizada: playlist };
    }
}

// 5. CÁLCULO DE MÉTRICAS DE PLAYLIST (reduce & Record)

const GENEROS_MUSICALES: readonly GeneroMusical[] = [
    'Synthwave',
    'Electronica',
    'Rock',
    'Pop',
    'HipHop',
    'Jazz'
];

const CALIDADES_AUDIO: readonly CalidadAudio[] = [
    'Estandar128kbps',
    'Alta320kbps',
    'LosslessFLAC'
];

export function calcularMetricasPlaylist(
    canciones: readonly Cancion[],
    estadoFinal: EstadoReproductor
): MetricasPlaylist {
    if (canciones.length === 0) {
        const desgloseGeneroVacio = GENEROS_MUSICALES.reduce(
            (acc, g) => ({ ...acc, [g]: 0 }),
            {} as Record<GeneroMusical, number>
        );
        const desgloseCalidadVacio = CALIDADES_AUDIO.reduce(
            (acc, c) => ({ ...acc, [c]: 0 }),
            {} as Record<CalidadAudio, number>
        );

        return {
            totalCancionesValidas: 0,
            duracionTotalSegundos: 0,
            duracionFormateada: '00:00',
            duracionPromedioSegundos: 0,
            bpmPromedio: 0,
            totalFavoritas: 0,
            pistasUnicasReproducidas: 0,
            tiempoTotalEscuchadoSec: estadoFinal.tiempoTotalEscuchadoSec,
            cancionMasLarga: null,
            cancionMayorBPM: null,
            desglosePorGenero: desgloseGeneroVacio,
            desglosePorCalidad: desgloseCalidadVacio
        };
    }

    const duracionTotalSegundos = canciones.reduce((acc, c) => acc + c.duracionSegundos, 0);
    const duracionPromedioSegundos = Math.round(duracionTotalSegundos / canciones.length);

    const sumaBPM = canciones.reduce((acc, c) => acc + c.bpm, 0);
    const bpmPromedio = Math.round(sumaBPM / canciones.length);

    const totalFavoritas = canciones.filter((c) => c.esFavorita).length;

    const cancionMasLarga = [...canciones].sort(
        (a, b) => b.duracionSegundos - a.duracionSegundos
    )[0] ?? null;

    const cancionMayorBPM = [...canciones].sort((a, b) => b.bpm - a.bpm)[0] ?? null;

    const desglosePorGenero = canciones.reduce((acc, c) => {
        acc[c.genero] = (acc[c.genero] ?? 0) + 1;
        return acc;
    }, GENEROS_MUSICALES.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<GeneroMusical, number>));

    const desglosePorCalidad = canciones.reduce((acc, c) => {
        acc[c.calidad] = (acc[c.calidad] ?? 0) + 1;
        return acc;
    }, CALIDADES_AUDIO.reduce((acc, cal) => ({ ...acc, [cal]: 0 }), {} as Record<CalidadAudio, number>));

    return {
        totalCancionesValidas: canciones.length,
        duracionTotalSegundos,
        duracionFormateada: formatearSegundosAMinutos(duracionTotalSegundos),
        duracionPromedioSegundos,
        bpmPromedio,
        totalFavoritas,
        pistasUnicasReproducidas: estadoFinal.historialReproducidasIds.length,
        tiempoTotalEscuchadoSec: estadoFinal.tiempoTotalEscuchadoSec,
        cancionMasLarga,
        cancionMayorBPM,
        desglosePorGenero,
        desglosePorCalidad
    };
}

export class ServicioPlaylistInteractiva {
    private readonly contenedor = new ContenedorPlaylist<Cancion>();

    public async procesarPlaylistAsync(
        config: ConfiguracionPlaylist,
        cancionesRaw: readonly Cancion[],
        accionesUsuario: readonly AccionReproductor[]
    ): Promise<ResumenPlaylistInteractiva> {
        const advertencias: string[] = [];

        // Simulación asíncrona de carga de metadatos y catálogo de streaming
        await new Promise((resolve) => setTimeout(resolve, 15));

        if (cancionesRaw.length === 0) {
            advertencias.push(`La playlist "${config.nombrePlaylist}" no contiene pistas registradas.`);
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        for (const pista of cancionesRaw) {
            const valRes = validarCancion(pista, config.permitirContenidoExplicito);
            if (!valRes.esValido) {
                advertencias.push(...valRes.errores);
            } else if (idsVistos.has(pista.id)) {
                advertencias.push(`Pista duplicada detectada por ID: "${pista.titulo}" (${pista.id}).`);
            } else if (codigosVistos.has(pista.codigoPista)) {
                advertencias.push(`Código de pista duplicado: ${pista.codigoPista}.`);
            } else {
                idsVistos.add(pista.id);
                codigosVistos.add(pista.codigoPista);
                this.contenedor.agregar(pista);
            }
        }

        let playlistActiva: readonly Cancion[] = this.contenedor.obtenerTodos();
        let estadoReproductor: EstadoReproductor = {
            estado: 'Detenido',
            indiceActual: -1,
            progresoSegundos: 0,
            modoRepeticion: config.modoRepeticionInicial,
            aleatorioActivo: config.aleatorioActivoInicial,
            tiempoTotalEscuchadoSec: 0,
            historialReproducidasIds: []
        };

        for (const accion of accionesUsuario) {
            const transicion = reducerReproductorPlaylist(estadoReproductor, accion, playlistActiva);
            estadoReproductor = transicion.nuevoEstado;
            playlistActiva = transicion.playlistActualizada;
        }

        if (estadoReproductor.estado === 'ErrorReproduccion') {
            advertencias.push(
                `Error de reproductor [${estadoReproductor.codigoError}]: ${estadoReproductor.mensajeError}`
            );
        }

        const metricas = calcularMetricasPlaylist(playlistActiva, estadoReproductor);

        return {
            ejecucionId: `PLAYLIST-EXEC-${Date.now()}`,
            configuracion: config,
            totalCancionesValidas: playlistActiva.length,
            metricas,
            cancionesProcesadas: playlistActiva,
            estadoFinalReproductor: estadoReproductor,
            advertencias
        };
    }
}

// 6. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenPlaylist(resumen: ResumenPlaylistInteractiva, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` PLAYLIST INTERACTIVA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Playlist            : ${resumen.configuracion.nombrePlaylist} (${resumen.configuracion.codigoPlaylist})`);
    console.log(`Curador             : ${resumen.configuracion.curador}`);
    console.log(`Pistas Validadas    : ${resumen.totalCancionesValidas} (Favoritas: ${resumen.metricas.totalFavoritas})`);
    console.log(`Duración Catálogo   : ${resumen.metricas.duracionFormateada} (${resumen.metricas.duracionTotalSegundos} s)`);
    console.log(`Tiempo Escuchado    : ${formatearSegundosAMinutos(resumen.metricas.tiempoTotalEscuchadoSec)} (${resumen.metricas.pistasUnicasReproducidas} pistas únicas)`);
    console.log(`BPM Promedio        : ${resumen.metricas.bpmPromedio} BPM`);
    console.log(`Pista Más Larga     : ${resumen.metricas.cancionMasLarga ? `"${resumen.metricas.cancionMasLarga.titulo}" (${formatearSegundosAMinutos(resumen.metricas.cancionMasLarga.duracionSegundos)})` : 'N/A'}`);
    console.log(`Estado Reproductor  : ${resumen.estadoFinalReproductor.estado} | Repetición: ${resumen.estadoFinalReproductor.modoRepeticion} | Aleatorio: ${resumen.estadoFinalReproductor.aleatorioActivo ? 'ON' : 'OFF'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y FILTROS DE CATÁLOGO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR GÉNERO MUSICAL:`);
    Object.entries(resumen.metricas.desglosePorGenero).forEach(([genero, cantidad]) => {
        console.log(`   - ${genero.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.cancionesProcesadas.map((c) => ({
            Código: c.codigoPista,
            Título: c.titulo,
            Artista: c.artista,
            Género: c.genero,
            Duración: formatearSegundosAMinutos(c.duracionSegundos),
            BPM: c.bpm,
            Calidad: c.calidad,
            Favorita: c.esFavorita ? 'Sí' : 'No'
        }))
    );
}

// 7. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const track1: Cancion = {
    id: 'trk-01',
    codigoPista: 'SYN-MIDNIGHT-01',
    titulo: 'Days of Thunder',
    artista: 'The Midnight',
    album: 'Days of Thunder',
    genero: 'Synthwave',
    duracionSegundos: 278,
    bpm: 118,
    calidad: 'LosslessFLAC',
    esExplicita: false,
    esFavorita: true
};

const track2: Cancion = {
    id: 'trk-02',
    codigoPista: 'ELE-DAFT-02',
    titulo: 'Veridis Quo',
    artista: 'Daft Punk',
    album: 'Discovery',
    genero: 'Electronica',
    duracionSegundos: 345,
    bpm: 113,
    calidad: 'LosslessFLAC',
    esExplicita: false,
    esFavorita: false
};

const track3: Cancion = {
    id: 'trk-03',
    codigoPista: 'ROC-MUSE-03',
    titulo: 'Knights of Cydonia',
    artista: 'Muse',
    album: 'Black Holes and Revelations',
    genero: 'Rock',
    duracionSegundos: 366,
    bpm: 137,
    calidad: 'Alta320kbps',
    esExplicita: false,
    esFavorita: true
};

const track4Explicita: Cancion = {
    id: 'trk-04',
    codigoPista: 'HIP-KEN-04',
    titulo: 'DNA.',
    artista: 'Kendrick Lamar',
    album: 'DAMN.',
    genero: 'HipHop',
    duracionSegundos: 185,
    bpm: 140,
    calidad: 'Alta320kbps',
    esExplicita: true,
    esFavorita: false
};

// --- CASO 1: Sesión de Código Nocturna (Caso Normal) ---
const configNormal: ConfiguracionPlaylist = {
    id: 'pl-01',
    codigoPlaylist: 'PL-DEV-NIGHT-2026',
    nombrePlaylist: 'Deep Focus & Synth Coding',
    curador: 'José Rodríguez',
    permitirContenidoExplicito: true,
    modoRepeticionInicial: 'RepetirPlaylist',
    aleatorioActivoInicial: false
};

const accionesNormal: readonly AccionReproductor[] = [
    { tipo: 'REPRODUCIR', indice: 0 },
    { tipo: 'AVANZAR_TIEMPO', deltaSegundos: 278 }, // Completa track1 y pasa automático a track2
    { tipo: 'TOGGLE_FAVORITA', cancionId: 'trk-02' },
    { tipo: 'AVANZAR_TIEMPO', deltaSegundos: 150 },
    { tipo: 'PAUSAR', motivo: 'Pausa para café' },
    { tipo: 'REPRODUCIR' },
    { tipo: 'SIGUIENTE_PISTA' },
    { tipo: 'AVANZAR_TIEMPO', deltaSegundos: 120 }
];

// --- CASO 2: Filtro Parental Activo, Datos Corruptos y Pista Duplicada (Caso Límite) ---
const trackCorrupta: Cancion = {
    id: 'trk-99',
    codigoPista: 'ERR-TRK-999',
    titulo: 'Pista Corrupta',
    artista: '',
    album: 'Error Album',
    genero: 'Pop',
    duracionSegundos: -45, // Duración negativa -> Inválida
    bpm: 420, // BPM fuera de rango -> Inválido
    calidad: 'Estandar128kbps',
    esExplicita: false,
    esFavorita: false
};

const configLimite: ConfiguracionPlaylist = {
    id: 'pl-02',
    codigoPlaylist: 'PL-FAMILY-SAFE',
    nombrePlaylist: 'Playlist Familiar Sin Explícitos',
    curador: 'Sistema Automático',
    permitirContenidoExplicito: false, // Bloquea track4Explicita
    modoRepeticionInicial: 'SinRepeticion',
    aleatorioActivoInicial: true
};

const accionesLimite: readonly AccionReproductor[] = [
    { tipo: 'REPRODUCIR' },
    { tipo: 'AVANZAR_TIEMPO', deltaSegundos: 300 },
    { tipo: 'SIGUIENTE_PISTA' }
];

async function ejecutarPruebas(): Promise<void> {
    const servicioNormal = new ServicioPlaylistInteractiva();
    const resumenNormal = await servicioNormal.procesarPlaylistAsync(
        configNormal,
        [track1, track2, track3, track4Explicita],
        accionesNormal
    );
    mostrarResumenPlaylist(resumenNormal, 'Caso Normal - Sesión Deep Focus & Synth Coding');

    const servicioLimite = new ServicioPlaylistInteractiva();
    const resumenLimite = await servicioLimite.procesarPlaylistAsync(
        configLimite,
        [track1, track4Explicita, trackCorrupta, track1], // Explícita filtrada + Corrupta + Duplicada
        accionesLimite
    );
    mostrarResumenPlaylist(resumenLimite, 'Caso Límite - Filtro Parental, Duplicados y Pista Corrupta');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));