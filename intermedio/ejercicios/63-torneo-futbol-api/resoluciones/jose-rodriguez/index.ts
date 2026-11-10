
// 1. MODELADO DEL DOMINIO (Discriminated Unions, Types & Interfaces)

export type FaseTorneo =
    | 'FaseDeGrupos'
    | 'Octavos'
    | 'Cuartos'
    | 'Semifinal'
    | 'Final';

export type EstadoPartido =
    | 'Programado'
    | 'EnJuego'
    | 'Finalizado'
    | 'Prorroga'
    | 'Penaltis'
    | 'Suspendido';

// Discriminated Unions para el Resultado del Partido
export type DetalleResultadoPartido =
    | { readonly tipo: 'VictoriaTiempoReglamentario'; readonly golesLocal: number; readonly golesVisitante: number }
    | { readonly tipo: 'Empate'; readonly golesLocal: number; readonly golesVisitante: number }
    | {
        readonly tipo: 'DefinicionPenaltis';
        readonly golesLocal: number;
        readonly golesVisitante: number;
        readonly penaltisLocal: number;
        readonly penaltisVisitante: number;
    };

export interface PartidoFutbol {
    readonly id: string;
    readonly codigoPartido: string;
    readonly equipoLocal: string;
    readonly equipoVisitante: string;
    readonly fase: FaseTorneo;
    readonly estado: EstadoPartido;
    readonly resultado: DetalleResultadoPartido;
    readonly posesionLocalPct: number;
    readonly tarjetasAmarillas: number;
    readonly tarjetasRojas: number;
}

export interface EquipoTablaPosiciones {
    readonly equipo: string;
    readonly partidosJugados: number;
    readonly victorias: number;
    readonly empates: number;
    readonly derrotas: number;
    readonly golesAFavor: number;
    readonly golesEnContra: number;
    readonly diferenciaGoles: number;
    readonly puntos: number;
}

// Discriminated Unions para el Estado Global del Torneo (State Machine)
export type EstadoSimulacionTorneo =
    | { readonly estado: 'Reposo' }
    | { readonly estado: 'SimulandoPartidos'; readonly partidosProcesados: number; readonly totalPartidos: number }
    | { readonly estado: 'TablaCalculada'; readonly equipoLider: string; readonly fechaActualizacion: string }
    | { readonly estado: 'Error'; readonly mensajeError: string; readonly codigoError: string };

// Discriminated Unions para Acciones / Eventos del Reducer
export type AccionTorneo =
    | { readonly tipo: 'INICIAR_TORNEO'; readonly totalPartidos: number }
    | { readonly tipo: 'REGISTRAR_PARTIDO'; readonly partido: PartidoFutbol }
    | { readonly tipo: 'FINALIZAR_TORNEO'; readonly lider: string }
    | { readonly tipo: 'CAPTURAR_ERROR'; readonly error: string; readonly codigo: string };

export interface MetricasTorneoFutbol {
    readonly totalPartidosProcesados: number;
    readonly partidosFinalizadosCount: number;
    readonly totalGolesAnotados: number;
    readonly promedioGolesPorPartido: number;
    readonly partidosDefinidosEnPenaltis: number;
    readonly partidoConMasGoles: PartidoFutbol | null;
    readonly equipoCampeonOLider: string | null;
    readonly desglosePorFase: Readonly<Record<FaseTorneo, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoPartido, number>>;
}

