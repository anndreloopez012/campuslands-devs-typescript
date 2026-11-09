
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type CategoriaPingPong = 'IndividualMasculino' | 'IndividualFemenino' | 'Dobles';
export type EstadoPartidoPingPong = 'Programado' | 'EnJuego' | 'Finalizado' | 'Cancelado';

export interface JugadorPingPong {
    readonly id: string;
    readonly nombre: string;
    readonly club: string;
    readonly rankingPuntos: number;
}

export interface SetPingPong {
    readonly numeroSet: number;
    readonly puntosJugador1: number;
    readonly puntosJugador2: number;
}

export interface PartidoPingPong {
    readonly id: string;
    readonly jornada: number;
    readonly categoria: CategoriaPingPong;
    readonly jugador1: JugadorPingPong;
    readonly jugador2: JugadorPingPong;
    readonly sets: readonly SetPingPong[];
    readonly estado: EstadoPartidoPingPong;
}

export interface EstadisticasJugadorPingPong {
    readonly jugadorId: string;
    readonly nombre: string;
    readonly club: string;
    readonly partidosJugados: number;
    readonly victorias: number;
    readonly derrotas: number;
    readonly setsGanados: number;
    readonly setsPerdidos: number;
    readonly puntosGanados: number;
    readonly puntosPerdidos: number;
    readonly diferenciaPuntos: number;
    readonly puntosLiga: number;
}

export interface MetricasLigaPingPong {
    readonly totalPartidos: number;
    readonly partidosFinalizados: number;
    readonly totalSetsJugados: number;
    readonly totalPuntosAnotados: number;
    readonly promedioPuntosPorPartido: number;
    readonly liderTabla: EstadisticasJugadorPingPong | null;
    readonly tablaPosiciones: readonly EstadisticasJugadorPingPong[];
}

