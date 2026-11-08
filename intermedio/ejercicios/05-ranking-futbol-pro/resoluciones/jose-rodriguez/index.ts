// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)
export type PosicionJugador = 'Portero' | 'Defensa' | 'Centrocampista' | 'Delantero';
export type LigaFutbol = 'LaLiga' | 'Premier League' | 'Serie A' | 'Bundesliga' | 'Ligue 1';

export interface EstadisticasFutbol {
    readonly partidosJugados: number;
    readonly goles: number;
    readonly asistencias: number;
    readonly tarjetasAmarillas: number;
    readonly tarjetasRojas: number;
    readonly minutosJugados: number;
    readonly pasesCompletados: number;
    readonly pasesTotales: number;
}

export interface JugadorFutbol {
    readonly id: string;
    readonly nombre: string;
    readonly posicion: PosicionJugador;
    readonly equipo: string;
    readonly liga: LigaFutbol;
    readonly stats: EstadisticasFutbol;
}

export interface MetricasRanking {
    readonly golesPorPartido: number;
    readonly contribucionGoles: number;
    readonly eficienciaPasesPct: number;
    readonly promedioMinutosPorPartido: number;
    readonly puntajeRendimiento: number; // Rating de 0 a 100
}

export interface JugadorRankeado {
    readonly posicionRanking: number;
    readonly jugador: JugadorFutbol;
    readonly metricas: MetricasRanking;
}

