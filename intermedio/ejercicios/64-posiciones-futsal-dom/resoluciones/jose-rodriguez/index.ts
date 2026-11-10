
// 1. MODELADO DEL DOMINIO CON UNIONES DISCRIMINADAS (Discriminated Unions)

export type CategoriaFutsal =
    | 'LigaMayor'
    | 'PrimeraDivision'
    | 'Femenino'
    | 'JuvenilSub20';

export type EstadoPartidoFutsal =
    | 'Programado'
    | 'EnJuego'
    | 'Finalizado'
    | 'Suspendido';

// Discriminated Unions para los Eventos del Reducer de Partido
export type AccionResultadoFutsal =
    | {
        readonly tipo: 'VICTORIA_REGULAR';
        readonly equipoLocal: string;
        readonly equipoVisitante: string;
        readonly golesLocal: number;
        readonly golesVisitante: number;
        readonly faltasAcumuladasLocal: number;
        readonly faltasAcumuladasVisitante: number;
    }
    | {
        readonly tipo: 'EMPATE';
        readonly equipoLocal: string;
        readonly equipoVisitante: string;
        readonly golesLocal: number;
        readonly golesVisitante: number;
        readonly faltasAcumuladasLocal: number;
        readonly faltasAcumuladasVisitante: number;
    }
    | {
        readonly tipo: 'DESCALIFICACION';
        readonly equipoDescalificado: string;
        readonly equipoBeneficiado: string;
        readonly razon: string;
    };

export interface PartidoFutsal {
    readonly id: string;
    readonly codigoPartido: string;
    readonly equipoLocal: string;
    readonly equipoVisitante: string;
    readonly jornada: number;
    readonly categoria: CategoriaFutsal;
    readonly estado: EstadoPartidoFutsal;
    readonly resultado: AccionResultadoFutsal;
}

export interface EquipoTablaFutsal {
    readonly id: string;
    readonly codigoEquipo: string;
    readonly nombreEquipo: string;
    readonly partidosJugados: number;
    readonly victorias: number;
    readonly empates: number;
    readonly derrotas: number;
    readonly golesAFavor: number;
    readonly golesEnContra: number;
    readonly diferenciaGoles: number;
    readonly faltasAcumuladasTotales: number;
    readonly puntos: number;
}

// Discriminación del Estado de la Máquina del Reducer
export type EstadoTablaFutsal =
    | { readonly estado: 'SinProcesar' }
    | { readonly estado: 'Procesando'; readonly partidosProcesadosCount: number }
    | { readonly estado: 'Calculada'; readonly equipoLider: string; readonly totalEquipos: number; readonly fechaActualizacion: string }
    | { readonly estado: 'Error'; readonly mensaje: string };

export interface MetricasTablaFutsal {
    readonly totalPartidos: number;
    readonly totalGolesAnotados: number;
    readonly promedioGolesPorPartido: number;
    readonly totalFaltasAcumuladas: number;
    readonly promedioFaltasPorPartido: number;
    readonly equipoConMejorAtaque: EquipoTablaFutsal | null;
    readonly equipoConMejorDefensa: EquipoTablaFutsal | null;
    readonly equipoMasLimpio: EquipoTablaFutsal | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaFutsal, number>>;
}

