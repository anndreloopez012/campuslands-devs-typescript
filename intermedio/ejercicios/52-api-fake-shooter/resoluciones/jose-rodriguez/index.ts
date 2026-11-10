
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Promises)

export type ModoJuego =
    | 'BattleRoyale'
    | 'DesafíoDeEquipos'
    | 'BuscarYDestruir'
    | 'Dominio'
    | 'TodosContraTodos';

export type RangoJugador =
    | 'Bronce'
    | 'Plata'
    | 'Oro'
    | 'Platino'
    | 'Diamante'
    | 'Maestro'
    | 'Predador';

export type RolEscuadra =
    | 'Asalto'
    | 'Francotirador'
    | 'Apoyo'
    | 'Reconocimiento'
    | 'Ingeniero';

export interface JugadorShooter {
    readonly id: string;
    readonly gamertag: string;
    readonly nivel: number;
    readonly rango: RangoJugador;
    readonly rolPrincipal: RolEscuadra;
    readonly bajas: number;
    readonly muertes: number;
    readonly asistencias: number;
    readonly danoCausado: number;
    readonly headshots: number;
    readonly partidasJugadas: number;
    readonly partidasGanadas: number;
    readonly latenciaPingMS: number;
}

export type RespuestaAPI<T> =
    | { readonly exito: true; readonly status: number; readonly datos: T; readonly tiempoRespuestaMS: number }
    | { readonly exito: false; readonly status: number; readonly error: string; readonly tiempoRespuestaMS: number };

export interface MetricasEstadisticas {
    readonly totalJugadores: number;
    readonly kdrPromedio: number;
    readonly porcentajeVictoriasPromedio: number;
    readonly headshotPctPromedio: number;
    readonly danoPromedioPorPartida: number;
    readonly jugadorTopKdr: JugadorShooter | null;
    readonly desglosePorRango: Readonly<Record<RangoJugador, number>>;
    readonly desglosePorRol: Readonly<Record<RolEscuadra, number>>;
}

