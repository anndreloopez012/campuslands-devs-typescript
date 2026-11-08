// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)
export type FaseTorneo = 'FaseDeGrupos' | 'Octavos' | 'Cuartos' | 'Semifinal' | 'Final';
export type EstadoPartido = 'Programado' | 'EnJuego' | 'Finalizado' | 'Suspendido';

export interface EquipoFutsal {
    readonly id: string;
    readonly nombre: string;
    readonly ciudad: string;
}

export interface ResultadoFutsal {
    readonly golesLocal: number;
    readonly golesVisitante: number;
    readonly penalesLocal?: number;
    readonly penalesVisitante?: number;
}

export interface PartidoFutsal {
    readonly id: string;
    readonly jornada: number;
    readonly fase: FaseTorneo;
    readonly equipoLocal: EquipoFutsal;
    readonly equipoVisitante: EquipoFutsal;
    readonly fechaHora: string; // Formato ISO AAAA-MM-DDTHH:mm
    readonly cancha: string;
    readonly estado: EstadoPartido;
    readonly resultado?: ResultadoFutsal;
}

export interface TablaPosicionesEquipo {
    readonly equipoId: string;
    readonly nombre: string;
    readonly partidosJugados: number;
    readonly victorias: number;
    readonly empates: number;
    readonly derrotas: number;
    readonly golesFavor: number;
    readonly golesContra: number;
    readonly diferenciaGoles: number;
    readonly puntos: number;
}

export interface MetricasTorneo {
    readonly totalPartidos: number;
    readonly partidosFinalizados: number;
    readonly partidosPendientes: number;
    readonly totalGolesAnotados: number;
    readonly promedioGolesPorPartido: number;
    readonly equipoLider: TablaPosicionesEquipo | null;
    readonly tablaPosiciones: readonly TablaPosicionesEquipo[];
}