export interface ResumenTablaFutsal {
    readonly ejecucionId: string;
    readonly nombreTorneo: string;
    readonly totalPartidosValidos: number;
    readonly metricas: MetricasTablaFutsal;
    readonly tablaPosiciones: readonly EquipoTablaFutsal[];
    readonly partidosProcesados: readonly PartidoFutsal[];
    readonly advertencias: readonly string[];
    readonly estadoTabla: EstadoTablaFutsal;
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y GESTIÓN DE EQUIPOS (Generics & Encapsulamiento)

export class ContenedorEquiposFutsal<T extends { readonly id: string; readonly codigoEquipo: string }> {
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

export function validarPartidoFutsal(partido: PartidoFutsal): ResultadoValidacion<PartidoFutsal> {
    const errores: string[] = [];

    if (partido.equipoLocal.trim().length === 0 || partido.equipoVisitante.trim().length === 0) {
        errores.push(`El partido "${partido.codigoPartido}" debe incluir equipos local y visitante válidos.`);
    }

    if (partido.equipoLocal.trim().toLowerCase() === partido.equipoVisitante.trim().toLowerCase()) {
        errores.push(`Inconsistencia en "${partido.codigoPartido}": Un equipo no puede enfrentarse a sí mismo.`);
    }

    if (partido.jornada <= 0) {
        errores.push(`Número de jornada inválido (${partido.jornada}) en "${partido.codigoPartido}".`);
    }

    const res = partido.resultado;
    if (res.tipo === 'VICTORIA_REGULAR' || res.tipo === 'EMPATE') {
        if (res.golesLocal < 0 || res.golesVisitante < 0) {
            errores.push(`Marcador con goles negativos detectado en "${partido.codigoPartido}".`);
        }
        if (res.faltasAcumuladasLocal < 0 || res.faltasAcumuladasVisitante < 0) {
            errores.push(`Faltas acumuladas negativas detectadas en "${partido.codigoPartido}".`);
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: partido }
        : { esValido: false, errores };
}

// 4. MÁQUINA DE ESTADOS Y REDUCER DE TABLA

export function reducerTablaFutsal(
    estadoActual: EstadoTablaFutsal,
    accion: { readonly tipo: 'INICIAR' } | { readonly tipo: 'PROCESAR_PARTIDO' } | { readonly tipo: 'FINALIZAR'; readonly lider: string; readonly totalEquipos: number } | { readonly tipo: 'ERROR'; readonly mensaje: string }
): EstadoTablaFutsal {
    switch (accion.tipo) {
        case 'INICIAR':
            return { estado: 'Procesando', partidosProcesadosCount: 0 };
        case 'PROCESAR_PARTIDO':
            return estadoActual.estado === 'Procesando'
                ? { estado: 'Procesando', partidosProcesadosCount: estadoActual.partidosProcesadosCount + 1 }
                : estadoActual;
        case 'FINALIZAR':
            return {
                estado: 'Calculada',
                equipoLider: accion.lider,
                totalEquipos: accion.totalEquipos,
                fechaActualizacion: new Date().toISOString()
            };
        case 'ERROR':
            return { estado: 'Error', mensaje: accion.mensaje };
        default:
            return estadoActual;
    }
}

// 5. CÁLCULO DE TABLA DE POSICIONES Y MÉTRICAS (reduce & Record)

export function calcularTablaPosicionesFutsal(partidos: readonly PartidoFutsal[]): readonly EquipoTablaFutsal[] {
    const mapaEquipos = new Map<string, EquipoTablaFutsal>();

    const obtenerOCrearEquipo = (nombre: string): EquipoTablaFutsal => {
        const slug = nombre.trim().toLowerCase().replace(/\s+/g, '-');
        return (
            mapaEquipos.get(slug) ?? {
                id: `eq-${slug}`,
                codigoEquipo: `EQ-${slug.toUpperCase()}`,
                nombreEquipo: nombre,
                partidosJugados: 0,
                victorias: 0,
                empates: 0,
                derrotas: 0,
                golesAFavor: 0,
                golesEnContra: 0,
                diferenciaGoles: 0,
                faltasAcumuladasTotales: 0,
                puntos: 0
            }
        );
    };

    partidos.forEach((p) => {
        if (p.estado !== 'Finalizado') return;

        const res = p.resultado;
        if (res.tipo === 'DESCALIFICACION') {
            const eqBen = obtenerOCrearEquipo(res.equipoBeneficiado);
            const slugBen = res.equipoBeneficiado.trim().toLowerCase().replace(/\s+/g, '-');
            mapaEquipos.set(slugBen, {
                ...eqBen,
                partidosJugados: eqBen.partidosJugados + 1,
                victorias: eqBen.victorias + 1,
                golesAFavor: eqBen.golesAFavor + 3,
                diferenciaGoles: eqBen.diferenciaGoles + 3,
                puntos: eqBen.puntos + 3
            });

            const eqDesc = obtenerOCrearEquipo(res.equipoDescalificado);
            const slugDesc = res.equipoDescalificado.trim().toLowerCase().replace(/\s+/g, '-');
            mapaEquipos.set(slugDesc, {
                ...eqDesc,
                partidosJugados: eqDesc.partidosJugados + 1,
                derrotas: eqDesc.derrotas + 1,
                golesEnContra: eqDesc.golesEnContra + 3,
                diferenciaGoles: eqDesc.diferenciaGoles - 3
            });
            return;
        }

        const eqLocal = obtenerOCrearEquipo(res.equipoLocal);
        const eqVis = obtenerOCrearEquipo(res.equipoVisitante);
        const slugL = res.equipoLocal.trim().toLowerCase().replace(/\s+/g, '-');
        const slugV = res.equipoVisitante.trim().toLowerCase().replace(/\s+/g, '-');

        const gL = res.golesLocal;
        const gV = res.golesVisitante;

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
            ptsL = 1; ptsV = 1; empL = 1; empV = 1;
        }

        mapaEquipos.set(slugL, {
            ...eqLocal,
            partidosJugados: eqLocal.partidosJugados + 1,
            victorias: eqLocal.victorias + vicL,
            empates: eqLocal.empates + empL,
            derrotas: eqLocal.derrotas + derL,
            golesAFavor: eqLocal.golesAFavor + gL,
            golesEnContra: eqLocal.golesEnContra + gV,
            diferenciaGoles: eqLocal.diferenciaGoles + (gL - gV),
            faltasAcumuladasTotales: eqLocal.faltasAcumuladasTotales + res.faltasAcumuladasLocal,
            puntos: eqLocal.puntos + ptsL
        });

        mapaEquipos.set(slugV, {
            ...eqVis,
            partidosJugados: eqVis.partidosJugados + 1,
            victorias: eqVis.victorias + vicV,
            empates: eqVis.empates + empV,
            derrotas: eqVis.derrotas + derV,
            golesAFavor: eqVis.golesAFavor + gV,
            golesEnContra: eqVis.golesEnContra + gL,
            diferenciaGoles: eqVis.diferenciaGoles + (gV - gL),
            faltasAcumuladasTotales: eqVis.faltasAcumuladasTotales + res.faltasAcumuladasVisitante,
            puntos: eqVis.puntos + ptsV
        });
    });

    // Criterios de Desempate Futsal: Puntos -> Diferencia Goles -> Goles Favor -> Menos Faltas
    return Array.from(mapaEquipos.values()).sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        if (b.diferenciaGoles !== a.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
        if (b.golesAFavor !== a.golesAFavor) return b.golesAFavor - a.golesAFavor;
        return a.faltasAcumuladasTotales - b.faltasAcumuladasTotales;
    });
}

const CATEGORIAS_FUTSAL: readonly CategoriaFutsal[] = [
    'LigaMayor',
    'PrimeraDivision',
    'Femenino',
    'JuvenilSub20'
];

export function calcularMetricasFutsal(
    partidos: readonly PartidoFutsal[],
    tabla: readonly EquipoTablaFutsal[]
): MetricasTablaFutsal {
    if (partidos.length === 0) {
        const desgloseCatVacio = CATEGORIAS_FUTSAL.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CategoriaFutsal, number>);
        return {
            totalPartidos: 0,
            totalGolesAnotados: 0,
            promedioGolesPorPartido: 0,
            totalFaltasAcumuladas: 0,
            promedioFaltasPorPartido: 0,
            equipoConMejorAtaque: null,
            equipoConMejorDefensa: null,
            equipoMasLimpio: null,
            desglosePorCategoria: desgloseCatVacio
        };
    }