export interface ResumenClienteAPI {
    readonly endpointSolicitado: string;
    readonly tiempoRespuestaMS: number;
    readonly totalJugadoresValidos: number;
    readonly metricas: MetricasEstadisticas;
    readonly jugadoresProcesados: readonly JugadorShooter[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CLIENTE API FAKE (Async/Await & Simulation)

export class ClienteAPIFakeShooter {
    constructor(
        private readonly baseUrl: string,
        private readonly simularLatenciaMS: number = 25
    ) { }

    public async obtenerJugadoresAsync(
        endpoint: string,
        simularErrorRed: boolean = false
    ): Promise<RespuestaAPI<readonly JugadorShooter[]>> {
        const inicioTiempo = Date.now();

        await new Promise((resolve) => setTimeout(resolve, this.simularLatenciaMS));

        const tiempoRespuestaMS = Date.now() - inicioTiempo;

        if (simularErrorRed) {
            return {
                exito: false,
                status: 503,
                error: 'Servidor no disponible. Error 503 Service Unavailable.',
                tiempoRespuestaMS
            };
        }

        const jugadoresFake: readonly JugadorShooter[] = [
            {
                id: 'p-01',
                gamertag: 'Ghost_Reaper',
                nivel: 150,
                rango: 'Predador',
                rolPrincipal: 'Francotirador',
                bajas: 2450,
                muertes: 980,
                asistencias: 430,
                danoCausado: 480000,
                headshots: 1100,
                partidasJugadas: 320,
                partidasGanadas: 210,
                latenciaPingMS: 18
            },
            {
                id: 'p-02',
                gamertag: 'Neo_Madness',
                nivel: 135,
                rango: 'Maestro',
                rolPrincipal: 'Asalto',
                bajas: 1890,
                muertes: 920,
                asistencias: 610,
                danoCausado: 390000,
                headshots: 750,
                partidasJugadas: 280,
                partidasGanadas: 175,
                latenciaPingMS: 24
            },
            {
                id: 'p-03',
                gamertag: 'Valkyrie_Shield',
                nivel: 98,
                rango: 'Diamante',
                rolPrincipal: 'Apoyo',
                bajas: 950,
                muertes: 780,
                asistencias: 1200,
                danoCausado: 280000,
                headshots: 310,
                partidasJugadas: 210,
                partidasGanadas: 115,
                latenciaPingMS: 32
            }
        ];

        return {
            exito: true,
            status: 200,
            datos: jugadoresFake,
            tiempoRespuestaMS
        };
    }
}

// 3. VALIDACIONES Y REGLAS DE NEGOCIO

export function calcularKDR(bajas: number, muertes: number): number {
    if (muertes <= 0) return Number(bajas.toFixed(2));
    return Number((bajas / muertes).toFixed(2));
}

export function calcularHeadshotPct(headshots: number, bajas: number): number {
    if (bajas <= 0) return 0;
    return Number(((headshots / bajas) * 100).toFixed(1));
}

export function validarJugadorShooter(jugador: JugadorShooter): ResultadoValidacion<JugadorShooter> {
    const errores: string[] = [];

    if (jugador.nivel <= 0) {
        errores.push(`Nivel de jugador invalido (${jugador.nivel}) para "${jugador.gamertag}".`);
    }

    if (jugador.bajas < 0 || jugador.muertes < 0 || jugador.asistencias < 0) {
        errores.push(`Estadisticas negativas de combate registradas en "${jugador.gamertag}".`);
    }

    if (jugador.headshots > jugador.bajas) {
        errores.push(`Inconsistencia en "${jugador.gamertag}": Headshots (${jugador.headshots}) supera total de bajas (${jugador.bajas}).`);
    }

    if (jugador.partidasGanadas > jugador.partidasJugadas) {
        errores.push(`Inconsistencia en "${jugador.gamertag}": Partidas ganadas (${jugador.partidasGanadas}) supera el total jugado (${jugador.partidasJugadas}).`);
    }

    if (jugador.latenciaPingMS < 0 || jugador.latenciaPingMS > 999) {
        errores.push(`Latencia ping fuera de rango (${jugador.latenciaPingMS} ms) para "${jugador.gamertag}".`);
    }

    return errores.length === 0
        ? { esValido: true, datos: jugador }
        : { esValido: false, errores };
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const RANGOS_JUGADOR: readonly RangoJugador[] = [
    'Bronce',
    'Plata',
    'Oro',
    'Platino',
    'Diamante',
    'Maestro',
    'Predador'
];

const ROLES_ESCUADRA: readonly RolEscuadra[] = [
    'Asalto',
    'Francotirador',
    'Apoyo',
    'Reconocimiento',
    'Ingeniero'
];

export function calcularMetricasShooter(jugadores: readonly JugadorShooter[]): MetricasEstadisticas {
    if (jugadores.length === 0) {
        const desgloseRangoVacio = RANGOS_JUGADOR.reduce((acc, r) => {
            acc[r] = 0;
            return acc;
        }, {} as Record<RangoJugador, number>);

        const desgloseRolVacio = ROLES_ESCUADRA.reduce((acc, r) => {
            acc[r] = 0;
            return acc;
        }, {} as Record<RolEscuadra, number>);

        return {
            totalJugadores: 0,
            kdrPromedio: 0,
            porcentajeVictoriasPromedio: 0,
            headshotPctPromedio: 0,
            danoPromedioPorPartida: 0,
            jugadorTopKdr: null,
            desglosePorRango: desgloseRangoVacio,
            desglosePorRol: desgloseRolVacio
        };
    }

    const sumaKdr = jugadores.reduce((acc, j) => acc + calcularKDR(j.bajas, j.muertes), 0);
    const kdrPromedio = Number((sumaKdr / jugadores.length).toFixed(2));

    const sumaPctVictorias = jugadores.reduce((acc, j) => {
        const pctWin = j.partidasJugadas > 0 ? (j.partidasGanadas / j.partidasJugadas) * 100 : 0;
        return acc + pctWin;
    }, 0);
    const porcentajeVictoriasPromedio = Number((sumaPctVictorias / jugadores.length).toFixed(1));

    const sumaHeadshotsPct = jugadores.reduce((acc, j) => acc + calcularHeadshotPct(j.headshots, j.bajas), 0);
    const headshotPctPromedio = Number((sumaHeadshotsPct / jugadores.length).toFixed(1));

    const totalDano = jugadores.reduce((acc, j) => acc + j.danoCausado, 0);
    const totalPartidas = jugadores.reduce((acc, j) => acc + j.partidasJugadas, 0);
    const danoPromedioPorPartida = totalPartidas > 0 ? Math.round(totalDano / totalPartidas) : 0;

    const jugadorTopKdr = [...jugadores].sort(
        (a, b) => calcularKDR(b.bajas, b.muertes) - calcularKDR(a.bajas, a.muertes)
    )[0] ?? null;

    const desglosePorRango = jugadores.reduce((acc, j) => {
        acc[j.rango] = (acc[j.rango] ?? 0) + 1;
        return acc;
    }, RANGOS_JUGADOR.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<RangoJugador, number>));

    const desglosePorRol = jugadores.reduce((acc, j) => {
        acc[j.rolPrincipal] = (acc[j.rolPrincipal] ?? 0) + 1;
        return acc;
    }, ROLES_ESCUADRA.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<RolEscuadra, number>));

    return {
        totalJugadores: jugadores.length,
        kdrPromedio,
        porcentajeVictoriasPromedio,
        headshotPctPromedio,
        danoPromedioPorPartida,
        jugadorTopKdr,
        desglosePorRango,
        desglosePorRol
    };
}

export async function procesarConsultaAPIShooterAsync(
    cliente: ClienteAPIFakeShooter,
    endpoint: string,
    simularError: boolean = false
): Promise<ResumenClienteAPI> {
    const advertencias: string[] = [];
    const respuesta = await cliente.obtenerJugadoresAsync(endpoint, simularError);

    if (!respuesta.exito) {
        advertencias.push(`Error de conexion API (${respuesta.status}): ${respuesta.error}`);
        const metricasVacias = calcularMetricasShooter([]);
        return {
            endpointSolicitado: endpoint,
            tiempoRespuestaMS: respuesta.tiempoRespuestaMS,
            totalJugadoresValidos: 0,
            metricas: metricasVacias,
            jugadoresProcesados: [],
            advertencias
        };
    }

    const jugadoresValidos: JugadorShooter[] = [];
    for (const rawJugador of respuesta.datos) {
        const resVal = validarJugadorShooter(rawJugador);
        if (!resVal.esValido) {
            advertencias.push(...resVal.errores);
        } else {
            jugadoresValidos.push(resVal.datos);
        }
    }

    const metricas = calcularMetricasShooter(jugadoresValidos);

    return {
        endpointSolicitado: endpoint,
        tiempoRespuestaMS: respuesta.tiempoRespuestaMS,
        totalJugadoresValidos: jugadoresValidos.length,
        metricas,
        jugadoresProcesados: jugadoresValidos,
        advertencias
    };
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenAPIShooter(resumen: ResumenClienteAPI, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` CLIENTE API FAKE SHOOTER - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Endpoint Solicitado : ${resumen.endpointSolicitado}`);
    console.log(`Tiempo Respuesta API: ${resumen.tiempoRespuestaMS} ms`);
    console.log(`Jugadores Validados : ${resumen.totalJugadoresValidos}`);
    console.log(`K/D Ratio Promedio  : ${resumen.metricas.kdrPromedio}`);
    console.log(`Porcentaje Victorias: ${resumen.metricas.porcentajeVictoriasPromedio}%`);
    console.log(`Headshot Ratio Prom.: ${resumen.metricas.headshotPctPromedio}%`);
    console.log(`Dano Prom. / Partida: ${resumen.metricas.danoPromedioPorPartida} DMG`);
    console.log(`Jugador Top K/D     : ${resumen.metricas.jugadorTopKdr ? `${resumen.metricas.jugadorTopKdr.gamertag} (KDR: ${calcularKDR(resumen.metricas.jugadorTopKdr.bajas, resumen.metricas.jugadorTopKdr.muertes)} - ${resumen.metricas.jugadorTopKdr.rango})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE API / REGISTRO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE JUGADORES POR RANGO COMPETITIVO:`);
    Object.entries(resumen.metricas.desglosePorRango).forEach(([rango, cantidad]) => {
        console.log(`   - ${rango.padEnd(14)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.jugadoresProcesados.map((j) => ({
            Gamertag: j.gamertag,
            Nivel: j.nivel,
            Rango: j.rango,
            Rol: j.rolPrincipal,
            'K/D/A': `${j.bajas}/${j.muertes}/${j.asistencias}`,
            'KDR': calcularKDR(j.bajas, j.muertes),
            'Headshot %': `${calcularHeadshotPct(j.headshots, j.bajas)}%`,
            'Win %': `${((j.partidasGanadas / j.partidasJugadas) * 100).toFixed(1)}%`,
            Ping: `${j.latenciaPingMS} ms`
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const clienteAPI = new ClienteAPIFakeShooter('https://api.fake-shooter.game/v1');

async function ejecutarPruebas(): Promise<void> {
    const resumenNormal = await procesarConsultaAPIShooterAsync(
        clienteAPI,
        '/leaderboard/top-players',
        false
    );
    mostrarResumenAPIShooter(resumenNormal, 'Caso Normal - Leaderboard Top Players');

    const resumenLimiteError = await procesarConsultaAPIShooterAsync(
        clienteAPI,
        '/leaderboard/rankings-fail',
        true
    );
    mostrarResumenAPIShooter(resumenLimiteError, 'Caso Limite - Error de Conexion API 503');
}

ejecutarPruebas().catch((err) => console.error('Error durante ejecucion:', err));