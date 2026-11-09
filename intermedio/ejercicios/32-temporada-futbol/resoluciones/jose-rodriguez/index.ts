
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions y Literales)

export type PosicionJugador =
    | 'Portero'
    | 'Defensa'
    | 'Centrocampista'
    | 'Delantero';

export type ResultadoPartido = 'Victoria' | 'Empate' | 'Derrota';
export type CondicionPartido = 'Local' | 'Visitante';
export type EstadoJugador = 'Titular' | 'Suplente' | 'Lesionado' | 'Sustituido';

export interface JugadorFutbol {
    readonly id: string;
    readonly nombre: string;
    readonly dorsal: number;
    readonly posicion: PosicionJugador;
    readonly mediaGRL: number; // Valoracion general entre 1 y 99
    readonly goles: number;
    readonly asistencias: number;
    readonly partidosJugados: number;
    readonly estado: EstadoJugador;
}

export interface PartidoTemporada {
    readonly id: string;
    readonly jornada: number;
    readonly rival: string;
    readonly condicion: CondicionPartido;
    readonly golesFavor: number;
    readonly golesContra: number;
    readonly resultado: ResultadoPartido;
    readonly fecha: string;
}

export interface EquipoModoCarrera {
    readonly id: string;
    readonly nombreEquipo: string;
    readonly liga: string;
    readonly presupuestoTransfersUSD: number;
    readonly plantilla: readonly JugadorFutbol[];
    readonly partidos: readonly PartidoTemporada[];
}

export interface MetricasTemporada {
    readonly totalPartidos: number;
    readonly victorias: number;
    readonly empates: number;
    readonly derrotas: number;
    readonly puntosTotales: number;
    readonly golesFavor: number;
    readonly golesContra: number;
    readonly diferenciaGoles: number;
    readonly efectividadPuntosPct: number;
    readonly maximoGoleador: JugadorFutbol | null;
    readonly maximoAsistidor: JugadorFutbol | null;
    readonly desgloseResultados: Readonly<Record<ResultadoPartido, number>>;
    readonly desglosePosicionPlantilla: Readonly<Record<PosicionJugador, number>>;
}