    const finalizados = partidos.filter((p) => p.estado === 'Finalizado');

    const totalGolesAnotados = finalizados.reduce((acc, p) => {
        const r = p.resultado;
        return r.tipo !== 'DESCALIFICACION' ? acc + r.golesLocal + r.golesVisitante : acc + 3;
    }, 0);

    const promedioGolesPorPartido = finalizados.length > 0 ? Number((totalGolesAnotados / finalizados.length).toFixed(2)) : 0;

    const totalFaltasAcumuladas = finalizados.reduce((acc, p) => {
        const r = p.resultado;
        return r.tipo !== 'DESCALIFICACION' ? acc + r.faltasAcumuladasLocal + r.faltasAcumuladasVisitante : acc;
    }, 0);

    const promedioFaltasPorPartido = finalizados.length > 0 ? Number((totalFaltasAcumuladas / finalizados.length).toFixed(1)) : 0;

    const equipoConMejorAtaque = tabla.length > 0 ? [...tabla].sort((a, b) => b.golesAFavor - a.golesAFavor)[0] : null;
    const equipoConMejorDefensa = tabla.length > 0 ? [...tabla].sort((a, b) => a.golesEnContra - b.golesEnContra)[0] : null;
    const equipoMasLimpio = tabla.length > 0 ? [...tabla].sort((a, b) => a.faltasAcumuladasTotales - b.faltasAcumuladasTotales)[0] : null;

