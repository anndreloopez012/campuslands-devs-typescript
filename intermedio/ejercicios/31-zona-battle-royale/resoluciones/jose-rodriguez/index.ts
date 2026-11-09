
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions y Literales)

export type EstadoZona = 'Esperando' | 'Cerrando' | 'Pausa' | 'Finalizada';
export type NumeroFase = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type NivelRiesgoDanio = 'Leve' | 'Moderado' | 'Critico' | 'Letal';
export type EstadoJugador = 'EnZonaSegura' | 'FueraDeZona' | 'Eliminado' | 'EliminadoPorZona';

export interface Posicion2D {
    readonly x: number;
    readonly y: number;
}

export interface CirculoZona {
    readonly centro: Posicion2D;
    readonly radioMetros: number;
}

export interface ConfiguracionFase {
    readonly numeroFase: NumeroFase;
    readonly radioMetros: number;
    readonly danioPorSegundo: number;
    readonly tiempoCierreSegundos: number;
    readonly tiempoEsperaSegundos: number;
    readonly nivelRiesgo: NivelRiesgoDanio;
}

export interface JugadorBattleRoyale {
    readonly id: string;
    readonly nombre: string;
    readonly saludActual: number;
    readonly saludMax: number;
    readonly posicion: Posicion2D;
    readonly estado: EstadoJugador;
}

export interface SimulacionZonaBR {
    readonly id: string;
    readonly mapaNombre: string;
    readonly faseActual: ConfiguracionFase;
    readonly zonaSegura: CirculoZona;
    readonly jugadores: readonly JugadorBattleRoyale[];
    readonly estadoZona: EstadoZona;
}

export interface MetricasSimulacionZona {
    readonly totalJugadores: number;
    readonly jugadoresEnZonaSegura: number;
    readonly jugadoresFueraDeZona: number;
    readonly jugadoresEliminados: number;
    readonly danioTotalProyectadoPorSegundo: number;
    readonly distanciaPromedioAlCentroMetros: number;
    readonly jugadorMasLejano: JugadorBattleRoyale | null;
    readonly desglosePorEstadoJugador: Readonly<Record<EstadoJugador, number>>;
    readonly desglosePorNivelRiesgo: Readonly<Record<NivelRiesgoDanio, number>>;
}