export interface ResumenTorneoFutbol {
    readonly torneoId: string;
    readonly nombreTorneo: string;
    readonly temporada: string;
    readonly totalPartidosValidos: number;
    readonly metricas: MetricasTorneoFutbol;
    readonly tablaPosiciones: readonly EquipoTablaPosiciones[];
    readonly partidosProcesados: readonly PartidoFutbol[];
    readonly advertencias: readonly string[];
    readonly estadoTorneo: EstadoSimulacionTorneo;
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO (Generics & Encapsulamiento)

export class ContenedorPartidos<T extends { readonly id: string; readonly codigoPartido: string }> {
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

// 3. VALIDACIONES Y REGLAS DE NEGOCIO

export function validarPartidoFutbol(partido: PartidoFutbol): ResultadoValidacion<PartidoFutbol> {
    const errores: string[] = [];

    if (partido.equipoLocal.trim().length === 0 || partido.equipoVisitante.trim().length === 0) {
        errores.push(`El partido "${partido.codigoPartido}" debe tener equipos local y visitante validos.`);
    }

    if (partido.equipoLocal.trim().toLowerCase() === partido.equipoVisitante.trim().toLowerCase()) {
        errores.push(`Un equipo no puede jugar contra si mismo en el partido "${partido.codigoPartido}".`);
    }

    if (partido.posesionLocalPct < 0 || partido.posesionLocalPct > 100) {
        errores.push(`Porcentaje de posesion fuera de rango (${partido.posesionLocalPct}%) en "${partido.codigoPartido}".`);
    }

    if (partido.resultado.golesLocal < 0 || partido.resultado.golesVisitante < 0) {
        errores.push(`Goles negativos detectados en "${partido.codigoPartido}".`);
    }

    if (partido.resultado.tipo === 'DefinicionPenaltis') {
        if (partido.resultado.penaltisLocal < 0 || partido.resultado.penaltisVisitante < 0) {
            errores.push(`Tanda de penaltis negativa en "${partido.codigoPartido}".`);
        }
        if (partido.resultado.penaltisLocal === partido.resultado.penaltisVisitante) {
            errores.push(`La tanda de penaltis no puede terminar en empate en "${partido.codigoPartido}".`);
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: partido }
        : { esValido: false, errores };
}

// 4. MÁQUINA DE ESTADOS Y REDUCER DEL TORNEO

export function reducerTorneo(
    estadoActual: EstadoSimulacionTorneo,
    accion: AccionTorneo
): EstadoSimulacionTorneo {
    switch (accion.tipo) {
        case 'INICIAR_TORNEO': {
            return {
                estado: 'SimulandoPartidos',
                partidosProcesados: 0,
                totalPartidos: accion.totalPartidos
            };
        }
        case 'REGISTRAR_PARTIDO': {
            if (estadoActual.estado === 'SimulandoPartidos') {
                return {
                    ...estadoActual,
                    partidosProcesados: estadoActual.partidosProcesados + 1
                };
            }
            return estadoActual;
        }
        case 'FINALIZAR_TORNEO': {
            return {
                estado: 'TablaCalculada',
                equipoLider: accion.lider,
                fechaActualizacion: new Date().toISOString()
            };
        }
        case 'CAPTURAR_ERROR': {
            return {
                estado: 'Error',
                mensajeError: accion.error,
                codigoError: accion.codigo
            };
        }
        default:
            return estadoActual;
    }
}

// 5. CÁLCULO DE TABLA DE POSICIONES Y MÉTRICAS (reduce & Record)

export function calcularTablaPosiciones(partidos: readonly PartidoFutbol[]): readonly EquipoTablaPosiciones[] {
    const mapaEquipos = new Map<string, EquipoTablaPosiciones>();

    const obtenerOCrearEquipo = (nombre: string): EquipoTablaPosiciones => {
        return mapaEquipos.get(nombre) ?? {
            equipo: nombre,
            partidosJugados: 0,
            victorias: 0,
            empates: 0,
            derrotas: 0,
            golesAFavor: 0,
            golesEnContra: 0,
            diferenciaGoles: 0,
            puntos: 0
        };
    };

    partidos.forEach((p) => {
        if (p.estado !== 'Finalizado' && p.estado !== 'Prorroga' && p.estado !== 'Penaltis') return;

        const eqLocal = obtenerOCrearEquipo(p.equipoLocal);
        const eqVis = obtenerOCrearEquipo(p.equipoVisitante);

        const gL = p.resultado.golesLocal;
        const gV = p.resultado.golesVisitante;

        let ptsL = 0;
        let ptsV = 0;
        let vicL = 0;
        let vicV = 0;
        let empL = 0;
        let empV = 0;
        let derL = 0;
        let derV = 0;

        if (gL > gV) {
            ptsL = 3; vicL = 1; derV = 1;
        } else if (gV > gL) {
            ptsV = 3; vicV = 1; derL = 1;
        } else {
            if (p.resultado.tipo === 'DefinicionPenaltis') {
                if (p.resultado.penaltisLocal > p.resultado.penaltisVisitante) {
                    ptsL = 2; ptsV = 1; vicL = 1; derV = 1;
                } else {
                    ptsV = 2; ptsL = 1; vicV = 1; derL = 1;
                }
            } else {
                ptsL = 1; ptsV = 1; empL = 1; empV = 1;
            }
        }

        mapaEquipos.set(p.equipoLocal, {
            ...eqLocal,
            partidosJugados: eqLocal.partidosJugados + 1,
            victorias: eqLocal.victorias + vicL,
            empates: eqLocal.empates + empL,
            derrotas: eqLocal.derrotas + derL,
            golesAFavor: eqLocal.golesAFavor + gL,
            golesEnContra: eqLocal.golesEnContra + gV,
            diferenciaGoles: eqLocal.diferenciaGoles + (gL - gV),
            puntos: eqLocal.puntos + ptsL
        });

        mapaEquipos.set(p.equipoVisitante, {
            ...eqVis,
            partidosJugados: eqVis.partidosJugados + 1,
            victorias: eqVis.victorias + vicV,
            empates: eqVis.empates + empV,
            derrotas: eqVis.derrotas + derV,
            golesAFavor: eqVis.golesAFavor + gV,
            golesEnContra: eqVis.golesEnContra + gL,
            diferenciaGoles: eqVis.diferenciaGoles + (gV - gL),
            puntos: eqVis.puntos + ptsV
        });
    });

    return Array.from(mapaEquipos.values()).sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        if (b.diferenciaGoles !== a.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
        return b.golesAFavor - a.golesAFavor;
    });
}

const FASES_TORNEO: readonly FaseTorneo[] = ['FaseDeGrupos', 'Octavos', 'Cuartos', 'Semifinal', 'Final'];
const ESTADOS_PARTIDO: readonly EstadoPartido[] = ['Programado', 'EnJuego', 'Finalizado', 'Prorroga', 'Penaltis', 'Suspendido'];

export function calcularMetricasTorneo(
    partidos: readonly PartidoFutbol[],
    tabla: readonly EquipoTablaPosiciones[]
): MetricasTorneoFutbol {
    if (partidos.length === 0) {
        const desgloseFaseVacio = FASES_TORNEO.reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<FaseTorneo, number>);
        const desgloseEstVacio = ESTADOS_PARTIDO.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoPartido, number>);

