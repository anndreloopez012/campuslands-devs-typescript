// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type RolSquad = 'Entry Fragger' | 'Support' | 'IGL' | 'Sniper' | 'Anchor';
export type RangoJugador = 'Bronce' | 'Plata' | 'Oro' | 'Platino' | 'Diamante' | 'Radiante';

export interface EstadisticasCombate {
    readonly kills: number;
    readonly deaths: number;
    readonly assists: number;
    readonly damageDealt: number;
    readonly headshots: number;
    readonly roundsPlayed: number;
}

export interface Jugador {
    readonly id: string;
    readonly nickname: string;
    readonly rol: RolSquad;
    readonly rango: RangoJugador;
    readonly stats: EstadisticasCombate;
}

export interface MetricasCalculadas {
    readonly kdRatio: number;
    readonly kdaRatio: number;
    readonly headshotPct: number;
    readonly adr: number; // Average Damage per Round
}

export interface JugadorProcesado extends Jugador {
    readonly metricas: MetricasCalculadas;
}

export interface ResumenDashboardSquad {
    readonly totalKills: number;
    readonly totalDeaths: number;
    readonly totalAssists: number;
    readonly squadKD: number;
    readonly mvp: JugadorProcesado | null;
    readonly squadSize: number;
    readonly jugadores: readonly JugadorProcesado[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly error: string };

// 2. VALIDACIONES (Funciones Puras de Dominio)

export function validarJugador(jugador: Jugador): ResultadoValidacion<Jugador> {
    const { kills, deaths, assists, damageDealt, headshots, roundsPlayed } = jugador.stats;

    if (kills < 0 || deaths < 0 || assists < 0 || damageDealt < 0 || headshots < 0 || roundsPlayed < 0) {
        return {
            esValido: false,
            error: `El jugador ${jugador.nickname} contiene estadísticas con valores negativos.`
        };
    }

    if (headshots > kills) {
        return {
            esValido: false,
            error: `El jugador ${jugador.nickname} no puede tener más headshots (${headshots}) que kills (${kills}).`
        };
    }

    return { esValido: true, datos: jugador };
}

// 3. TRANSFORMACIÓN Y CÁLCULOS MATEMÁTICOS

/**
 * Calcula el ratio K/D.
 * Regla de negocio: Si las muertes son 0, se usa 1 como divisor para evitar división por cero (Perfect K/D).
 */
export function calcularKD(kills: number, deaths: number): number {
    const divisor = deaths === 0 ? 1 : deaths;
    return Number((kills / divisor).toFixed(2));
}

export function calcularKDA(kills: number, assists: number, deaths: number): number {
    const divisor = deaths === 0 ? 1 : deaths;
    return Number(((kills + assists) / divisor).toFixed(2));
}

export function calcularHeadshotPct(headshots: number, kills: number): number {
    if (kills === 0) return 0;
    return Number(((headshots / kills) * 100).toFixed(1));
}

export function calcularADR(damageDealt: number, roundsPlayed: number): number {
    if (roundsPlayed === 0) return 0;
    return Number((damageDealt / roundsPlayed).toFixed(1));
}

export function procesarJugador(jugador: Jugador): JugadorProcesado {
    const { kills, deaths, assists, damageDealt, headshots, roundsPlayed } = jugador.stats;

    return {
        ...jugador,
        metricas: {
            kdRatio: calcularKD(kills, deaths),
            kdaRatio: calcularKDA(kills, assists, deaths),
            headshotPct: calcularHeadshotPct(headshots, kills),
            adr: calcularADR(damageDealt, roundsPlayed)
        }
    };
}

export function procesarDashboardSquad(jugadoresRaw: readonly Jugador[]): ResumenDashboardSquad {
    const jugadoresValidos: Jugador[] = [];

    for (const raw of jugadoresRaw) {
        const validacion = validarJugador(raw);
        if (validacion.esValido) {
            jugadoresValidos.push(validacion.datos);
        } else {
            console.warn(`[VALIDACIÓN FALLIDA] ${validacion.error}`);
        }
    }

    if (jugadoresValidos.length === 0) {
        return {
            totalKills: 0,
            totalDeaths: 0,
            totalAssists: 0,
            squadKD: 0,
            mvp: null,
            squadSize: 0,
            jugadores: []
        };
    }

    const jugadoresProcesados = jugadoresValidos.map(procesarJugador);

    const totalKills = jugadoresProcesados.reduce((acc, j) => acc + j.stats.kills, 0);
    const totalDeaths = jugadoresProcesados.reduce((acc, j) => acc + j.stats.deaths, 0);
    const totalAssists = jugadoresProcesados.reduce((acc, j) => acc + j.stats.assists, 0);

    const squadKD = calcularKD(totalKills, totalDeaths);

    // Criterio de MVP: Mayor KDA; en empate, mayor ADR
    const mvp = [...jugadoresProcesados].sort((a, b) => {
        if (b.metricas.kdaRatio !== a.metricas.kdaRatio) {
            return b.metricas.kdaRatio - a.metricas.kdaRatio;
        }
        return b.metricas.adr - a.metricas.adr;
    })[0] ?? null;

    return {
        totalKills,
        totalDeaths,
        totalAssists,
        squadKD,
        mvp,
        squadSize: jugadoresProcesados.length,
        jugadores: jugadoresProcesados
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarDashboard(resumen: ResumenDashboardSquad, titulo: string): void {
    console.log(`\n==================================================`);
    console.log(` DASHBOARD K/D DE SQUAD - ${titulo.toUpperCase()}`);
    console.log(`==================================================`);
    console.log(`Jugadores procesados : ${resumen.squadSize}`);
    console.log(`Total K/D/A Squad    : ${resumen.totalKills} / ${resumen.totalDeaths} / ${resumen.totalAssists}`);
    console.log(`Squad K/D Ratio      : ${resumen.squadKD}`);
    console.log(`MVP de la partida    : ${resumen.mvp ? `${resumen.mvp.nickname} (${resumen.mvp.rol}) - KDA: ${resumen.mvp.metricas.kdaRatio}` : 'N/A'}`);
    console.log(`--------------------------------------------------`);

    console.table(
        resumen.jugadores.map((j) => ({
            Nickname: j.nickname,
            Rol: j.rol,
            Rango: j.rango,
            'K/D/A': `${j.stats.kills}/${j.stats.deaths}/${j.stats.assists}`,
            'K/D Ratio': j.metricas.kdRatio,
            'KDA Ratio': j.metricas.kdaRatio,
            'HS %': `${j.metricas.headshotPct}%`,
            ADR: j.metricas.adr
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: Squad Normal ---
const squadNormal: readonly Jugador[] = [
    {
        id: 'p-1',
        nickname: 'ViperX',
        rol: 'Entry Fragger',
        rango: 'Radiante',
        stats: { kills: 24, deaths: 12, assists: 5, damageDealt: 3200, headshots: 16, roundsPlayed: 20 }
    },
    {
        id: 'p-2',
        nickname: 'ShadowShield',
        rol: 'Support',
        rango: 'Platino',
        stats: { kills: 8, deaths: 10, assists: 18, damageDealt: 1800, headshots: 3, roundsPlayed: 20 }
    },
    {
        id: 'p-3',
        nickname: 'TacticalMind',
        rol: 'IGL',
        rango: 'Diamante',
        stats: { kills: 14, deaths: 11, assists: 12, damageDealt: 2400, headshots: 7, roundsPlayed: 20 }
    },
    {
        id: 'p-4',
        nickname: 'EagleEye',
        rol: 'Sniper',
        rango: 'Radiante',
        stats: { kills: 22, deaths: 6, assists: 4, damageDealt: 3500, headshots: 18, roundsPlayed: 20 }
    }
];

// --- CASO 2: Casos Límite (Jugador Flawless 0 muertes, jugador inactivo 0 stats, y dato corrupto) ---
const squadCasosLimite: readonly Jugador[] = [
    {
        id: 'p-5',
        nickname: 'GhostGod',
        rol: 'Sniper',
        rango: 'Radiante',
        stats: { kills: 15, deaths: 0, assists: 2, damageDealt: 2100, headshots: 12, roundsPlayed: 12 } // 0 muertes
    },
    {
        id: 'p-6',
        nickname: 'AFK_Player',
        rol: 'Anchor',
        rango: 'Bronce',
        stats: { kills: 0, deaths: 0, assists: 0, damageDealt: 0, headshots: 0, roundsPlayed: 0 } // 0 en todo
    },
    {
        id: 'p-7',
        nickname: 'HackerCheater',
        rol: 'Entry Fragger',
        rango: 'Oro',
        stats: { kills: 5, deaths: 2, assists: 1, damageDealt: 500, headshots: 10, roundsPlayed: 10 } // Headshots > Kills (Invalido)
    }
];

// Ejecución
const resultadoNormal = procesarDashboardSquad(squadNormal);
mostrarDashboard(resultadoNormal, 'Partida Competitiva (Caso Normal)');

const resultadoLimite = procesarDashboardSquad(squadCasosLimite);
mostrarDashboard(resultadoLimite, 'Evaluación de Casos Límite y Datos Corruptos');