export interface ResumenSimulacionZona {
    readonly simulacionId: string;
    readonly mapaNombre: string;
    readonly numeroFase: NumeroFase;
    readonly totalJugadoresValidos: number;
    readonly metricas: MetricasSimulacionZona;
    readonly jugadoresProcesados: readonly JugadorBattleRoyale[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. TYPE GUARDS Y FUNCIONES DE VALIDACIÓN DE DOMINIO

export function esJugadorEnZonaSegura(jugador: JugadorBattleRoyale, zona: CirculoZona): boolean {
    const dx = jugador.posicion.x - zona.centro.x;
    const dy = jugador.posicion.y - zona.centro.y;
    const distancia = Math.sqrt(dx * dx + dy * dy);
    return distancia <= zona.radioMetros;
}

export function calcularDistanciaAlCentro(jugador: JugadorBattleRoyale, zona: CirculoZona): number {
    const dx = jugador.posicion.x - zona.centro.x;
    const dy = jugador.posicion.y - zona.centro.y;
    return Number(Math.sqrt(dx * dx + dy * dy).toFixed(1));
}

export function validarJugador(jugador: JugadorBattleRoyale): ResultadoValidacion<JugadorBattleRoyale> {
    const errores: string[] = [];

    if (jugador.saludActual < 0 || jugador.saludActual > jugador.saludMax) {
        errores.push(`Salud actual invalida (${jugador.saludActual}/${jugador.saludMax}) para el jugador "${jugador.nombre}".`);
    }

    if (jugador.saludMax <= 0) {
        errores.push(`Salud maxima invalida (${jugador.saludMax}) para "${jugador.nombre}".`);
    }

    if (jugador.nombre.trim().length === 0) {
        errores.push('El jugador debe registrar un nombre valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: jugador }
        : { esValido: false, errores };
}

export function validarSimulacionRaw(simulacion: SimulacionZonaBR): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (simulacion.zonaSegura.radioMetros <= 0) {
        advertencias.push(`Radio de zona invalido (${simulacion.zonaSegura.radioMetros} m).`);
    }

    if (simulacion.jugadores.length === 0) {
        advertencias.push('La simulacion de zona no registra jugadores activos.');
    }

    for (const j of simulacion.jugadores) {
        if (idsVistos.has(j.id)) {
            advertencias.push(`Jugador duplicado detectado por ID: ${j.id} (${j.nombre}).`);
        }
        idsVistos.add(j.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce, Record y Union Types)

const ESTADOS_JUGADOR: readonly EstadoJugador[] = [
    'EnZonaSegura',
    'FueraDeZona',
    'Eliminado',
    'EliminadoPorZona'
];

const NIVELES_RIESGO: readonly NivelRiesgoDanio[] = [
    'Leve',
    'Moderado',
    'Critico',
    'Letal'
];

export function calcularMetricasZona(
    jugadores: readonly JugadorBattleRoyale[],
    fase: ConfiguracionFase,
    zona: CirculoZona
): MetricasSimulacionZona {
    if (jugadores.length === 0) {
        const desgloseEstadoVacio = ESTADOS_JUGADOR.reduce((acc, est) => {
            acc[est] = 0;
            return acc;
        }, {} as Record<EstadoJugador, number>);

        const desgloseRiesgoVacio = NIVELES_RIESGO.reduce((acc, r) => {
            acc[r] = 0;
            return acc;
        }, {} as Record<NivelRiesgoDanio, number>);

        return {
            totalJugadores: 0,
            jugadoresEnZonaSegura: 0,
            jugadoresFueraDeZona: 0,
            jugadoresEliminados: 0,
            danioTotalProyectadoPorSegundo: 0,
            distanciaPromedioAlCentroMetros: 0,
            jugadorMasLejano: null,
            desglosePorEstadoJugador: desgloseEstadoVacio,
            desglosePorNivelRiesgo: desgloseRiesgoVacio
        };
    }

    const jugadoresEvaluados = jugadores.map((j) => {
        if (j.saludActual <= 0) {
            return j;
        }
        const dentro = esJugadorEnZonaSegura(j, zona);
        const nuevoEstado: EstadoJugador = dentro ? 'EnZonaSegura' : 'FueraDeZona';
        return { ...j, estado: nuevoEstado };
    });

    const jugadoresEnZonaSegura = jugadoresEvaluados.filter((j) => j.estado === 'EnZonaSegura').length;
    const jugadoresFueraDeZona = jugadoresEvaluados.filter((j) => j.estado === 'FueraDeZona').length;
    const jugadoresEliminados = jugadoresEvaluados.filter(
        (j) => j.estado === 'Eliminado' || j.estado === 'EliminadoPorZona'
    ).length;

    const danioTotalProyectadoPorSegundo = Number(
        (jugadoresFueraDeZona * fase.danioPorSegundo).toFixed(1)
    );

    const sumaDistancias = jugadoresEvaluados.reduce(
        (acc, j) => acc + calcularDistanciaAlCentro(j, zona),
        0
    );

    const distanciaPromedioAlCentroMetros = Number((sumaDistancias / jugadoresEvaluados.length).toFixed(1));

    const jugadorMasLejano = [...jugadoresEvaluados].sort(
        (a, b) => calcularDistanciaAlCentro(b, zona) - calcularDistanciaAlCentro(a, zona)
    )[0] ?? null;

    const desglosePorEstadoJugador = jugadoresEvaluados.reduce((acc, j) => {
        acc[j.estado] = (acc[j.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_JUGADOR.reduce((acc, est) => ({ ...acc, [est]: 0 }), {} as Record<EstadoJugador, number>));

    const desglosePorNivelRiesgo = NIVELES_RIESGO.reduce((acc, r) => {
        acc[r] = r === fase.nivelRiesgo ? jugadoresFueraDeZona : 0;
        return acc;
    }, {} as Record<NivelRiesgoDanio, number>);

    return {
        totalJugadores: jugadoresEvaluados.length,
        jugadoresEnZonaSegura,
        jugadoresFueraDeZona,
        jugadoresEliminados,
        danioTotalProyectadoPorSegundo,
        distanciaPromedioAlCentroMetros,
        jugadorMasLejano,
        desglosePorEstadoJugador,
        desglosePorNivelRiesgo
    };
}

export function procesarSimulacionZona(simulacionRaw: SimulacionZonaBR): ResumenSimulacionZona {
    const advertencias: string[] = [...validarSimulacionRaw(simulacionRaw)];
    const jugadoresValidos: JugadorBattleRoyale[] = [];

    for (const raw of simulacionRaw.jugadores) {
        const res = validarJugador(raw);
        if (res.esValido) {
            jugadoresValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasZona(jugadoresValidos, simulacionRaw.faseActual, simulacionRaw.zonaSegura);

    return {
        simulacionId: simulacionRaw.id,
        mapaNombre: simulacionRaw.mapaNombre,
        numeroFase: simulacionRaw.faseActual.numeroFase,
        totalJugadoresValidos: jugadoresValidos.length,
        metricas,
        jugadoresProcesados: jugadoresValidos,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenSimulacionZona(resumen: ResumenSimulacionZona, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` SIMULADOR DE ZONA BATTLE ROYALE - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Mapa                : ${resumen.mapaNombre}`);
    console.log(`Fase de la Zona     : Fase ${resumen.numeroFase}`);
    console.log(`Jugadores Evaluados : ${resumen.totalJugadoresValidos}`);
    console.log(`En Zona Segura      : ${resumen.metricas.jugadoresEnZonaSegura}`);
    console.log(`Fuera de la Zona    : ${resumen.metricas.jugadoresFueraDeZona}`);
    console.log(`Eliminados          : ${resumen.metricas.jugadoresEliminados}`);
    console.log(`Danio Proyectado/s  : ${resumen.metricas.danioTotalProyectadoPorSegundo} HP/s total`);
    console.log(`Dist. Prom. al Centro: ${resumen.metricas.distanciaPromedioAlCentroMetros} m`);
    console.log(`Jugador Mas Lejano  : ${resumen.metricas.jugadorMasLejano ? `${resumen.metricas.jugadorMasLejano.nombre} (${calcularDistanciaAlCentro(resumen.metricas.jugadorMasLejano, { centro: { x: 0, y: 0 }, radioMetros: 500 })} m del centro)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y INCONSISTENCIAS (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR ESTADO DE JUGADOR:`);
    Object.entries(resumen.metricas.desglosePorEstadoJugador).forEach(([estado, cantidad]) => {
        console.log(`   - ${estado.padEnd(18)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.jugadoresProcesados.map((j) => ({
            ID: j.id,
            Nombre: j.nombre,
            'Salud (HP)': `${j.saludActual}/${j.saludMax}`,
            'Posicion (X,Y)': `(${j.posicion.x}, ${j.posicion.y})`,
            Estado: j.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const fase4: ConfiguracionFase = {
    numeroFase: 4,
    radioMetros: 500,
    danioPorSegundo: 7.0,
    tiempoCierreSegundos: 90,
    tiempoEsperaSegundos: 120,
    nivelRiesgo: 'Critico'
};

const centroMapa: Posicion2D = { x: 0, y: 0 };
const zonaFase4: CirculoZona = { centro: centroMapa, radioMetros: 500 };

// --- CASO 1: Fase 4 en Mapa Battle Royale (Caso Normal) ---
const simulacionNormal: SimulacionZonaBR = {
    id: 'SIM-BR-001',
    mapaNombre: 'Mochima Island',
    faseActual: fase4,
    zonaSegura: zonaFase4,
    estadoZona: 'Cerrando',
    jugadores: [
        {
            id: 'P-101',
            nombre: 'Ninja_Gamer',
            saludActual: 100,
            saludMax: 100,
            posicion: { x: 120, y: 200 },
            estado: 'EnZonaSegura'
        },
        {
            id: 'P-102',
            nombre: 'Shroud_Sniper',
            saludActual: 85,
            saludMax: 100,
            posicion: { x: 450, y: 400 },
            estado: 'FueraDeZona'
        },
        {
            id: 'P-103',
            nombre: 'ChocoTaco',
            saludActual: 45,
            saludMax: 100,
            posicion: { x: 300, y: 300 },
            estado: 'EnZonaSegura'
        },
        {
            id: 'P-104',
            nombre: 'LootGoblin',
            saludActual: 0,
            saludMax: 100,
            posicion: { x: 700, y: 800 },
            estado: 'EliminadoPorZona'
        }
    ]
};

// --- CASO 2: Salud Inválida, Radio Cero y Jugador Duplicado (Caso Límite) ---
const simulacionLimiteCorrupta: SimulacionZonaBR = {
    id: 'SIM-FAIL-02',
    mapaNombre: 'Mapa Con Errores',
    faseActual: fase4,
    zonaSegura: { centro: centroMapa, radioMetros: 0 },
    estadoZona: 'Esperando',
    jugadores: [
        {
            id: 'P-105',
            nombre: 'Jugador Salud Negativa',
            saludActual: -20,
            saludMax: 100,
            posicion: { x: 50, y: 50 },
            estado: 'EnZonaSegura'
        },
        {
            id: 'P-106',
            nombre: 'Jugador Salud Excesiva',
            saludActual: 200,
            saludMax: 100,
            posicion: { x: 100, y: 100 },
            estado: 'EnZonaSegura'
        },
        {
            id: 'P-101',
            nombre: 'Ninja_Gamer Copia',
            saludActual: 100,
            saludMax: 100,
            posicion: { x: 120, y: 200 },
            estado: 'EnZonaSegura'
        }
    ]
};

// Ejecución
const resumenNormal = procesarSimulacionZona(simulacionNormal);
mostrarResumenSimulacionZona(resumenNormal, 'Caso Normal - Fase 4 Cierre de Zona en Mochima');

const resumenLimite = procesarSimulacionZona(simulacionLimiteCorrupta);
mostrarResumenSimulacionZona(resumenLimite, 'Caso Limite - Radio Cero y Salud Excesiva');