export interface ResumenTemporadaCarrera {
    readonly equipoId: string;
    readonly nombreEquipo: string;
    readonly totalPartidosValidos: number;
    readonly metricas: MetricasTemporada;
    readonly partidosProcesados: readonly PartidoTemporada[];
    readonly plantillaProcesada: readonly JugadorFutbol[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. TYPE GUARDS Y FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarJugador(jugador: JugadorFutbol): ResultadoValidacion<JugadorFutbol> {
    const errores: string[] = [];

    if (jugador.mediaGRL < 1 || jugador.mediaGRL > 99) {
        errores.push(`Valoracion media (GRL) invalida (${jugador.mediaGRL}) para el jugador "${jugador.nombre}".`);
    }

    if (jugador.dorsal < 1 || jugador.dorsal > 99) {
        errores.push(`Dorsal invalido (${jugador.dorsal}) para "${jugador.nombre}".`);
    }

    if (jugador.goles < 0 || jugador.asistencias < 0 || jugador.partidosJugados < 0) {
        errores.push(`Estadisticas negativas detectadas en el jugador "${jugador.nombre}".`);
    }

    if (jugador.nombre.trim().length === 0) {
        errores.push('El jugador debe registrar un nombre valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: jugador }
        : { esValido: false, errores };
}

export function validarPartido(partido: PartidoTemporada): ResultadoValidacion<PartidoTemporada> {
    const errores: string[] = [];

    if (partido.jornada <= 0) {
        errores.push(`Numero de jornada invalido (${partido.jornada}) en el partido contra ${partido.rival}.`);
    }

    if (partido.golesFavor < 0 || partido.golesContra < 0) {
        errores.push(`Los goles no pueden ser negativos en el partido jornada ${partido.jornada}.`);
    }

    // Validacion de coherencia del resultado
    const resultadoEsperado: ResultadoPartido =
        partido.golesFavor > partido.golesContra
            ? 'Victoria'
            : partido.golesFavor === partido.golesContra
                ? 'Empate'
                : 'Derrota';

    if (partido.resultado !== resultadoEsperado) {
        errores.push(
            `Inconsistencia en jornada ${partido.jornada}: Marcador ${partido.golesFavor}-${partido.golesContra} no coincide con el resultado registrado (${partido.resultado}).`
        );
    }

    return errores.length === 0
        ? { esValido: true, datos: partido }
        : { esValido: false, errores };
}

export function validarEquipoRaw(equipo: EquipoModoCarrera): readonly string[] {
    const advertencias: string[] = [];
    const idsJugadores = new Set<string>();
    const dorsalesUsados = new Set<number>();
    const jornadasVistas = new Set<number>();

    if (equipo.plantilla.length === 0) {
        advertencias.push(`El equipo "${equipo.nombreEquipo}" no registra jugadores en la plantilla.`);
    }

    if (equipo.partidos.length === 0) {
        advertencias.push(`El equipo "${equipo.nombreEquipo}" no ha disputado partidos en la temporada.`);
    }

    for (const j of equipo.plantilla) {
        if (idsJugadores.has(j.id)) {
            advertencias.push(`Jugador duplicado detectado por ID: ${j.id} (${j.nombre}).`);
        }
        if (dorsalesUsados.has(j.dorsal)) {
            advertencias.push(`Dorsal #${j.dorsal} asignado a multiples jugadores en la plantilla.`);
        }
        idsJugadores.add(j.id);
        dorsalesUsados.add(j.dorsal);
    }

    for (const p of equipo.partidos) {
        if (jornadasVistas.has(p.jornada)) {
            advertencias.push(`Jornada duplicada registrada en el calendario: Jornada ${p.jornada}.`);
        }
        jornadasVistas.add(p.jornada);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce, Record y Union Types)

const POSICIONES_JUGADOR: readonly PosicionJugador[] = [
    'Portero',
    'Defensa',
    'Centrocampista',
    'Delantero'
];

const RESULTADOS_PARTIDO: readonly ResultadoPartido[] = ['Victoria', 'Empate', 'Derrota'];

export function calcularMetricasTemporada(
    partidos: readonly PartidoTemporada[],
    plantilla: readonly JugadorFutbol[]
): MetricasTemporada {
    if (partidos.length === 0) {
        const desgloseResultadosVacio = RESULTADOS_PARTIDO.reduce((acc, r) => {
            acc[r] = 0;
            return acc;
        }, {} as Record<ResultadoPartido, number>);

        const desglosePosicionVacio = POSICIONES_JUGADOR.reduce((acc, pos) => {
            acc[pos] = 0;
            return acc;
        }, {} as Record<PosicionJugador, number>);

        return {
            totalPartidos: 0,
            victorias: 0,
            empates: 0,
            derrotas: 0,
            puntosTotales: 0,
            golesFavor: 0,
            golesContra: 0,
            diferenciaGoles: 0,
            efectividadPuntosPct: 0,
            maximoGoleador: null,
            maximoAsistidor: null,
            desgloseResultados: desgloseResultadosVacio,
            desglosePosicionPlantilla: desglosePosicionVacio
        };
    }

    const victorias = partidos.filter((p) => p.resultado === 'Victoria').length;
    const empates = partidos.filter((p) => p.resultado === 'Empate').length;
    const derrotas = partidos.filter((p) => p.resultado === 'Derrota').length;

    const puntosTotales = victorias * 3 + empates * 1;
    const puntosMaximosPosibles = partidos.length * 3;
    const efectividadPuntosPct = Number(((puntosTotales / puntosMaximosPosibles) * 100).toFixed(1));

    const golesFavor = partidos.reduce((acc, p) => acc + p.golesFavor, 0);
    const golesContra = partidos.reduce((acc, p) => acc + p.golesContra, 0);
    const diferenciaGoles = golesFavor - golesContra;

    const maximoGoleador = [...plantilla].sort((a, b) => b.goles - a.goles)[0] ?? null;
    const maximoAsistidor = [...plantilla].sort((a, b) => b.asistencias - a.asistencias)[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desgloseResultados = partidos.reduce((acc, p) => {
        acc[p.resultado] = (acc[p.resultado] ?? 0) + 1;
        return acc;
    }, RESULTADOS_PARTIDO.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<ResultadoPartido, number>));

    const desglosePosicionPlantilla = plantilla.reduce((acc, j) => {
        acc[j.posicion] = (acc[j.posicion] ?? 0) + 1;
        return acc;
    }, POSICIONES_JUGADOR.reduce((acc, pos) => ({ ...acc, [pos]: 0 }), {} as Record<PosicionJugador, number>));

    return {
        totalPartidos: partidos.length,
        victorias,
        empates,
        derrotas,
        puntosTotales,
        golesFavor,
        golesContra,
        diferenciaGoles,
        efectividadPuntosPct,
        maximoGoleador,
        maximoAsistidor,
        desgloseResultados,
        desglosePosicionPlantilla
    };
}

export function procesarTemporadaCarrera(equipoRaw: EquipoModoCarrera): ResumenTemporadaCarrera {
    const advertencias: string[] = [...validarEquipoRaw(equipoRaw)];
    const plantillaValida: JugadorFutbol[] = [];
    const partidosValidos: PartidoTemporada[] = [];

    for (const j of equipoRaw.plantilla) {
        const resJ = validarJugador(j);
        if (resJ.esValido) {
            plantillaValida.push(resJ.datos);
        } else {
            advertencias.push(...resJ.errores);
        }
    }

    for (const p of equipoRaw.partidos) {
        const resP = validarPartido(p);
        if (resP.esValido) {
            partidosValidos.push(resP.datos);
        } else {
            advertencias.push(...resP.errores);
        }
    }

    const metricas = calcularMetricasTemporada(partidosValidos, plantillaValida);

    return {
        equipoId: equipoRaw.id,
        nombreEquipo: equipoRaw.nombreEquipo,
        totalPartidosValidos: partidosValidos.length,
        metricas,
        partidosProcesados: partidosValidos,
        plantillaProcesada: plantillaValida,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenTemporada(resumen: ResumenTemporadaCarrera, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` TEMPORADA MODO CARRERA FUTBOL - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Equipo              : ${resumen.nombreEquipo}`);
    console.log(`Partidos Jugados    : ${resumen.totalPartidosValidos}`);
    console.log(`Puntos Conseguidos  : ${resumen.metricas.puntosTotales} pts (${resumen.metricas.efectividadPuntosPct}% efectividad)`);
    console.log(`Balance (V/E/D)     : ${resumen.metricas.victorias}V / ${resumen.metricas.empates}E / ${resumen.metricas.derrotas}D`);
    console.log(`Goles (GF/GC/DG)    : ${resumen.metricas.golesFavor} GF / ${resumen.metricas.golesContra} GC / ${resumen.metricas.diferenciaGoles >= 0 ? '+' : ''}${resumen.metricas.diferenciaGoles} DG`);
    console.log(`Maximo Goleador     : ${resumen.metricas.maximoGoleador ? `${resumen.metricas.maximoGoleador.nombre} (${resumen.metricas.maximoGoleador.goles} goles)` : 'N/A'}`);
    console.log(`Maximo Asistidor    : ${resumen.metricas.maximoAsistidor ? `${resumen.metricas.maximoAsistidor.nombre} (${resumen.metricas.maximoAsistidor.asistencias} asist)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE TEMPORADA (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`PLANTILLA PRINCIPAL DE JUGADORES:`);
    console.table(
        resumen.plantillaProcesada.map((j) => ({
            Dorsal: `#${j.dorsal}`,
            Nombre: j.nombre,
            Posicion: j.posicion,
            GRL: j.mediaGRL,
            Partidos: j.partidosJugados,
            Goles: j.goles,
            Asistencias: j.asistencias,
            Estado: j.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// Jugadores de prueba
const courtois: JugadorFutbol = { id: 'j-01', nombre: 'Thibaut Courtois', dorsal: 1, posicion: 'Portero', mediaGRL: 90, goles: 0, asistencias: 0, partidosJugados: 10, estado: 'Titular' };
const bellingham: JugadorFutbol = { id: 'j-02', nombre: 'Jude Bellingham', dorsal: 5, posicion: 'Centrocampista', mediaGRL: 90, goles: 7, asistencias: 4, partidosJugados: 10, estado: 'Titular' };
const vinicius: JugadorFutbol = { id: 'j-03', nombre: 'Vinicius Jr.', dorsal: 7, posicion: 'Delantero', mediaGRL: 91, goles: 9, asistencias: 5, partidosJugados: 10, estado: 'Titular' };
const rudiger: JugadorFutbol = { id: 'j-04', nombre: 'Antonio Rudiger', dorsal: 22, posicion: 'Defensa', mediaGRL: 87, goles: 1, asistencias: 0, partidosJugados: 10, estado: 'Titular' };

// --- CASO 1: Temporada de Liga Profesional (Caso Normal) ---
const equipoNormal: EquipoModoCarrera = {
    id: 'CLUB-RM-2026',
    nombreEquipo: 'Real Madrid CF',
    liga: 'LaLiga EA Sports',
    presupuestoTransfersUSD: 150000000,
    plantilla: [courtois, bellingham, vinicius, rudiger],
    partidos: [
        { id: 'm-01', jornada: 1, rival: 'Athletic Club', condicion: 'Visitante', golesFavor: 2, golesContra: 0, resultado: 'Victoria', fecha: '2026-08-18' },
        { id: 'm-02', jornada: 2, rival: 'FC Barcelona', condicion: 'Local', golesFavor: 3, golesContra: 1, resultado: 'Victoria', fecha: '2026-08-25' },
        { id: 'm-03', jornada: 3, rival: 'Atletico de Madrid', condicion: 'Visitante', golesFavor: 1, golesContra: 1, resultado: 'Empate', fecha: '2026-09-01' },
        { id: 'm-04', jornada: 4, rival: 'Sevilla FC', condicion: 'Local', golesFavor: 4, golesContra: 0, resultado: 'Victoria', fecha: '2026-09-15' }
    ]
};

// --- CASO 2: Marcador Inconsistente, GRL Inválido y Dorsales Duplicados (Caso Límite) ---
const jugadorCorrupto: JugadorFutbol = { id: 'j-99', nombre: 'Jugador Error GRL', dorsal: 7, posicion: 'Delantero', mediaGRL: 120, goles: -1, asistencias: 0, partidosJugados: 1, estado: 'Titular' };

const equipoLimiteCorrupto: EquipoModoCarrera = {
    id: 'CLUB-FAIL-02',
    nombreEquipo: 'Equipo Inconsistente',
    liga: 'Liga de Prueba',
    presupuestoTransfersUSD: 1000000,
    plantilla: [
        vinicius, // Dorsal #7
        jugadorCorrupto // Dorsal #7 duplicado y GRL 120 -> Invalido
    ],
    partidos: [
        {
            id: 'm-05',
            jornada: 1,
            rival: 'Rival A',
            condicion: 'Local',
            golesFavor: 3,
            golesContra: 0,
            resultado: 'Derrota', // Marcador 3-0 pero marcado Derrota -> Inconsistente
            fecha: '2026-08-18'
        },
        {
            id: 'm-06',
            jornada: 1, // Jornada 1 duplicada
            rival: 'Rival B',
            condicion: 'Visitante',
            golesFavor: 0,
            golesContra: -2, // Goles negativos -> Invalido
            resultado: 'Derrota',
            fecha: '2026-08-25'
        }
    ]
};

// Ejecución
const resumenNormal = procesarTemporadaCarrera(equipoNormal);
mostrarResumenTemporada(resumenNormal, 'Caso Normal - LaLiga Real Madrid CF');

const resumenLimite = procesarTemporadaCarrera(equipoLimiteCorrupto);
mostrarResumenTemporada(resumenLimite, 'Caso Limite - Marcador Inconsistente y Dorsal Duplicado');