export interface ResumenRankingFutbol {
    readonly totalJugadoresValidos: number;
    readonly liderGoleador: JugadorRankeado | null;
    readonly liderAsistente: JugadorRankeado | null;
    readonly promedioGolesGeneral: number;
    readonly ranking: readonly JugadorRankeado[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };
// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO
export function validarJugadorFutbol(jugador: JugadorFutbol): ResultadoValidacion<JugadorFutbol> {
    const errores: string[] = [];
    const { partidosJugados, goles, asistencias, tarjetasAmarillas, tarjetasRojas, minutosJugados, pasesCompletados, pasesTotales } = jugador.stats;

    if (partidosJugados < 0 || goles < 0 || asistencias < 0 || tarjetasAmarillas < 0 || tarjetasRojas < 0 || minutosJugados < 0) {
        errores.push(`El jugador ${jugador.nombre} contiene estadísticas con valores negativos.`);
    }

    if (pasesCompletados > pasesTotales) {
        errores.push(`El jugador ${jugador.nombre} no puede tener mas pases completados (${pasesCompletados}) que pases totales (${pasesTotales}).`);
    }

    const minutosMaximosPosibles = partidosJugados * 120; // 90 min + tiempo extra maximo
    if (minutosJugados > minutosMaximosPosibles) {
        errores.push(`El jugador ${jugador.nombre} registra mas minutos jugados (${minutosJugados}) de los posibles para sus partidos (${partidosJugados}).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: jugador }
        : { esValido: false, errores };
}
// 3. TRANSFORMACIÓN Y CÁLCULOS
export function calcularMetricasJugador(stats: EstadisticasFutbol): MetricasRanking {
    const { partidosJugados, goles, asistencias, tarjetasAmarillas, tarjetasRojas, minutosJugados, pasesCompletados, pasesTotales } = stats;

    const golesPorPartido = partidosJugados > 0 ? Number((goles / partidosJugados).toFixed(2)) : 0;
    const contribucionGoles = goles + asistencias;
    const eficienciaPasesPct = pasesTotales > 0 ? Number(((pasesCompletados / pasesTotales) * 100).toFixed(1)) : 0;
    const promedioMinutosPorPartido = partidosJugados > 0 ? Number((minutosJugados / partidosJugados).toFixed(1)) : 0;

    // Algoritmo de Rating de Rendimiento (Puntaje ponderado de 0 a 100)
    const baseGoles = goles * 4;
    const baseAsistencias = asistencias * 3;
    const basePases = (eficienciaPasesPct / 100) * 15;
    const penalizacionTarjetas = tarjetasAmarillas * 2 + tarjetasRojas * 5;

    const calculoBruto = baseGoles + baseAsistencias + basePases - penalizacionTarjetas;
    const puntajeRendimiento = Number(Math.max(0, Math.min(100, calculoBruto)).toFixed(1));

    return {
        golesPorPartido,
        contribucionGoles,
        eficienciaPasesPct,
        promedioMinutosPorPartido,
        puntajeRendimiento
    };
}

export function procesarRankingFutbol(jugadoresRaw: readonly JugadorFutbol[]): ResumenRankingFutbol {
    const advertencias: string[] = [];
    const jugadoresValidos: JugadorFutbol[] = [];

    for (const raw of jugadoresRaw) {
        const res = validarJugadorFutbol(raw);
        if (res.esValido) {
            jugadoresValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    if (jugadoresValidos.length === 0) {
        return {
            totalJugadoresValidos: 0,
            liderGoleador: null,
            liderAsistente: null,
            promedioGolesGeneral: 0,
            ranking: [],
            advertencias
        };
    }

    // Generar lista de jugadores procesados con sus métricas
    const procesados = jugadoresValidos.map((jugador) => ({
        jugador,
        metricas: calcularMetricasJugador(jugador.stats)
    }));

    // Ordenar por Puntaje de Rendimiento (Mayor a menor); desempatar por contribución directa de goles
    const ordenados = [...procesados].sort((a, b) => {
        if (b.metricas.puntajeRendimiento !== a.metricas.puntajeRendimiento) {
            return b.metricas.puntajeRendimiento - a.metricas.puntajeRendimiento;
        }
        return b.metricas.contribucionGoles - a.metricas.contribucionGoles;
    });

    // Asignar posición ordinal en el ranking
    const ranking: readonly JugadorRankeado[] = ordenados.map((item, index) => ({
        posicionRanking: index + 1,
        jugador: item.jugador,
        metricas: item.metricas
    }));

    const totalGoles = ranking.reduce((acc, r) => acc + r.jugador.stats.goles, 0);
    const promedioGolesGeneral = Number((totalGoles / ranking.length).toFixed(2));

    // Determinar Líder Goleador y Líder Asistente
    const liderGoleador = [...ranking].sort((a, b) => b.jugador.stats.goles - a.jugador.stats.goles)[0] ?? null;
    const liderAsistente = [...ranking].sort((a, b) => b.jugador.stats.asistencias - a.jugador.stats.asistencias)[0] ?? null;

    return {
        totalJugadoresValidos: ranking.length,
        liderGoleador,
        liderAsistente,
        promedioGolesGeneral,
        ranking,
        advertencias
    };
}
// 4. PRESENTACIÓN Y SALIDA POR CONSOLA
export function mostrarResumenRanking(resumen: ResumenRankingFutbol, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` RANKING PRO DE JUGADORES DE FUTBOL - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Jugadores Eval : ${resumen.totalJugadoresValidos}`);
    console.log(`Promedio Goles : ${resumen.promedioGolesGeneral} por jugador`);
    console.log(`Lider Goleador : ${resumen.liderGoleador ? `${resumen.liderGoleador.jugador.nombre} (${resumen.liderGoleador.jugador.stats.goles} goles)` : 'N/A'}`);
    console.log(`Lider Asistente: ${resumen.liderAsistente ? `${resumen.liderAsistente.jugador.nombre} (${resumen.liderAsistente.jugador.stats.asistencias} asistencias)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y REGISTROS INVALIDOS (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.table(
        resumen.ranking.map((r) => ({
            Rank: `#${r.posicionRanking}`,
            Jugador: r.jugador.nombre,
            Posicion: r.jugador.posicion,
            Equipo: r.jugador.equipo,
            Partidos: r.jugador.stats.partidosJugados,
            Goles: r.jugador.stats.goles,
            Asistencias: r.jugador.stats.asistencias,
            'Pases %': `${r.metricas.eficienciaPasesPct}%`,
            'Goles/Partido': r.metricas.golesPorPartido,
            Rating: r.metricas.puntajeRendimiento
        }))
    );
}
// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)
// --- CASO 1: Lista Normal de Estrellas de Fútbol ---
const jugadoresCasoNormal: readonly JugadorFutbol[] = [
    {
        id: 'player-01',
        nombre: 'Robert Lewandowski',
        posicion: 'Delantero',
        equipo: 'FC Barcelona',
        liga: 'LaLiga',
        stats: {
            partidosJugados: 18,
            goles: 16,
            asistencias: 4,
            tarjetasAmarillas: 2,
            tarjetasRojas: 0,
            minutosJugados: 1520,
            pasesCompletados: 320,
            pasesTotales: 410
        }
    },
    {
        id: 'player-02',
        nombre: 'Kevin De Bruyne',
        posicion: 'Centrocampista',
        equipo: 'Manchester City',
        liga: 'Premier League',
        stats: {
            partidosJugados: 16,
            goles: 5,
            asistencias: 14,
            tarjetasAmarillas: 1,
            tarjetasRojas: 0,
            minutosJugados: 1380,
            pasesCompletados: 890,
            pasesTotales: 1020
        }
    },
    {
        id: 'player-03',
        nombre: 'Virgil van Dijk',
        posicion: 'Defensa',
        equipo: 'Liverpool FC',
        liga: 'Premier League',
        stats: {
            partidosJugados: 20,
            goles: 2,
            asistencias: 1,
            tarjetasAmarillas: 3,
            tarjetasRojas: 0,
            minutosJugados: 1800,
            pasesCompletados: 1450,
            pasesTotales: 1580
        }
    },
    {
        id: 'player-04',
        nombre: 'Thibaut Courtois',
        posicion: 'Portero',
        equipo: 'Real Madrid',
        liga: 'LaLiga',
        stats: {
            partidosJugados: 15,
            goles: 0,
            asistencias: 0,
            tarjetasAmarillas: 0,
            tarjetasRojas: 0,
            minutosJugados: 1350,
            pasesCompletados: 410,
            pasesTotales: 460
        }
    }
];