export interface ResumenLigaPingPong {
    readonly nombreLiga: string;
    readonly metricas: MetricasLigaPingPong;
    readonly partidosProcesados: readonly PartidoPingPong[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarSetPingPong(set: SetPingPong): ResultadoValidacion<SetPingPong> {
    const errores: string[] = [];
    const { puntosJugador1, puntosJugador2, numeroSet } = set;

    if (puntosJugador1 < 0 || puntosJugador2 < 0) {
        errores.push(`Puntuacion negativa en el set ${numeroSet} (${puntosJugador1} - ${puntosJugador2}).`);
    }

    const maxPuntos = Math.max(puntosJugador1, puntosJugador2);
    const minPuntos = Math.min(puntosJugador1, puntosJugador2);
    const diferencia = maxPuntos - minPuntos;

    if (maxPuntos < 11) {
        errores.push(`Un set de pingpong debe ser ganado alcanzando al menos 11 puntos (Set ${numeroSet}: ${puntosJugador1} - ${puntosJugador2}).`);
    }

    if (diferencia < 2) {
        errores.push(`El ganador del set ${numeroSet} debe tener una ventaja minima de 2 puntos (${puntosJugador1} - ${puntosJugador2}).`);
    }

    if (maxPuntos > 11 && diferencia !== 2) {
        errores.push(`Marcador invalido en desempate del set ${numeroSet} (${puntosJugador1} - ${puntosJugador2}): ventaja debe ser exactamente de 2 puntos.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: set }
        : { esValido: false, errores };
}

export function validarPartidoPingPong(partido: PartidoPingPong): readonly string[] {
    const advertencias: string[] = [];

    if (partido.jugador1.id === partido.jugador2.id) {
        advertencias.push(`El partido ${partido.id} no puede enfrentar al jugador contra si mismo (${partido.jugador1.nombre}).`);
    }

    if (partido.jornada <= 0) {
        advertencias.push(`Jornada invalida en el partido ${partido.id} (Jornada ${partido.jornada}).`);
    }

    if (partido.estado === 'Finalizado') {
        if (partido.sets.length === 0) {
            advertencias.push(`El partido ${partido.id} esta marcado como Finalizado pero no registra sets.`);
        }

        let setsJ1 = 0;
        let setsJ2 = 0;

        for (const set of partido.sets) {
            if (set.puntosJugador1 > set.puntosJugador2) setsJ1++;
            else if (set.puntosJugador2 > set.puntosJugador1) setsJ2++;
        }

        if (setsJ1 < 3 && setsJ2 < 3) {
            advertencias.push(`El partido ${partido.id} finalizo sin que ningun jugador alcanzara 3 sets ganados (${setsJ1} - ${setsJ2}).`);
        }
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS DE TABLA DE POSICIONES

export function calcularTablaPosicionesPingPong(partidos: readonly PartidoPingPong[]): readonly EstadisticasJugadorPingPong[] {
    const mapaJugadores = new Map<string, EstadisticasJugadorPingPong>();

    const obtenerOCrearJugador = (j: JugadorPingPong): EstadisticasJugadorPingPong => {
        const existente = mapaJugadores.get(j.id);
        if (existente) return existente;

        const nuevo: EstadisticasJugadorPingPong = {
            jugadorId: j.id,
            nombre: j.nombre,
            club: j.club,
            partidosJugados: 0,
            victorias: 0,
            derrotas: 0,
            setsGanados: 0,
            setsPerdidos: 0,
            puntosGanados: 0,
            puntosPerdidos: 0,
            diferenciaPuntos: 0,
            puntosLiga: 0
        };
        mapaJugadores.set(j.id, nuevo);
        return nuevo;
    };

    for (const partido of partidos) {
        if (partido.estado !== 'Finalizado' || partido.sets.length === 0) continue;

        const j1 = obtenerOCrearJugador(partido.jugador1);
        const j2 = obtenerOCrearJugador(partido.jugador2);

        let setsGanadosJ1 = 0;
        let setsGanadosJ2 = 0;
        let puntosTotalesJ1 = 0;
        let puntosTotalesJ2 = 0;

        for (const s of partido.sets) {
            puntosTotalesJ1 += s.puntosJugador1;
            puntosTotalesJ2 += s.puntosJugador2;
            if (s.puntosJugador1 > s.puntosJugador2) setsGanadosJ1++;
            else if (s.puntosJugador2 > s.puntosJugador1) setsGanadosJ2++;
        }

        const j1Gano = setsGanadosJ1 > setsGanadosJ2;

        mapaJugadores.set(j1.jugadorId, {
            ...j1,
            partidosJugados: j1.partidosJugados + 1,
            victorias: j1.victorias + (j1Gano ? 1 : 0),
            derrotas: j1.derrotas + (j1Gano ? 0 : 1),
            setsGanados: j1.setsGanados + setsGanadosJ1,
            setsPerdidos: j1.setsPerdidos + setsGanadosJ2,
            puntosGanados: j1.puntosGanados + puntosTotalesJ1,
            puntosPerdidos: j1.puntosPerdidos + puntosTotalesJ2,
            diferenciaPuntos: j1.diferenciaPuntos + (puntosTotalesJ1 - puntosTotalesJ2),
            puntosLiga: j1.puntosLiga + (j1Gano ? 2 : 1) // 2 puntos por victoria, 1 por derrota jugada
        });

        mapaJugadores.set(j2.jugadorId, {
            ...j2,
            partidosJugados: j2.partidosJugados + 1,
            victorias: j2.victorias + (j1Gano ? 0 : 1),
            derrotas: j2.derrotas + (j1Gano ? 1 : 0),
            setsGanados: j2.setsGanados + setsGanadosJ2,
            setsPerdidos: j2.setsPerdidos + setsGanadosJ1,
            puntosGanados: j2.puntosGanados + puntosTotalesJ2,
            puntosPerdidos: j2.puntosPerdidos + puntosTotalesJ1,
            diferenciaPuntos: j2.diferenciaPuntos + (puntosTotalesJ2 - puntosTotalesJ1),
            puntosLiga: j2.puntosLiga + (j1Gano ? 1 : 2)
        });
    }

    // Criterio oficial: Puntos de Liga > Diferencia de Sets > Diferencia de Puntos
    return Array.from(mapaJugadores.values()).sort((a, b) => {
        if (b.puntosLiga !== a.puntosLiga) return b.puntosLiga - a.puntosLiga;
        const diffSetsA = a.setsGanados - a.setsPerdidos;
        const diffSetsB = b.setsGanados - b.setsPerdidos;
        if (diffSetsB !== diffSetsA) return diffSetsB - diffSetsA;
        return b.diferenciaPuntos - a.diferenciaPuntos;
    });
}

export function calcularMetricasLiga(partidos: readonly PartidoPingPong[]): MetricasLigaPingPong {
    const partidosFinalizados = partidos.filter((p) => p.estado === 'Finalizado').length;
    const totalSetsJugados = partidos.reduce((acc, p) => acc + p.sets.length, 0);

    const totalPuntosAnotados = partidos.reduce((acc, p) => {
        return acc + p.sets.reduce((sum, s) => sum + s.puntosJugador1 + s.puntosJugador2, 0);
    }, 0);

    const promedioPuntosPorPartido = partidosFinalizados > 0
        ? Number((totalPuntosAnotados / partidosFinalizados).toFixed(1))
        : 0;

    const tablaPosiciones = calcularTablaPosicionesPingPong(partidos);
    const liderTabla = tablaPosiciones[0] ?? null;

    return {
        totalPartidos: partidos.length,
        partidosFinalizados,
        totalSetsJugados,
        totalPuntosAnotados,
        promedioPuntosPorPartido,
        liderTabla,
        tablaPosiciones
    };
}

export function procesarLigaPingPong(nombreLiga: string, partidosRaw: readonly PartidoPingPong[]): ResumenLigaPingPong {
    const advertencias: string[] = [];
    const partidosValidos: PartidoPingPong[] = [];

    for (const p of partidosRaw) {
        const advPartido = validarPartidoPingPong(p);
        advertencias.push(...advPartido);

        let setsValidos = true;
        for (const s of p.sets) {
            const resS = validarSetPingPong(s);
            if (!resS.esValido) {
                setsValidos = false;
                advertencias.push(...resS.errores.map((err) => `Partido ${p.id}: ${err}`));
            }
        }

        if (advPartido.length === 0 && setsValidos) {
            partidosValidos.push(p);
        }
    }

    const metricas = calcularMetricasLiga(partidosValidos);

    return {
        nombreLiga,
        metricas,
        partidosProcesados: partidosValidos,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenLigaPingPong(resumen: ResumenLigaPingPong, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` LIGA PROFESIONAL DE PING PONG - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Liga                : ${resumen.nombreLiga}`);
    console.log(`Partidos Totales    : ${resumen.metricas.totalPartidos} (Finalizados: ${resumen.metricas.partidosFinalizados})`);
    console.log(`Sets / Puntos Tot.  : ${resumen.metricas.totalSetsJugados} sets / ${resumen.metricas.totalPuntosAnotados} pts`);
    console.log(`Promedio Pts/Partido: ${resumen.metricas.promedioPuntosPorPartido}`);
    console.log(`Lider del Torneo    : ${resumen.metricas.liderTabla ? `${resumen.metricas.liderTabla.nombre} (${resumen.metricas.liderTabla.puntosLiga} pts liga)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y ERRORES DE REGLAMENTO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    if (resumen.metricas.tablaPosiciones.length > 0) {
        console.log(`TABLA DE POSICIONES OFICIAL:`);
        console.table(
            resumen.metricas.tablaPosiciones.map((t, idx) => ({
                Pos: `#${idx + 1}`,
                Jugador: t.nombre,
                Club: t.club,
                PJ: t.partidosJugados,
                PG: t.victorias,
                PP: t.derrotas,
                'Sets G/P': `${t.setsGanados}/${t.setsPerdidos}`,
                'Pts G/P': `${t.puntosGanados}/${t.puntosPerdidos}`,
                DiffPts: t.diferenciaPuntos,
                PtsLiga: t.puntosLiga
            }))
        );
    }
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const jug1: JugadorPingPong = { id: 'player-01', nombre: 'Ma Long', club: 'Dragon Club', rankingPuntos: 2800 };
const jug2: JugadorPingPong = { id: 'player-02', nombre: 'Fan Zhendong', club: 'Red Star', rankingPuntos: 2750 };
const jug3: JugadorPingPong = { id: 'player-03', nombre: 'Hugo Calderano', club: 'America TTC', rankingPuntos: 2400 };

// --- CASO 1: Jornada de Liga Regular al mejor de 5 sets (Caso Normal) ---
const jornadaNormal: readonly PartidoPingPong[] = [
    {
        id: 'PART-001',
        jornada: 1,
        categoria: 'IndividualMasculino',
        jugador1: jug1,
        jugador2: jug2,
        estado: 'Finalizado',
        sets: [
            { numeroSet: 1, puntosJugador1: 11, puntosJugador2: 9 },
            { numeroSet: 2, puntosJugador1: 12, puntosJugador2: 10 },
            { numeroSet: 3, puntosJugador1: 9, puntosJugador2: 11 },
            { numeroSet: 4, puntosJugador1: 11, puntosJugador2: 8 }
        ]
    },
    {
        id: 'PART-002',
        jornada: 1,
        categoria: 'IndividualMasculino',
        jugador1: jug2,
        jugador2: jug3,
        estado: 'Finalizado',
        sets: [
            { numeroSet: 1, puntosJugador1: 11, puntosJugador2: 6 },
            { numeroSet: 2, puntosJugador1: 11, puntosJugador2: 7 },
            { numeroSet: 3, puntosJugador1: 11, puntosJugador2: 5 }
        ]
    }
];

// --- CASO 2: Set Incompleto, Marcador de Desempate Inválido y AutoEnfrentamiento (Caso Límite) ---
const jornadaLimiteCorrupta: readonly PartidoPingPong[] = [
    {
        id: 'PART-003',
        jornada: 2,
        categoria: 'IndividualMasculino',
        jugador1: jug1,
        jugador2: jug1, // Mismo jugador
        estado: 'Finalizado',
        sets: [
            { numeroSet: 1, puntosJugador1: 11, puntosJugador2: 4 }
        ]
    },
    {
        id: 'PART-004',
        jornada: 2,
        categoria: 'IndividualMasculino',
        jugador1: jug3,
        jugador2: jug2,
        estado: 'Finalizado',
        sets: [
            { numeroSet: 1, puntosJugador1: 10, puntosJugador2: 8 }, // Set ganado con 10 pts (Invalido)
            { numeroSet: 2, puntosJugador1: 14, puntosJugador2: 13 }  // Desempate sin 2 pts ventaja (Invalido)
        ]
    }
];

// Ejecución
const resumenNormal = procesarLigaPingPong('Liga Nacional de Tenis de Mesa 2026', jornadaNormal);
mostrarResumenLigaPingPong(resumenNormal, 'Caso Normal - Jornada Regular de Torneo');

const resumenLimite = procesarLigaPingPong('Liga Nacional 2026 - Control de Reglamento', jornadaLimiteCorrupta);
mostrarResumenLigaPingPong(resumenLimite, 'Caso Limite - Errores de Marcador y Desempate');