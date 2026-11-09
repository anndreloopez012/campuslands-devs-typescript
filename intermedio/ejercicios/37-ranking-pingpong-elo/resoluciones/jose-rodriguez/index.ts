
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions y Literales)

export type CategoriaPingPong =
    | 'Principiante'
    | 'Amateur'
    | 'Avanzado'
    | 'Pro'
    | 'Elite';

export type ManoDominante = 'Diestro' | 'Zurdo' | 'Ambidiestro';
export type EstiloJuego = 'Ofensivo' | 'Defensivo' | 'AllRound' | 'Contraataque';
export type EstadoPartido = 'Finalizado' | 'EnProgreso' | 'Cancelado' | 'NoPresentado';
export type ResultadoJugador = 'Victoria' | 'Derrota';

export interface JugadorPingPong {
    readonly id: string;
    readonly nombre: string;
    readonly club: string;
    readonly mano: ManoDominante;
    readonly estilo: EstiloJuego;
    readonly eloInicial: number;
    readonly eloActual: number;
    readonly partidosJugados: number;
    readonly victorias: number;
    readonly derrotas: number;
}

export interface PartidoPingPong {
    readonly id: string;
    readonly codigoPartido: string;
    readonly jugadorAId: string;
    readonly jugadorBId: string;
    readonly setsJugadorA: number;
    readonly setsJugadorB: number;
    readonly ganadorId: string;
    readonly estado: EstadoPartido;
    readonly fecha: string;
    readonly factorK: number; // Factor K para calculo ELO (ej: 32)
}

export interface ActualizacionEloJugador {
    readonly partidoId: string;
    readonly jugadorId: string;
    readonly eloAnterior: number;
    readonly eloNuevo: number;
    readonly cambioElo: number;
    readonly resultado: ResultadoJugador;
    readonly eloRival: number;
    readonly probabilidadEsperada: number;
}

export interface RankingLigaPingPong {
    readonly id: string;
    readonly nombreLiga: string;
    readonly temporada: string;
    readonly jugadores: readonly JugadorPingPong[];
    readonly partidosHistorial: readonly PartidoPingPong[];
}

export interface MetricasRankingElo {
    readonly totalJugadores: number;
    readonly totalPartidosProcesados: number;
    readonly eloMaximo: number;
    readonly eloPromedio: number;
    readonly eloMinimo: number;
    readonly jugadorTopRanking: JugadorPingPong | null;
    readonly jugadorMayorIncrementoElo: { readonly jugador: JugadorPingPong; readonly incremento: number } | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaPingPong, number>>;
    readonly desglosePorEstilo: Readonly<Record<EstiloJuego, number>>;
}