        return {
            totalPartidosProcesados: 0,
            partidosFinalizadosCount: 0,
            totalGolesAnotados: 0,
            promedioGolesPorPartido: 0,
            partidosDefinidosEnPenaltis: 0,
            partidoConMasGoles: null,
            equipoCampeonOLider: null,
            desglosePorFase: desgloseFaseVacio,
            desglosePorEstado: desgloseEstVacio
        };
    }

    const finalizados = partidos.filter((p) => p.estado === 'Finalizado' || p.estado === 'Penaltis' || p.estado === 'Prorroga');
    const totalGolesAnotados = finalizados.reduce((acc, p) => acc + p.resultado.golesLocal + p.resultado.golesVisitante, 0);
    const promedioGolesPorPartido = finalizados.length > 0 ? Number((totalGolesAnotados / finalizados.length).toFixed(2)) : 0;

    const partidosDefinidosEnPenaltis = partidos.filter((p) => p.resultado.tipo === 'DefinicionPenaltis').length;

    const partidoConMasGoles = [...finalizados].sort(
        (a, b) => (b.resultado.golesLocal + b.resultado.golesVisitante) - (a.resultado.golesLocal + a.resultado.golesVisitante)
    )[0] ?? null;

    const equipoCampeonOLider = tabla.length > 0 ? tabla[0].equipo : null;