    const desglosePorCategoria = partidos.reduce((acc, p) => {
        acc[p.categoria] = (acc[p.categoria] ?? 0) + 1;
        return acc;
    }, CATEGORIAS_FUTSAL.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CategoriaFutsal, number>));

    return {
        totalPartidos: partidos.length,
        totalGolesAnotados,
        promedioGolesPorPartido,
        totalFaltasAcumuladas,
        promedioFaltasPorPartido,
        equipoConMejorAtaque,
        equipoConMejorDefensa,
        equipoMasLimpio,
        desglosePorCategoria
    };
}

export class ServicioTablaFutsalInteractiva {
    private readonly contenedor = new ContenedorEquiposFutsal<EquipoTablaFutsal>();
    private estadoTabla: EstadoTablaFutsal = { estado: 'SinProcesar' };

    public async procesarTablaAsync(
        nombreTorneo: string,
        partidosRaw: readonly PartidoFutsal[]
    ): Promise<ResumenTablaFutsal> {
        const advertencias: string[] = [];
        this.estadoTabla = reducerTablaFutsal(this.estadoTabla, { tipo: 'INICIAR' });

        // Simulación de respuesta asíncrona desde el Servidor de Futsal
        await new Promise((resolve) => setTimeout(resolve, 15));

        if (partidosRaw.length === 0) {
            advertencias.push(`El torneo de futsal "${nombreTorneo}" no registra partidos ingresados.`);
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();
        const partidosValidos: PartidoFutsal[] = [];

        for (const rawP of partidosRaw) {
            const valRes = validarPartidoFutsal(rawP);
            if (!valRes.esValido) {
                advertencias.push(...valRes.errores);
            } else if (idsVistos.has(rawP.id)) {
                advertencias.push(`Partido duplicado detectado por ID: ${rawP.id}.`);
            } else if (codigosVistos.has(rawP.codigoPartido)) {
                advertencias.push(`Código de partido duplicado: ${rawP.codigoPartido}.`);
            } else {
                idsVistos.add(rawP.id);
                codigosVistos.add(rawP.codigoPartido);
                partidosValidos.push(rawP);
                this.estadoTabla = reducerTablaFutsal(this.estadoTabla, { tipo: 'PROCESAR_PARTIDO' });
            }
        }

        const tablaCalculada = calcularTablaPosicionesFutsal(partidosValidos);
        tablaCalculada.forEach((eq) => this.contenedor.agregar(eq));

        const metricas = calcularMetricasFutsal(partidosValidos, tablaCalculada);
        const lider = tablaCalculada.length > 0 ? tablaCalculada[0].nombreEquipo : 'Sin Lider';

        this.estadoTabla = reducerTablaFutsal(this.estadoTabla, {
            tipo: 'FINALIZAR',
            lider,
            totalEquipos: tablaCalculada.length
        });

        const descalificadosCount = partidosValidos.filter((p) => p.resultado.tipo === 'DESCALIFICACION').length;
        if (descalificadosCount > 0) {
            advertencias.push(`Alerta de disciplina: Se aplicaron ${descalificadosCount} descalificación(es) administrativas.`);
        }

        return {
            ejecucionId: `FUTSAL-EXEC-${Date.now()}`,
            nombreTorneo,
            totalPartidosValidos: partidosValidos.length,
            metricas,
            tablaPosiciones: tablaCalculada,
            partidosProcesados: partidosValidos,
            advertencias,
            estadoTabla: this.estadoTabla
        };
    }
}

// 6. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenTablaFutsal(resumen: ResumenTablaFutsal, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` TABLA FUTSAL INTERACTIVA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Torneo              : ${resumen.nombreTorneo}`);
    console.log(`Ejecución ID        : ${resumen.ejecucionId}`);
    console.log(`Partidos Validados  : ${resumen.totalPartidosValidos}`);
    console.log(`Goles Aclarados     : ${resumen.metricas.totalGolesAnotados} (Prom: ${resumen.metricas.promedioGolesPorPartido} goles/partido)`);
    console.log(`Faltas Acumuladas   : ${resumen.metricas.totalFaltasAcumuladas} (Prom: ${resumen.metricas.promedioFaltasPorPartido} faltas/partido)`);
    console.log(`Mejor Ataque        : ${resumen.metricas.equipoConMejorAtaque ? `"${resumen.metricas.equipoConMejorAtaque.nombreEquipo}" (${resumen.metricas.equipoConMejorAtaque.golesAFavor} GF)` : 'N/A'}`);
    console.log(`Equipo Más Limpio   : ${resumen.metricas.equipoMasLimpio ? `"${resumen.metricas.equipoMasLimpio.nombreEquipo}" (${resumen.metricas.equipoMasLimpio.faltasAcumuladasTotales} faltas)` : 'N/A'}`);
    console.log(`Estado Reducer      : ${resumen.estadoTabla.estado}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y DISCIPLINA (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`TABLA DE POSICIONES OFICIAL FUTSAL:`);
    console.table(
        resumen.tablaPosiciones.map((t, idx) => ({
            Pos: idx + 1,
            Equipo: t.nombreEquipo,
            PJ: t.partidosJugados,
            PG: t.victorias,
            PE: t.empates,
            PP: t.derrotas,
            GF: t.golesAFavor,
            GC: t.golesEnContra,
            DG: t.diferenciaGoles,
            'Faltas Acum.': t.faltasAcumuladasTotales,
            Pts: t.puntos
        }))
    );

    console.log(`----------------------------------------------------------------------`);
    console.log(`REGISTRO DE PARTIDOS DISPUTADOS:`);
    console.table(
        resumen.partidosProcesados.map((p) => ({
            Código: p.codigoPartido,
            Jornada: `Jornada ${p.jornada}`,
            Categoría: p.categoria,
            Encuentro: `${p.equipoLocal} vs ${p.equipoVisitante}`,
            Resultado:
                p.resultado.tipo === 'DESCALIFICACION'
                    ? `Descalificación: ${p.resultado.equipoDescalificado}`
                    : `${p.resultado.golesLocal} - ${p.resultado.golesVisitante}`,
            'Faltas (L/V)': p.resultado.tipo !== 'DESCALIFICACION' ? `${p.resultado.faltasAcumuladasLocal} / ${p.resultado.faltasAcumuladasVisitante}` : 'N/A'
        }))
    );
}

// 7. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const pf1: PartidoFutsal = {
    id: 'fut-01',
    codigoPartido: 'FUT-LIGA-J01',
    equipoLocal: 'Glucosoral FSC',
    equipoVisitante: 'Garra Chapina',
    jornada: 1,
    categoria: 'LigaMayor',
    estado: 'Finalizado',
    resultado: {
        tipo: 'VICTORIA_REGULAR',
        equipoLocal: 'Glucosoral FSC',
        equipoVisitante: 'Garra Chapina',
        golesLocal: 6,
        golesVisitante: 3,
        faltasAcumuladasLocal: 4,
        faltasAcumuladasVisitante: 5
    }
};

const pf2: PartidoFutsal = {
    id: 'fut-02',
    codigoPartido: 'FUT-LIGA-J02',
    equipoLocal: 'Farmacéuticos FSC',
    equipoVisitante: 'Glucosoral FSC',
    jornada: 2,
    categoria: 'LigaMayor',
    estado: 'Finalizado',
    resultado: {
        tipo: 'EMPATE',
        equipoLocal: 'Farmacéuticos FSC',
        equipoVisitante: 'Glucosoral FSC',
        golesLocal: 4,
        golesVisitante: 4,
        faltasAcumuladasLocal: 3,
        faltasAcumuladasVisitante: 4
    }
};

const pf3: PartidoFutsal = {
    id: 'fut-03',
    codigoPartido: 'FUT-LIGA-J03',
    equipoLocal: 'Garra Chapina',
    equipoVisitante: 'Farmacéuticos FSC',
    jornada: 3,
    categoria: 'LigaMayor',
    estado: 'Finalizado',
    resultado: {
        tipo: 'VICTORIA_REGULAR',
        equipoLocal: 'Garra Chapina',
        equipoVisitante: 'Farmacéuticos FSC',
        golesLocal: 5,
        golesVisitante: 2,
        faltasAcumuladasLocal: 2,
        faltasAcumuladasVisitante: 6
    }
};

// --- CASO 1: Liga Mayor de Fútbol Sala Guatemala (Caso Normal) ---
const servicioNormal = new ServicioTablaFutsalInteractiva();

// --- CASO 2: Mismo Equipo, Faltas Negativas y Partido Duplicado (Caso Límite) ---
const partidoCorrupto: PartidoFutsal = {
    id: 'fut-99',
    codigoPartido: 'ERR-FUT-999',
    equipoLocal: 'Glucosoral FSC',
    equipoVisitante: 'Glucosoral FSC', // Mismo equipo -> Inválido
    jornada: -1, // Jornada negativa -> Inválida
    categoria: 'LigaMayor',
    estado: 'Finalizado',
    resultado: {
        tipo: 'VICTORIA_REGULAR',
        equipoLocal: 'Glucosoral FSC',
        equipoVisitante: 'Glucosoral FSC',
        golesLocal: -2, // Goles negativos -> Inválido
        golesVisitante: 1,
        faltasAcumuladasLocal: -1, // Faltas negativas -> Inválido
        faltasAcumuladasVisitante: 2
    }
};

const servicioLimite = new ServicioTablaFutsalInteractiva();

async function ejecutarPruebas(): Promise<void> {
    // Ejecución Caso 1
    const resumenNormal = await servicioNormal.procesarTablaAsync(
        'Liga Mayor de Futsal Guatemala 2026',
        [pf1, pf2, pf3]
    );
    mostrarResumenTablaFutsal(resumenNormal, 'Caso Normal - Liga Mayor Futsal Guatemala');

    // Ejecución Caso 2
    const resumenLimite = await servicioLimite.procesarTablaAsync(
        'Torneo Futsal Con Inconsistencias',
        [pf1, partidoCorrupto, pf1]
    );
    mostrarResumenTablaFutsal(resumenLimite, 'Caso Límite - Mismo Equipo y Faltas Negativas');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));