export interface ResumenRankingElo {
    readonly ligaId: string;
    readonly nombreLiga: string;
    readonly totalPartidosValidos: number;
    readonly metricas: MetricasRankingElo;
    readonly rankingOrdenado: readonly JugadorPingPong[];
    readonly historialActualizaciones: readonly ActualizacionEloJugador[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. TYPE GUARDS Y FUNCIONES DE VALIDACIÓN DE DOMINIO

export function determinarCategoriaElo(elo: number): CategoriaPingPong {
    if (elo >= 2200) return 'Elite';
    if (elo >= 1800) return 'Pro';
    if (elo >= 1500) return 'Avanzado';
    if (elo >= 1200) return 'Amateur';
    return 'Principiante';
}

export function validarJugadorPingPong(jugador: JugadorPingPong): ResultadoValidacion<JugadorPingPong> {
    const errores: string[] = [];

    if (jugador.eloActual < 100 || jugador.eloActual > 3500) {
        errores.push(`Puntaje ELO fuera de rango (${jugador.eloActual}) para el jugador "${jugador.nombre}".`);
    }

    if (jugador.partidosJugados < 0 || jugador.victorias < 0 || jugador.derrotas < 0) {
        errores.push(`Estadisticas de partidos negativas en el jugador "${jugador.nombre}".`);
    }

    if (jugador.victorias + jugador.derrotas > jugador.partidosJugados) {
        errores.push(`Inconsistencia en record de "${jugador.nombre}": Victorias + Derrotas supera los partidos jugados.`);
    }

    if (jugador.nombre.trim().length === 0) {
        errores.push('El jugador debe registrar un nombre valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: jugador }
        : { esValido: false, errores };
}

export function validarPartidoPingPong(
    partido: PartidoPingPong,
    jugadoresMap: Map<string, JugadorPingPong>
): ResultadoValidacion<PartidoPingPong> {
    const errores: string[] = [];

    if (partido.jugadorAId === partido.jugadorBId) {
        errores.push(`Inconsistencia en partido ${partido.codigoPartido}: Un jugador no puede enfrentarse a si mismo.`);
    }

    if (!jugadoresMap.has(partido.jugadorAId)) {
        errores.push(`El jugador A (ID: ${partido.jugadorAId}) no existe en la base de datos de la liga.`);
    }

    if (!jugadoresMap.has(partido.jugadorBId)) {
        errores.push(`El jugador B (ID: ${partido.jugadorBId}) no existe en la base de datos de la liga.`);
    }

    if (partido.estado === 'Finalizado') {
        if (partido.setsJugadorA === 0 && partido.setsJugadorB === 0) {
            errores.push(`El marcador (0-0) no es valido para un partido finalizado en ${partido.codigoPartido}.`);
        }

        if (partido.ganadorId !== partido.jugadorAId && partido.ganadorId !== partido.jugadorBId) {
            errores.push(`El ganador asignado (${partido.ganadorId}) no corresponde a ningun competidor del partido.`);
        }

        const ganadorPorSets = partido.setsJugadorA > partido.setsJugadorB ? partido.jugadorAId : partido.jugadorBId;
        if (partido.ganadorId !== ganadorPorSets) {
            errores.push(
                `Inconsistencia en ${partido.codigoPartido}: Marcador (${partido.setsJugadorA}-${partido.setsJugadorB}) no coincide con el ganador registrado.`
            );
        }
    }

    if (partido.factorK <= 0 || partido.factorK > 64) {
        errores.push(`Factor K fuera de rango (${partido.factorK}) en el partido ${partido.codigoPartido}.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: partido }
        : { esValido: false, errores };
}

export function validarLigaRaw(liga: RankingLigaPingPong): readonly string[] {
    const advertencias: string[] = [];
    const idsJugadores = new Set<string>();
    const idsPartidos = new Set<string>();

    if (liga.jugadores.length === 0) {
        advertencias.push(`La liga "${liga.nombreLiga}" no registra jugadores inscritos.`);
    }

    for (const j of liga.jugadores) {
        if (idsJugadores.has(j.id)) {
            advertencias.push(`Jugador duplicado detectado por ID: ${j.id} (${j.nombre}).`);
        }
        idsJugadores.add(j.id);
    }

    for (const p of liga.partidosHistorial) {
        if (idsPartidos.has(p.id)) {
            advertencias.push(`Partido duplicado en el historial por ID: ${p.id}.`);
        }
        idsPartidos.add(p.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS ELO (Uso de reduce, Record y Math)

const CATEGORIAS_PINGPONG: readonly CategoriaPingPong[] = [
    'Principiante',
    'Amateur',
    'Avanzado',
    'Pro',
    'Elite'
];

const ESTILOS_JUEGO: readonly EstiloJuego[] = ['Ofensivo', 'Defensivo', 'AllRound', 'Contraataque'];

export function calcularEsperanzaElo(eloA: number, eloB: number): number {
    return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

export function procesarPartidoElo(
    partido: PartidoPingPong,
    jugadorA: JugadorPingPong,
    jugadorB: JugadorPingPong
): {
    readonly nuevoJugadorA: JugadorPingPong;
    readonly nuevoJugadorB: JugadorPingPong;
    readonly actualizacionA: ActualizacionEloJugador;
    readonly actualizacionB: ActualizacionEloJugador;
} {
    const esperanzaA = calcularEsperanzaElo(jugadorA.eloActual, jugadorB.eloActual);
    const esperanzaB = calcularEsperanzaElo(jugadorB.eloActual, jugadorA.eloActual);

    const esGanadorA = partido.ganadorId === jugadorA.id;
    const puntajeA = esGanadorA ? 1 : 0;
    const puntajeB = esGanadorA ? 0 : 1;

    const cambioA = Math.round(partido.factorK * (puntajeA - esperanzaA));
    const cambioB = Math.round(partido.factorK * (puntajeB - esperanzaB));

    const eloNuevoA = jugadorA.eloActual + cambioA;
    const eloNuevoB = jugadorB.eloActual + cambioB;

    const nuevoJugadorA: JugadorPingPong = {
        ...jugadorA,
        eloActual: eloNuevoA,
        partidosJugados: jugadorA.partidosJugados + 1,
        victorias: jugadorA.victorias + (esGanadorA ? 1 : 0),
        derrotas: jugadorA.derrotas + (esGanadorA ? 0 : 1)
    };

    const nuevoJugadorB: JugadorPingPong = {
        ...jugadorB,
        eloActual: eloNuevoB,
        partidosJugados: jugadorB.partidosJugados + 1,
        victorias: jugadorB.victorias + (esGanadorA ? 0 : 1),
        derrotas: jugadorB.derrotas + (esGanadorA ? 1 : 0)
    };

    const actualizacionA: ActualizacionEloJugador = {
        partidoId: partido.id,
        jugadorId: jugadorA.id,
        eloAnterior: jugadorA.eloActual,
        eloNuevo: eloNuevoA,
        cambioElo: cambioA,
        resultado: esGanadorA ? 'Victoria' : 'Derrota',
        eloRival: jugadorB.eloActual,
        probabilidadEsperada: Number(esperanzaA.toFixed(3))
    };

    const actualizacionB: ActualizacionEloJugador = {
        partidoId: partido.id,
        jugadorId: jugadorB.id,
        eloAnterior: jugadorB.eloActual,
        eloNuevo: eloNuevoB,
        cambioElo: cambioB,
        resultado: esGanadorA ? 'Derrota' : 'Victoria',
        eloRival: jugadorA.eloActual,
        probabilidadEsperada: Number(esperanzaB.toFixed(3))
    };

    return { nuevoJugadorA, nuevoJugadorB, actualizacionA, actualizacionB };
}

export function calcularMetricasRanking(
    jugadores: readonly JugadorPingPong[],
    totalPartidos: number
): MetricasRankingElo {
    if (jugadores.length === 0) {
        const desgloseCatVacio = CATEGORIAS_PINGPONG.reduce((acc, c) => {
            acc[c] = 0;
            return acc;
        }, {} as Record<CategoriaPingPong, number>);

        const desgloseEstiloVacio = ESTILOS_JUEGO.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstiloJuego, number>);

        return {
            totalJugadores: 0,
            totalPartidosProcesados: 0,
            eloMaximo: 0,
            eloPromedio: 0,
            eloMinimo: 0,
            jugadorTopRanking: null,
            jugadorMayorIncrementoElo: null,
            desglosePorCategoria: desgloseCatVacio,
            desglosePorEstilo: desgloseEstiloVacio
        };
    }

    const elos = jugadores.map((j) => j.eloActual);
    const eloMaximo = Math.max(...elos);
    const eloMinimo = Math.min(...elos);
    const sumaElo = jugadores.reduce((acc, j) => acc + j.eloActual, 0);
    const eloPromedio = Math.round(sumaElo / jugadores.length);

    const jugadorTopRanking = [...jugadores].sort((a, b) => b.eloActual - a.eloActual)[0] ?? null;

    const mayorIncrementoObj = [...jugadores]
        .map((j) => ({ jugador: j, incremento: j.eloActual - j.eloInicial }))
        .sort((a, b) => b.incremento - a.incremento)[0] ?? null;

    const desglosePorCategoria = jugadores.reduce((acc, j) => {
        const cat = determinarCategoriaElo(j.eloActual);
        acc[cat] = (acc[cat] ?? 0) + 1;
        return acc;
    }, CATEGORIAS_PINGPONG.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CategoriaPingPong, number>));

    const desglosePorEstilo = jugadores.reduce((acc, j) => {
        acc[j.estilo] = (acc[j.estilo] ?? 0) + 1;
        return acc;
    }, ESTILOS_JUEGO.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstiloJuego, number>));

    return {
        totalJugadores: jugadores.length,
        totalPartidosProcesados: totalPartidos,
        eloMaximo,
        eloPromedio,
        eloMinimo,
        jugadorTopRanking,
        jugadorMayorIncrementoElo: mayorIncrementoObj,
        desglosePorCategoria,
        desglosePorEstilo
    };
}

export function procesarRankingLigaPingPong(ligaRaw: RankingLigaPingPong): ResumenRankingElo {
    const advertencias: string[] = [...validarLigaRaw(ligaRaw)];
    const mapaJugadores = new Map<string, JugadorPingPong>();

    for (const j of ligaRaw.jugadores) {
        const resJ = validarJugadorPingPong(j);
        if (resJ.esValido) {
            mapaJugadores.set(j.id, resJ.datos);
        } else {
            advertencias.push(...resJ.errores);
        }
    }

    const historialActualizaciones: ActualizacionEloJugador[] = [];
    let partidosValidosContador = 0;

    for (const p of ligaRaw.partidosHistorial) {
        const resP = validarPartidoPingPong(p, mapaJugadores);
        if (!resP.esValido) {
            advertencias.push(...resP.errores);
            continue;
        }

        if (p.estado !== 'Finalizado') {
            continue;
        }

        const jugA = mapaJugadores.get(p.jugadorAId);
        const jugB = mapaJugadores.get(p.jugadorBId);

        if (jugA && jugB) {
            const { nuevoJugadorA, nuevoJugadorB, actualizacionA, actualizacionB } = procesarPartidoElo(p, jugA, jugB);

            mapaJugadores.set(jugA.id, nuevoJugadorA);
            mapaJugadores.set(jugB.id, nuevoJugadorB);
            historialActualizaciones.push(actualizacionA, actualizacionB);
            partidosValidosContador++;
        }
    }

    const rankingOrdenado = Array.from(mapaJugadores.values()).sort((a, b) => b.eloActual - a.eloActual);
    const metricas = calcularMetricasRanking(rankingOrdenado, partidosValidosContador);

    return {
        ligaId: ligaRaw.id,
        nombreLiga: ligaRaw.nombreLiga,
        totalPartidosValidos: partidosValidosContador,
        metricas,
        rankingOrdenado,
        historialActualizaciones,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenRanking(resumen: ResumenRankingElo, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` RANKING ELO PING PONG - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Liga                : ${resumen.nombreLiga}`);
    console.log(`Jugadores Registrados: ${resumen.metricas.totalJugadores}`);
    console.log(`Partidos Procesados : ${resumen.totalPartidosValidos}`);
    console.log(`ELO Maximo          : ${resumen.metricas.eloMaximo}`);
    console.log(`ELO Promedio        : ${resumen.metricas.eloPromedio}`);
    console.log(`ELO Minimo          : ${resumen.metricas.eloMinimo}`);
    console.log(`Top 1 Jugador       : ${resumen.metricas.jugadorTopRanking ? `${resumen.metricas.jugadorTopRanking.nombre} (${resumen.metricas.jugadorTopRanking.eloActual} ELO - ${determinarCategoriaElo(resumen.metricas.jugadorTopRanking.eloActual)})` : 'N/A'}`);
    console.log(`Mayor Avance ELO    : ${resumen.metricas.jugadorMayorIncrementoElo ? `${resumen.metricas.jugadorMayorIncrementoElo.jugador.nombre} (+${resumen.metricas.jugadorMayorIncrementoElo.incremento} pts)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REGISTRO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE JUGADORES POR CATEGORIA ELO:`);
    Object.entries(resumen.metricas.desglosePorCategoria).forEach(([cat, cantidad]) => {
        console.log(`   - ${cat.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.rankingOrdenado.map((j, idx) => ({
            Posicion: `#${idx + 1}`,
            Nombre: j.nombre,
            Club: j.club,
            Mano: j.mano,
            Estilo: j.estilo,
            'ELO Inicial': j.eloInicial,
            'ELO Actual': j.eloActual,
            Categoria: determinarCategoriaElo(j.eloActual),
            'P/V/D': `${j.partidosJugados}/${j.victorias}/${j.derrotas}`
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const fanZhendong: JugadorPingPong = {
    id: 'player-01',
    nombre: 'Fan Zhendong',
    club: 'Shanghai Team',
    mano: 'Diestro',
    estilo: 'Ofensivo',
    eloInicial: 2400,
    eloActual: 2400,
    partidosJugados: 50,
    victorias: 45,
    derrotas: 5
};

const maLong: JugadorPingPong = {
    id: 'player-02',
    nombre: 'Ma Long',
    club: 'Beijing Team',
    mano: 'Diestro',
    estilo: 'AllRound',
    eloInicial: 2450,
    eloActual: 2450,
    partidosJugados: 60,
    victorias: 54,
    derrotas: 6
};

const felixLebrun: JugadorPingPong = {
    id: 'player-03',
    nombre: 'Félix Lebrun',
    club: 'Alliance Nîmes',
    mano: 'Diestro',
    estilo: 'Contraataque',
    eloInicial: 2100,
    eloActual: 2100,
    partidosJugados: 30,
    victorias: 22,
    derrotas: 8
};

const hugoCalderano: JugadorPingPong = {
    id: 'player-04',
    nombre: 'Hugo Calderano',
    club: 'Ochsenhausen',
    mano: 'Diestro',
    estilo: 'Ofensivo',
    eloInicial: 2050,
    eloActual: 2050,
    partidosJugados: 35,
    victorias: 25,
    derrotas: 10
};

// --- CASO 1: Torneo World Table Tennis (Caso Normal) ---
const ligaNormal: RankingLigaPingPong = {
    id: 'WTT-LIGA-2026',
    nombreLiga: 'WTT Champions Grand Smash 2026',
    temporada: '2026',
    jugadores: [fanZhendong, maLong, felixLebrun, hugoCalderano],
    partidosHistorial: [
        {
            id: 'm-01',
            codigoPartido: 'WTT_SF1',
            jugadorAId: 'player-01', // Fan Zhendong
            jugadorBId: 'player-03', // Félix Lebrun
            setsJugadorA: 3,
            setsJugadorB: 1,
            ganadorId: 'player-01',
            estado: 'Finalizado',
            fecha: '2026-11-01',
            factorK: 32
        },
        {
            id: 'm-02',
            codigoPartido: 'WTT_SF2',
            jugadorAId: 'player-02', // Ma Long
            jugadorBId: 'player-04', // Hugo Calderano
            setsJugadorA: 3,
            setsJugadorB: 2,
            ganadorId: 'player-02',
            estado: 'Finalizado',
            fecha: '2026-11-01',
            factorK: 32
        },
        {
            id: 'm-03',
            codigoPartido: 'WTT_FINAL',
            jugadorAId: 'player-01', // Fan Zhendong
            jugadorBId: 'player-02', // Ma Long
            setsJugadorA: 4,
            setsJugadorB: 2,
            ganadorId: 'player-01',
            estado: 'Finalizado',
            fecha: '2026-11-02',
            factorK: 32
        }
    ]
};

// --- CASO 2: Jugador Inexistente, Marcador Inconsistente y Partido Duplicado (Caso Límite) ---
const jugadorCorrupto: JugadorPingPong = {
    id: 'player-99',
    nombre: 'Jugador ELO Negativo',
    club: 'Sin Club',
    mano: 'Zurdo',
    estilo: 'Defensivo',
    eloInicial: 50, // ELO < 100 -> Invalido
    eloActual: 50,
    partidosJugados: 5,
    victorias: 10, // Victorias > Partidos -> Incoherente
    derrotas: 0
};

const ligaLimiteCorrupta: RankingLigaPingPong = {
    id: 'LIGA-FAIL-02',
    nombreLiga: 'Liga Con Registros Inconsistentes',
    temporada: '2026',
    jugadores: [fanZhendong, jugadorCorrupto],
    partidosHistorial: [
        {
            id: 'm-04',
            codigoPartido: 'ERR_01',
            jugadorAId: 'player-01',
            jugadorBId: 'player-999', // Jugador B inexistente -> Invalido
            setsJugadorA: 3,
            setsJugadorB: 0,
            ganadorId: 'player-01',
            estado: 'Finalizado',
            fecha: '2026-11-05',
            factorK: 32
        },
        {
            id: 'm-05',
            codigoPartido: 'ERR_02',
            jugadorAId: 'player-01',
            jugadorBId: 'player-01', // Mismo jugador A y B -> Invalido
            setsJugadorA: 3,
            setsJugadorB: 1,
            ganadorId: 'player-01',
            estado: 'Finalizado',
            fecha: '2026-11-06',
            factorK: 32
        },
        {
            id: 'm-01', // ID duplicado
            codigoPartido: 'WTT_SF1',
            jugadorAId: 'player-01',
            jugadorBId: 'player-03',
            setsJugadorA: 3,
            setsJugadorB: 1,
            ganadorId: 'player-01',
            estado: 'Finalizado',
            fecha: '2026-11-01',
            factorK: 32
        }
    ]
};

// Ejecución
const resumenNormal = procesarRankingLigaPingPong(ligaNormal);
mostrarResumenRanking(resumenNormal, 'Caso Normal - WTT Champions Grand Smash 2026');

const resumenLimite = procesarRankingLigaPingPong(ligaLimiteCorrupta);
mostrarResumenRanking(resumenLimite, 'Caso Limite - Jugador Inexistente y Marcador Incoherente');