export interface ResumenTorneoFutsal {
    readonly nombreTorneo: string;
    readonly metricas: MetricasTorneo;
    readonly partidosProcesados: readonly PartidoFutsal[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };
// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO
export function validarPartido(partido: PartidoFutsal): ResultadoValidacion<PartidoFutsal> {
    const errores: string[] = [];

    if (partido.equipoLocal.id === partido.equipoVisitante.id) {
        errores.push(`El partido ${partido.id} no puede enfrentar al equipo contra si mismo (${partido.equipoLocal.nombre}).`);
    }

    if (partido.jornada <= 0) {
        errores.push(`El partido ${partido.id} tiene un numero de jornada invalido (${partido.jornada}).`);
    }

    if (partido.estado === 'Finalizado') {
        if (!partido.resultado) {
            errores.push(`El partido ${partido.id} esta marcado como Finalizado pero no registra resultado.`);
        } else {
            const { golesLocal, golesVisitante, penalesLocal, penalesVisitante } = partido.resultado;

            if (golesLocal < 0 || golesVisitante < 0) {
                errores.push(`El partido ${partido.id} contiene marcadores de goles negativos (${golesLocal} - ${golesVisitante}).`);
            }

            if (partido.fase !== 'FaseDeGrupos' && golesLocal === golesVisitante) {
                if (penalesLocal === undefined || penalesVisitante === undefined) {
                    errores.push(`El partido ${partido.id} de fase eliminatoria (${partido.fase}) finalizo en empate pero no define penales.`);
                } else if (penalesLocal < 0 || penalesVisitante < 0 || penalesLocal === penalesVisitante) {
                    errores.push(`El desempate por penales en el partido ${partido.id} es invalido (${penalesLocal} - ${penalesVisitante}).`);
                }
            }
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: partido }
        : { esValido: false, errores };
}

export function validarCalendarioTorneo(partidos: readonly PartidoFutsal[]): readonly string[] {
    const advertencias: string[] = [];
    const idsPartidos = new Set<string>();

    if (partidos.length === 0) {
        advertencias.push('El calendario no registra ningún partido programado.');
    }

    for (const partido of partidos) {
        if (idsPartidos.has(partido.id)) {
            advertencias.push(`Identificador de partido duplicado: ${partido.id}.`);
        }
        idsPartidos.add(partido.id);
    }

    return advertencias;
}
// 3. TRANSFORMACIÓN Y CÁLCULOS DE TABLA DE POSICIONES
export function calcularTablaPosiciones(partidos: readonly PartidoFutsal[]): readonly TablaPosicionesEquipo[] {
    const mapaEquipos = new Map<string, TablaPosicionesEquipo>();

    const obtenerOCrearEquipo = (equipo: EquipoFutsal): TablaPosicionesEquipo => {
        const existente = mapaEquipos.get(equipo.id);
        if (existente) return existente;

        const nuevo: TablaPosicionesEquipo = {
            equipoId: equipo.id,
            nombre: equipo.nombre,
            partidosJugados: 0,
            victorias: 0,
            empates: 0,
            derrotas: 0,
            golesFavor: 0,
            golesContra: 0,
            diferenciaGoles: 0,
            puntos: 0
        };
        mapaEquipos.set(equipo.id, nuevo);
        return nuevo;
    };

    for (const partido of partidos) {
        if (partido.estado !== 'Finalizado' || !partido.resultado) continue;

        const eqLocal = obtenerOCrearEquipo(partido.equipoLocal);
        const eqVisitante = obtenerOCrearEquipo(partido.equipoVisitante);
        const { golesLocal, golesVisitante } = partido.resultado;

        let vLocal = 0, eLocal = 0, dLocal = 0, ptsLocal = 0;
        let vVis = 0, eVis = 0, dVis = 0, ptsVis = 0;

        if (golesLocal > golesVisitante) {
            vLocal = 1; ptsLocal = 3;
            dVis = 1; ptsVis = 0;
        } else if (golesVisitante > golesLocal) {
            vVis = 1; ptsVis = 3;
            dLocal = 1; ptsLocal = 0;
        } else {
            eLocal = 1; ptsLocal = 1;
            eVis = 1; ptsVis = 1;
        }

        mapaEquipos.set(eqLocal.equipoId, {
            ...eqLocal,
            partidosJugados: eqLocal.partidosJugados + 1,
            victorias: eqLocal.victorias + vLocal,
            empates: eqLocal.empates + eLocal,
            derrotas: eqLocal.derrotas + dLocal,
            golesFavor: eqLocal.golesFavor + golesLocal,
            golesContra: eqLocal.golesContra + golesVisitante,
            diferenciaGoles: eqLocal.diferenciaGoles + (golesLocal - golesVisitante),
            puntos: eqLocal.puntos + ptsLocal
        });

        mapaEquipos.set(eqVisitante.equipoId, {
            ...eqVisitante,
            partidosJugados: eqVisitante.partidosJugados + 1,
            victorias: eqVisitante.victorias + vVis,
            empates: eqVisitante.empates + eVis,
            derrotas: eqVisitante.derrotas + dVis,
            golesFavor: eqVisitante.golesFavor + golesVisitante,
            golesContra: eqVisitante.golesContra + golesLocal,
            diferenciaGoles: eqVisitante.diferenciaGoles + (golesVisitante - golesLocal),
            puntos: eqVisitante.puntos + ptsVis
        });
    }

    // Criterio oficial Futsal: Puntos > Diferencia de Goles > Goles a Favor
    return Array.from(mapaEquipos.values()).sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        if (b.diferenciaGoles !== a.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
        return b.golesFavor - a.golesFavor;
    });
}

export function calcularMetricasTorneo(partidos: readonly PartidoFutsal[]): MetricasTorneo {
    const partidosFinalizados = partidos.filter((p) => p.estado === 'Finalizado' && p.resultado).length;
    const partidosPendientes = partidos.filter((p) => p.estado === 'Programado' || p.estado === 'EnJuego').length;

    const totalGolesAnotados = partidos.reduce((acc, p) => {
        if (p.estado === 'Finalizado' && p.resultado) {
            return acc + p.resultado.golesLocal + p.resultado.golesVisitante;
        }
        return acc;
    }, 0);

    const promedioGolesPorPartido = partidosFinalizados > 0
        ? Number((totalGolesAnotados / partidosFinalizados).toFixed(2))
        : 0;

    const tablaPosiciones = calcularTablaPosiciones(partidos);
    const equipoLider = tablaPosiciones[0] ?? null;

    return {
        totalPartidos: partidos.length,
        partidosFinalizados,
        partidosPendientes,
        totalGolesAnotados,
        promedioGolesPorPartido,
        equipoLider,
        tablaPosiciones
    };
}

export function procesarTorneoFutsal(nombreTorneo: string, partidosRaw: readonly PartidoFutsal[]): ResumenTorneoFutsal {
    const advertencias: string[] = [...validarCalendarioTorneo(partidosRaw)];
    const partidosValidos: PartidoFutsal[] = [];

    for (const raw of partidosRaw) {
        const res = validarPartido(raw);
        if (res.esValido) {
            partidosValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasTorneo(partidosValidos);

    return {
        nombreTorneo,
        metricas,
        partidosProcesados: partidosValidos,
        advertencias
    };
}
// 4. PRESENTACIÓN Y SALIDA POR CONSOLA
export function mostrarResumenTorneo(resumen: ResumenTorneoFutsal, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` TORNEO DE FUTBOL SALA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Torneo              : ${resumen.nombreTorneo}`);
    console.log(`Partidos Procesados : ${resumen.metricas.totalPartidos} (Finalizados: ${resumen.metricas.partidosFinalizados}, Pendientes: ${resumen.metricas.partidosPendientes})`);
    console.log(`Total Goles         : ${resumen.metricas.totalGolesAnotados} (Promedio: ${resumen.metricas.promedioGolesPorPartido} por partido)`);
    console.log(`Equipo Lider        : ${resumen.metricas.equipoLider ? `${resumen.metricas.equipoLider.nombre} (${resumen.metricas.equipoLider.puntos} pts)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REGISTRO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    if (resumen.metricas.tablaPosiciones.length > 0) {
        console.log(`TABLA DE POSICIONES GENERAL:`);
        console.table(
            resumen.metricas.tablaPosiciones.map((t, idx) => ({
                Pos: `#${idx + 1}`,
                Equipo: t.nombre,
                PJ: t.partidosJugados,
                PG: t.victorias,
                PE: t.empates,
                PP: t.derrotas,
                GF: t.golesFavor,
                GC: t.golesContra,
                DG: t.diferenciaGoles,
                PTS: t.puntos
            }))
        );
    }
}
// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)
const eq1: EquipoFutsal = { id: 'eq-1', nombre: 'Boqueron Futsal', ciudad: 'Guatemala' };
const eq2: EquipoFutsal = { id: 'eq-2', nombre: 'Gladios FS', ciudad: 'Mixco' };
const eq3: EquipoFutsal = { id: 'eq-3', nombre: 'Titanium Club', ciudad: 'Villa Nueva' };
const eq4: EquipoFutsal = { id: 'eq-4', nombre: 'Deportivo San Jose', ciudad: 'Escuintla' };

// --- CASO 1: Calendario Regular de Fase de Grupos (Caso Normal) ---
const calendarioNormal: readonly PartidoFutsal[] = [
    {
        id: 'mat-001',
        jornada: 1,
        fase: 'FaseDeGrupos',
        equipoLocal: eq1,
        equipoVisitante: eq2,
        fechaHora: '2026-11-10T19:00',
        cancha: 'Domo Polideportivo Zona 13',
        estado: 'Finalizado',
        resultado: { golesLocal: 5, golesVisitante: 3 }
    },
    {
        id: 'mat-002',
        jornada: 1,
        fase: 'FaseDeGrupos',
        equipoLocal: eq3,
        equipoVisitante: eq4,
        fechaHora: '2026-11-10T20:30',
        cancha: 'Domo Polideportivo Zona 13',
        estado: 'Finalizado',
        resultado: { golesLocal: 2, golesVisitante: 2 }
    },
    {
        id: 'mat-003',
        jornada: 2,
        fase: 'FaseDeGrupos',
        equipoLocal: eq1,
        equipoVisitante: eq3,
        fechaHora: '2026-11-17T19:00',
        cancha: 'Gimnasio Teodoro Palacios',
        estado: 'Finalizado',
        resultado: { golesLocal: 4, golesVisitante: 1 }
    },
    {
        id: 'mat-004',
        jornada: 2,
        fase: 'FaseDeGrupos',
        equipoLocal: eq2,
        equipoVisitante: eq4,
        fechaHora: '2026-11-17T20:30',
        cancha: 'Gimnasio Teodoro Palacios',
        estado: 'Programado'
    }
];

// --- CASO 2: Partido Autogolpe, Marcador Negativo y Empate sin Penales (Caso Límite) ---
const calendarioLimiteCorrupto: readonly PartidoFutsal[] = [
    {
        id: 'mat-005',
        jornada: 3,
        fase: 'FaseDeGrupos',
        equipoLocal: eq1,
        equipoVisitante: eq1, // Partido contra si mismo (Invalido)
        fechaHora: '2026-11-24T19:00',
        cancha: 'Domo Zona 13',
        estado: 'Finalizado',
        resultado: { golesLocal: 3, golesVisitante: 1 }
    },
    {
        id: 'mat-006',
        jornada: 3,
        fase: 'FaseDeGrupos',
        equipoLocal: eq2,
        equipoVisitante: eq3,
        fechaHora: '2026-11-24T20:30',
        cancha: 'Domo Zona 13',
        estado: 'Finalizado',
        resultado: { golesLocal: -2, golesVisitante: 4 } // Marcador negativo (Invalido)
    },
    {
        id: 'mat-007',
        jornada: 4,
        fase: 'Final',
        equipoLocal: eq1,
        equipoVisitante: eq4,
        fechaHora: '2026-12-01T20:00',
        cancha: 'Domo Zona 13',
        estado: 'Finalizado',
        resultado: { golesLocal: 3, golesVisitante: 3 } // Empate en Final sin penales (Invalido)
    }
];

// Ejecución
const resumenNormal = procesarTorneoFutsal('Liga Mayor Futsal 2026', calendarioNormal);
mostrarResumenTorneo(resumenNormal, 'Caso Normal - Calendario de Grupos');

const resumenLimite = procesarTorneoFutsal('Liga Mayor Futsal 2026 - Errores', calendarioLimiteCorrupto);
mostrarResumenTorneo(resumenLimite, 'Caso Limite - Partidos Corruptos y Reglas Invalidadas');