// --- CASO 2: Datos Corruptos y Jugador Suplente sin Minutos (Caso Límite) ---
const jugadoresCasoLimite: readonly JugadorFutbol[] = [
    {
        id: 'player-05',
        nombre: 'Suplente Juvenil',
        posicion: 'Delantero',
        equipo: 'Sevilla FC',
        liga: 'LaLiga',
        stats: {
            partidosJugados: 0,
            goles: 0,
            asistencias: 0,
            tarjetasAmarillas: 0,
            tarjetasRojas: 0,
            minutosJugados: 0,
            pasesCompletados: 0,
            pasesTotales: 0
        }
    },
    {
        id: 'player-06',
        nombre: 'Jugador Corrupto Pases',
        posicion: 'Centrocampista',
        equipo: 'Inter Milan',
        liga: 'Serie A',
        stats: {
            partidosJugados: 10,
            goles: 3,
            asistencias: 2,
            tarjetasAmarillas: 1,
            tarjetasRojas: 0,
            minutosJugados: 900,
            pasesCompletados: 500,
            pasesTotales: 400 // Pases completados > pases totales (Invalido)
        }
    },
    {
        id: 'player-07',
        nombre: 'Jugador Minutos Imposibles',
        posicion: 'Defensa',
        equipo: 'PSG',
        liga: 'Ligue 1',
        stats: {
            partidosJugados: 2,
            goles: 0,
            asistencias: 0,
            tarjetasAmarillas: 0,
            tarjetasRojas: 0,
            minutosJugados: 500, // 500 min en 2 partidos es imposible (Invalido)
            pasesCompletados: 100,
            pasesTotales: 120
        }
    }
];

// Ejecución
const rankingNormal = procesarRankingFutbol(jugadoresCasoNormal);
mostrarResumenRanking(rankingNormal, 'Caso Normal - Estrellas de Europa');

const rankingLimite = procesarRankingFutbol(jugadoresCasoLimite);
mostrarResumenRanking(rankingLimite, 'Caso Limite - Suplente y Datos Corruptos');