    const desglosePorFase = partidos.reduce((acc, p) => {
        acc[p.fase] = (acc[p.fase] ?? 0) + 1;
        return acc;
    }, FASES_TORNEO.reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<FaseTorneo, number>));

    const desglosePorEstado = partidos.reduce((acc, p) => {
        acc[p.estado] = (acc[p.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_PARTIDO.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoPartido, number>));

    return {
        totalPartidosProcesados: partidos.length,
        partidosFinalizadosCount: finalizados.length,
        totalGolesAnotados,
        promedioGolesPorPartido,
        partidosDefinidosEnPenaltis,
        partidoConMasGoles,
        equipoCampeonOLider,
        desglosePorFase,
        desglosePorEstado
    };
}

export class ServicioTorneoFutbolAsincrono {
    private readonly contenedor = new ContenedorPartidos<PartidoFutbol>();
    private estadoTorneo: EstadoSimulacionTorneo = { estado: 'Reposo' };

    public async procesarTorneoAsync(
        torneoId: string,
        nombreTorneo: string,
        temporada: string,
        partidosRaw: readonly PartidoFutbol[]
    ): Promise<ResumenTorneoFutbol> {
        const advertencias: string[] = [];
        this.estadoTorneo = reducerTorneo(this.estadoTorneo, { tipo: 'INICIAR_TORNEO', totalPartidos: partidosRaw.length });

        // Simulación de consulta asíncrona a la API de la FIFA/UEFA
        await new Promise((resolve) => setTimeout(resolve, 20));

        if (partidosRaw.length === 0) {
            advertencias.push(`El torneo "${nombreTorneo}" no registra partidos disputados.`);
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        for (const rawP of partidosRaw) {
            const valRes = validarPartidoFutbol(rawP);
            if (!valRes.esValido) {
                advertencias.push(...valRes.errores);
            } else if (idsVistos.has(rawP.id)) {
                advertencias.push(`Partido duplicado detectado por ID: ${rawP.id}.`);
            } else if (codigosVistos.has(rawP.codigoPartido)) {
                advertencias.push(`Codigo de partido duplicado: ${rawP.codigoPartido}.`);
            } else {
                idsVistos.add(rawP.id);
                codigosVistos.add(rawP.codigoPartido);
                this.contenedor.agregar(rawP);
                this.estadoTorneo = reducerTorneo(this.estadoTorneo, { tipo: 'REGISTRAR_PARTIDO', partido: rawP });
            }
        }

        const partidosValidos = this.contenedor.obtenerTodos();
        const tablaPosiciones = calcularTablaPosiciones(partidosValidos);
        const metricas = calcularMetricasTorneo(partidosValidos, tablaPosiciones);

        const lider = metricas.equipoCampeonOLider ?? 'Sin lider';
        this.estadoTorneo = reducerTorneo(this.estadoTorneo, { tipo: 'FINALIZAR_TORNEO', lider });

        const partidosSuspendidos = partidosValidos.filter((p) => p.estado === 'Suspendido');
        if (partidosSuspendidos.length > 0) {
            advertencias.push(`Alerta de calendario: Se detectaron ${partidosSuspendidos.length} partido(s) suspendidos.`);
        }

        return {
            torneoId,
            nombreTorneo,
            temporada,
            totalPartidosValidos: partidosValidos.length,
            metricas,
            tablaPosiciones,
            partidosProcesados: partidosValidos,
            advertencias,
            estadoTorneo: this.estadoTorneo
        };
    }
}

// 6. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenTorneo(resumen: ResumenTorneoFutbol, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` TORNEO FUTBOL ASINCRONO - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Torneo              : ${resumen.nombreTorneo} (${resumen.temporada})`);
    console.log(`ID Torneo           : ${resumen.torneoId}`);
    console.log(`Partidos Validados  : ${resumen.totalPartidosValidos}`);
    console.log(`Goles Totales       : ${resumen.metricas.totalGolesAnotados} (Prom: ${resumen.metricas.promedioGolesPorPartido} por partido)`);
    console.log(`Definidos Penaltis  : ${resumen.metricas.partidosDefinidosEnPenaltis}`);
    console.log(`Lider / Campeon     : ${resumen.metricas.equipoCampeonOLider ?? 'N/A'}`);
    console.log(`Partido c/ Mas Goles: ${resumen.metricas.partidoConMasGoles ? `"${resumen.metricas.partidoConMasGoles.equipoLocal} ${resumen.metricas.partidoConMasGoles.resultado.golesLocal}-${resumen.metricas.partidoConMasGoles.resultado.golesVisitante} ${resumen.metricas.partidoConMasGoles.equipoVisitante}"` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REGISTRO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`TABLA DE POSICIONES GENERAL:`);
    console.table(
        resumen.tablaPosiciones.map((t, idx) => ({
            Pos: idx + 1,
            Equipo: t.equipo,
            PJ: t.partidosJugados,
            PG: t.victorias,
            PE: t.empates,
            PP: t.derrotas,
            GF: t.golesAFavor,
            GC: t.golesEnContra,
            DG: t.diferenciaGoles,
            Pts: t.puntos
        }))
    );

    console.log(`----------------------------------------------------------------------`);
    console.log(`DETALLE DE PARTIDOS PROCESADOS:`);
    console.table(
        resumen.partidosProcesados.map((p) => ({
            Codigo: p.codigoPartido,
            Fase: p.fase,
            Encuentro: `${p.equipoLocal} vs ${p.equipoVisitante}`,
            Resultado: p.resultado.tipo === 'DefinicionPenaltis'
                ? `${p.resultado.golesLocal}-${p.resultado.golesVisitante} (${p.resultado.penaltisLocal}-${p.resultado.penaltisVisitante} pen)`
                : `${p.resultado.golesLocal}-${p.resultado.golesVisitante}`,
            Posesion: `${p.posesionLocalPct}% / ${100 - p.posesionLocalPct}%`,
            Tarjetas: `${p.tarjetasAmarillas} amarillas / ${p.tarjetasRojas} rojas`,
            Estado: p.estado
        }))
    );
}

// 7. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const p1: PartidoFutbol = {
    id: 'match-01',
    codigoPartido: 'UCL-FINAL-2026',
    equipoLocal: 'Real Madrid',
    equipoVisitante: 'Bayern Munchen',
    fase: 'Final',
    estado: 'Finalizado',
    resultado: { tipo: 'VictoriaTiempoReglamentario', golesLocal: 3, golesVisitante: 1 },
    posesionLocalPct: 58,
    tarjetasAmarillas: 3,
    tarjetasRojas: 0
};

const p2: PartidoFutbol = {
    id: 'match-02',
    codigoPartido: 'UCL-SEMI-01',
    equipoLocal: 'Manchester City',
    equipoVisitante: 'Real Madrid',
    fase: 'Semifinal',
    estado: 'Penaltis',
    resultado: { tipo: 'DefinicionPenaltis', golesLocal: 2, golesVisitante: 2, penaltisLocal: 3, penaltisVisitante: 4 },
    posesionLocalPct: 65,
    tarjetasAmarillas: 5,
    tarjetasRojas: 1
};

const p3: PartidoFutbol = {
    id: 'match-03',
    codigoPartido: 'UCL-SEMI-02',
    equipoLocal: 'Bayern Munchen',
    equipoVisitante: 'Paris Saint-Germain',
    fase: 'Semifinal',
    estado: 'Finalizado',
    resultado: { tipo: 'VictoriaTiempoReglamentario', golesLocal: 2, golesVisitante: 0 },
    posesionLocalPct: 52,
    tarjetasAmarillas: 2,
    tarjetasRojas: 0
};

// --- CASO 1: UEFA Champions League Knockout Phase (Caso Normal) ---
const servicioNormal = new ServicioTorneoFutbolAsincrono();

// --- CASO 2: Mismo Equipo, Posesión Negativa y Partido Duplicado (Caso Límite) ---
const partidoCorrupto: PartidoFutbol = {
    id: 'match-99',
    codigoPartido: 'ERR-MATCH-999',
    equipoLocal: 'Barcelona',
    equipoVisitante: 'Barcelona', // Mismo equipo -> Invalido
    fase: 'Cuartos',
    estado: 'Suspendido',
    resultado: { tipo: 'VictoriaTiempoReglamentario', golesLocal: -1, golesVisitante: 2 }, // Goles negativos -> Invalido
    posesionLocalPct: 120, // Posesion > 100% -> Invalido
    tarjetasAmarillas: 1,
    tarjetasRojas: 0
};

const servicioLimite = new ServicioTorneoFutbolAsincrono();

async function ejecutarPruebas(): Promise<void> {
    // Ejecución Caso 1
    const resumenNormal = await servicioNormal.procesarTorneoAsync(
        'UCL-2026',
        'UEFA Champions League',
        'Temporada 2025/2026',
        [p1, p2, p3]
    );
    mostrarResumenTorneo(resumenNormal, 'Caso Normal - UEFA Champions League 2026');

    // Ejecución Caso 2
    const resumenLimite = await servicioLimite.procesarTorneoAsync(
        'TORNEO-ERR-02',
        'Torneo Con Errores de Ingestion API',
        '2026',
        [p1, partidoCorrupto, p1]
    );
    mostrarResumenTorneo(resumenLimite, 'Caso Limite - Mismo Equipo y Posesion Fuera de Rango');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecucion:', err));