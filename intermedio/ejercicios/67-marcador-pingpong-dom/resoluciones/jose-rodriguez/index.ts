
// 1. MODELADO DEL DOMINIO CON UNIONES DISCRIMINADAS (Discriminated Unions)

export type ModalidadPingPong =
    | 'IndividualMasculino'
    | 'IndividualFemenino'
    | 'DoblesMixto'
    | 'Exhibicion';

export type LadoJugador = 'JugadorA' | 'JugadorB';

export interface ConfiguracionPartidoPingPong {
    readonly id: string;
    readonly codigoPartido: string;
    readonly nombreJugadorA: string;
    readonly nombreJugadorB: string;
    readonly modalidad: ModalidadPingPong;
    readonly mejorDeSets: 3 | 5 | 7;
    readonly puntosParaGanarSet: number;
    readonly servidorInicial: LadoJugador;
}

export interface SetCompletadoPingPong {
    readonly numeroSet: number;
    readonly puntosJugadorA: number;
    readonly puntosJugadorB: number;
    readonly ganadorSet: LadoJugador;
    readonly huboDeuce: boolean;
}

// Discriminated Unions para el Estado del Marcador DOM (State Machine)
export type EstadoMarcadorPingPong =
    | {
        readonly fase: 'EnEspera';
        readonly setsJugadorA: 0;
        readonly setsJugadorB: 0;
        readonly puntosJugadorA: 0;
        readonly puntosJugadorB: 0;
        readonly servidorActual: LadoJugador;
    }
    | {
        readonly fase: 'EnJuego';
        readonly setActual: number;
        readonly setsJugadorA: number;
        readonly setsJugadorB: number;
        readonly puntosJugadorA: number;
        readonly puntosJugadorB: number;
        readonly servidorActual: LadoJugador;
        readonly esDeuce: boolean;
        readonly puntoDeSetPara: LadoJugador | null;
        readonly puntoDePartidoPara: LadoJugador | null;
    }
    | {
        readonly fase: 'TiempoFuera';
        readonly solicitante: LadoJugador;
        readonly setActual: number;
        readonly setsJugadorA: number;
        readonly setsJugadorB: number;
        readonly puntosJugadorA: number;
        readonly puntosJugadorB: number;
        readonly servidorActual: LadoJugador;
    }
    | {
        readonly fase: 'PartidoFinalizado';
        readonly ganador: LadoJugador;
        readonly nombreGanador: string;
        readonly setsJugadorA: number;
        readonly setsJugadorB: number;
        readonly motivoFinalizacion: 'VictoriaReglamentaria' | 'RetiroPorLesion' | 'Descalificacion';
    };

// Discriminated Unions para los Eventos DOM / Acciones del Reducer
export type AccionMarcadorPingPong =
    | { readonly tipo: 'DOM_CLICK_INICIAR_PARTIDO' }
    | { readonly tipo: 'DOM_CLICK_SUMAR_PUNTO'; readonly anotador: LadoJugador }
    | { readonly tipo: 'DOM_CLICK_SOLICITAR_TIMEOUT'; readonly solicitante: LadoJugador }
    | { readonly tipo: 'DOM_CLICK_REANUDAR_PARTIDO' }
    | {
        readonly tipo: 'DOM_CLICK_FINALIZAR_ADMINISTRATIVO';
        readonly ganador: LadoJugador;
        readonly motivo: 'RetiroPorLesion' | 'Descalificacion';
    };

// Snapshot tipado del estado visual renderizable en el DOM
export interface VistaMarcadorDOM {
    readonly elementoId: string;
    readonly textoCabecera: string;
    readonly marcadorSetsTexto: string;
    readonly marcadorPuntosTexto: string;
    readonly indicadorSaque: string;
    readonly alertaEstadoUI: string;
    readonly botonesAnotacionHabilitados: boolean;
}

export interface ResultadoPartidoPingPong {
    readonly id: string;
    readonly configuracion: ConfiguracionPartidoPingPong;
    readonly setsJugadorA: number;
    readonly setsJugadorB: number;
    readonly totalPuntosDisputados: number;
    readonly setsConDeuceCount: number;
    readonly historialSets: readonly SetCompletadoPingPong[];
    readonly vistaFinalDOM: VistaMarcadorDOM;
    readonly estadoFinal: EstadoMarcadorPingPong;
}

export interface MetricasTorneoPingPong {
    readonly totalPartidosProcesados: number;
    readonly partidosFinalizadosReglamentarios: number;
    readonly partidosFinalizadosAdministrativos: number;
    readonly totalSetsJugados: number;
    readonly totalPuntosDisputados: number;
    readonly promedioPuntosPorSet: number;
    readonly totalSetsConDeuce: number;
    readonly partidoMasRenido: ResultadoPartidoPingPong | null;
    readonly desglosePorModalidad: Readonly<Record<ModalidadPingPong, number>>;
}

export interface ResumenMarcadorPingPongDOM {
    readonly ejecucionId: string;
    readonly totalPartidosValidos: number;
    readonly metricas: MetricasTorneoPingPong;
    readonly partidosProcesados: readonly ResultadoPartidoPingPong[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO (Generics & Encapsulamiento)

export class ContenedorMarcadores<T extends { readonly id: string }> {
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

// 3. VALIDACIONES Y REGLAS DE NEGOCIO DE TENIS DE MESA

export function validarConfiguracionPingPong(
    config: ConfiguracionPartidoPingPong
): ResultadoValidacion<ConfiguracionPartidoPingPong> {
    const errores: string[] = [];

    if (config.nombreJugadorA.trim().length === 0 || config.nombreJugadorB.trim().length === 0) {
        errores.push(`El partido "${config.codigoPartido}" debe tener nombres válidos para ambos jugadores.`);
    }

    if (config.nombreJugadorA.trim().toLowerCase() === config.nombreJugadorB.trim().toLowerCase()) {
        errores.push(`Inconsistencia en "${config.codigoPartido}": Un jugador no puede enfrentarse contra sí mismo.`);
    }

    if (config.puntosParaGanarSet < 5 || config.puntosParaGanarSet > 21) {
        errores.push(`Puntos para ganar el set fuera de rango (${config.puntosParaGanarSet}) en "${config.codigoPartido}".`);
    }

    return errores.length === 0
        ? { esValido: true, datos: config }
        : { esValido: false, errores };
}

// 4. REGLAS DE SAQUE, DEUCE Y REDUCER DE ESTADO DEL MARCADOR DOM

export function calcularServidorActual(
    servidorInicial: LadoJugador,
    puntosA: number,
    puntosB: number,
    puntosParaGanarSet: number,
    numeroSet: number
): LadoJugador {
    const primerServidorDelSet: LadoJugador =
        numeroSet % 2 === 1
            ? servidorInicial
            : servidorInicial === 'JugadorA'
                ? 'JugadorB'
                : 'JugadorA';

    const segundoServidorDelSet: LadoJugador =
        primerServidorDelSet === 'JugadorA' ? 'JugadorB' : 'JugadorA';

    const totalPuntosSet = puntosA + puntosB;
    const umbralDeuce = (puntosParaGanarSet - 1) * 2;

    // En Deuce (10-10 en set de 11), el saque alterna cada 1 punto; antes alterna cada 2 puntos
    const turnosDeSaque =
        totalPuntosSet >= umbralDeuce
            ? umbralDeuce / 2 + (totalPuntosSet - umbralDeuce)
            : Math.floor(totalPuntosSet / 2);

    return turnosDeSaque % 2 === 0 ? primerServidorDelSet : segundoServidorDelSet;
}

export function reducerMarcadorPingPong(
    estadoActual: EstadoMarcadorPingPong,
    accion: AccionMarcadorPingPong,
    config: ConfiguracionPartidoPingPong
): { readonly nuevoEstado: EstadoMarcadorPingPong; readonly setCompletado?: SetCompletadoPingPong } {
    const setsNecesariosParaGanar = Math.ceil(config.mejorDeSets / 2);

    switch (accion.tipo) {
        case 'DOM_CLICK_INICIAR_PARTIDO': {
            if (estadoActual.fase === 'EnEspera') {
                return {
                    nuevoEstado: {
                        fase: 'EnJuego',
                        setActual: 1,
                        setsJugadorA: 0,
                        setsJugadorB: 0,
                        puntosJugadorA: 0,
                        puntosJugadorB: 0,
                        servidorActual: config.servidorInicial,
                        esDeuce: false,
                        puntoDeSetPara: null,
                        puntoDePartidoPara: null
                    }
                };
            }
            return { nuevoEstado: estadoActual };
        }

        case 'DOM_CLICK_SUMAR_PUNTO': {
            if (estadoActual.fase !== 'EnJuego') {
                return { nuevoEstado: estadoActual };
            }

            const nuevosPuntosA =
                accion.anotador === 'JugadorA' ? estadoActual.puntosJugadorA + 1 : estadoActual.puntosJugadorA;
            const nuevosPuntosB =
                accion.anotador === 'JugadorB' ? estadoActual.puntosJugadorB + 1 : estadoActual.puntosJugadorB;

            const diferencia = Math.abs(nuevosPuntosA - nuevosPuntosB);
            const umbralDeuce = config.puntosParaGanarSet - 1;
            const huboDeuce = nuevosPuntosA >= umbralDeuce && nuevosPuntosB >= umbralDeuce;

            // Verificar si se ganó el set actual (mínimo puntosParaGanarSet y ventaja >= 2)
            const ganoSetA = nuevosPuntosA >= config.puntosParaGanarSet && nuevosPuntosA - nuevosPuntosB >= 2;
            const ganoSetB = nuevosPuntosB >= config.puntosParaGanarSet && nuevosPuntosB - nuevosPuntosA >= 2;

            if (ganoSetA || ganoSetB) {
                const ganadorSet: LadoJugador = ganoSetA ? 'JugadorA' : 'JugadorB';
                const nuevosSetsA = ganoSetA ? estadoActual.setsJugadorA + 1 : estadoActual.setsJugadorA;
                const nuevosSetsB = ganoSetB ? estadoActual.setsJugadorB + 1 : estadoActual.setsJugadorB;

                const registroSet: SetCompletadoPingPong = {
                    numeroSet: estadoActual.setActual,
                    puntosJugadorA: nuevosPuntosA,
                    puntosJugadorB: nuevosPuntosB,
                    ganadorSet,
                    huboDeuce
                };

                // Verificar si se ganó el partido completo
                if (nuevosSetsA >= setsNecesariosParaGanar || nuevosSetsB >= setsNecesariosParaGanar) {
                    const ganadorPartido: LadoJugador =
                        nuevosSetsA >= setsNecesariosParaGanar ? 'JugadorA' : 'JugadorB';
                    const nombreGanador =
                        ganadorPartido === 'JugadorA' ? config.nombreJugadorA : config.nombreJugadorB;

                    return {
                        nuevoEstado: {
                            fase: 'PartidoFinalizado',
                            ganador: ganadorPartido,
                            nombreGanador,
                            setsJugadorA: nuevosSetsA,
                            setsJugadorB: nuevosSetsB,
                            motivoFinalizacion: 'VictoriaReglamentaria'
                        },
                        setCompletado: registroSet
                    };
                }

                const siguienteSet = estadoActual.setActual + 1;
                const nuevoServidor = calcularServidorActual(
                    config.servidorInicial,
                    0,
                    0,
                    config.puntosParaGanarSet,
                    siguienteSet
                );

                return {
                    nuevoEstado: {
                        fase: 'EnJuego',
                        setActual: siguienteSet,
                        setsJugadorA: nuevosSetsA,
                        setsJugadorB: nuevosSetsB,
                        puntosJugadorA: 0,
                        puntosJugadorB: 0,
                        servidorActual: nuevoServidor,
                        esDeuce: false,
                        puntoDeSetPara: null,
                        puntoDePartidoPara: null
                    },
                    setCompletado: registroSet
                };
            }

            // El set continúa: calcular indicadores de UI (Deuce, Set Point, Match Point, Saque)
            const esDeuce = huboDeuce && diferencia === 0;
            const puntoDeSetA = nuevosPuntosA >= umbralDeuce && nuevosPuntosA - nuevosPuntosB >= 1;
            const puntoDeSetB = nuevosPuntosB >= umbralDeuce && nuevosPuntosB - nuevosPuntosA >= 1;

            const puntoDeSetPara: LadoJugador | null = puntoDeSetA
                ? 'JugadorA'
                : puntoDeSetB
                    ? 'JugadorB'
                    : null;

            const puntoDePartidoPara: LadoJugador | null =
                puntoDeSetPara === 'JugadorA' && estadoActual.setsJugadorA + 1 >= setsNecesariosParaGanar
                    ? 'JugadorA'
                    : puntoDeSetPara === 'JugadorB' && estadoActual.setsJugadorB + 1 >= setsNecesariosParaGanar
                        ? 'JugadorB'
                        : null;

            const servidorActual = calcularServidorActual(
                config.servidorInicial,
                nuevosPuntosA,
                nuevosPuntosB,
                config.puntosParaGanarSet,
                estadoActual.setActual
            );

            return {
                nuevoEstado: {
                    ...estadoActual,
                    puntosJugadorA: nuevosPuntosA,
                    puntosJugadorB: nuevosPuntosB,
                    servidorActual,
                    esDeuce,
                    puntoDeSetPara,
                    puntoDePartidoPara
                }
            };
        }

        case 'DOM_CLICK_SOLICITAR_TIMEOUT': {
            if (estadoActual.fase === 'EnJuego') {
                return {
                    nuevoEstado: {
                        fase: 'TiempoFuera',
                        solicitante: accion.solicitante,
                        setActual: estadoActual.setActual,
                        setsJugadorA: estadoActual.setsJugadorA,
                        setsJugadorB: estadoActual.setsJugadorB,
                        puntosJugadorA: estadoActual.puntosJugadorA,
                        puntosJugadorB: estadoActual.puntosJugadorB,
                        servidorActual: estadoActual.servidorActual
                    }
                };
            }
            return { nuevoEstado: estadoActual };
        }

        case 'DOM_CLICK_REANUDAR_PARTIDO': {
            if (estadoActual.fase === 'TiempoFuera') {
                const umbralDeuce = config.puntosParaGanarSet - 1;
                const esDeuce =
                    estadoActual.puntosJugadorA >= umbralDeuce &&
                    estadoActual.puntosJugadorB >= umbralDeuce &&
                    estadoActual.puntosJugadorA === estadoActual.puntosJugadorB;

                return {
                    nuevoEstado: {
                        fase: 'EnJuego',
                        setActual: estadoActual.setActual,
                        setsJugadorA: estadoActual.setsJugadorA,
                        setsJugadorB: estadoActual.setsJugadorB,
                        puntosJugadorA: estadoActual.puntosJugadorA,
                        puntosJugadorB: estadoActual.puntosJugadorB,
                        servidorActual: estadoActual.servidorActual,
                        esDeuce,
                        puntoDeSetPara: null,
                        puntoDePartidoPara: null
                    }
                };
            }
            return { nuevoEstado: estadoActual };
        }

        case 'DOM_CLICK_FINALIZAR_ADMINISTRATIVO': {
            if (estadoActual.fase === 'PartidoFinalizado') {
                return { nuevoEstado: estadoActual };
            }
            const nombreGanador =
                accion.ganador === 'JugadorA' ? config.nombreJugadorA : config.nombreJugadorB;

            return {
                nuevoEstado: {
                    fase: 'PartidoFinalizado',
                    ganador: accion.ganador,
                    nombreGanador,
                    setsJugadorA: estadoActual.setsJugadorA,
                    setsJugadorB: estadoActual.setsJugadorB,
                    motivoFinalizacion: accion.motivo
                }
            };
        }

        default:
            return { nuevoEstado: estadoActual };
    }
}

// 5. TRANSFORMACIÓN A VISTA DOM Y SIMULADOR DE EVENTOS DE MARCADOR

export function proyectarVistaMarcadorDOM(
    estado: EstadoMarcadorPingPong,
    config: ConfiguracionPartidoPingPong
): VistaMarcadorDOM {
    const elementoId = `dom-scoreboard-${config.codigoPartido.toLowerCase()}`;
    const textoCabecera = `${config.nombreJugadorA} vs ${config.nombreJugadorB} (Bo${config.mejorDeSets})`;

    switch (estado.fase) {
        case 'EnEspera':
            return {
                elementoId,
                textoCabecera,
                marcadorSetsTexto: '0 - 0',
                marcadorPuntosTexto: '00 : 00',
                indicadorSaque: `Saque inicial: ${estado.servidorActual === 'JugadorA' ? config.nombreJugadorA : config.nombreJugadorB}`,
                alertaEstadoUI: 'Listo para iniciar partido',
                botonesAnotacionHabilitados: false
            };

        case 'EnJuego': {
            const nombreServidor =
                estado.servidorActual === 'JugadorA' ? config.nombreJugadorA : config.nombreJugadorB;
            const alerta = estado.puntoDePartidoPara
                ? `MATCH POINT (${estado.puntoDePartidoPara === 'JugadorA' ? config.nombreJugadorA : config.nombreJugadorB})`
                : estado.puntoDeSetPara
                    ? `SET POINT (${estado.puntoDeSetPara === 'JugadorA' ? config.nombreJugadorA : config.nombreJugadorB})`
                    : estado.esDeuce
                        ? 'DEUCE (Ventaja de 2 puntos)'
                        : `Set ${estado.setActual} en curso`;

            return {
                elementoId,
                textoCabecera,
                marcadorSetsTexto: `${estado.setsJugadorA} - ${estado.setsJugadorB}`,
                marcadorPuntosTexto: `${String(estado.puntosJugadorA).padStart(2, '0')} : ${String(estado.puntosJugadorB).padStart(2, '0')}`,
                indicadorSaque: `Sirve: ${nombreServidor}`,
                alertaEstadoUI: alerta,
                botonesAnotacionHabilitados: true
            };
        }

        case 'TiempoFuera':
            return {
                elementoId,
                textoCabecera,
                marcadorSetsTexto: `${estado.setsJugadorA} - ${estado.setsJugadorB}`,
                marcadorPuntosTexto: `${String(estado.puntosJugadorA).padStart(2, '0')} : ${String(estado.puntosJugadorB).padStart(2, '0')}`,
                indicadorSaque: 'Juego detenido',
                alertaEstadoUI: `TIME-OUT solicitado por ${estado.solicitante === 'JugadorA' ? config.nombreJugadorA : config.nombreJugadorB}`,
                botonesAnotacionHabilitados: false
            };

        case 'PartidoFinalizado':
            return {
                elementoId,
                textoCabecera,
                marcadorSetsTexto: `${estado.setsJugadorA} - ${estado.setsJugadorB}`,
                marcadorPuntosTexto: 'FINAL',
                indicadorSaque: 'Partido concluido',
                alertaEstadoUI: `Ganador: ${estado.nombreGanador} (${estado.motivoFinalizacion})`,
                botonesAnotacionHabilitados: false
            };
    }
}

export function ejecutarSimulacionMarcadorDOM(
    config: ConfiguracionPartidoPingPong,
    eventosDOM: readonly AccionMarcadorPingPong[]
): ResultadoPartidoPingPong {
    let estado: EstadoMarcadorPingPong = {
        fase: 'EnEspera',
        setsJugadorA: 0,
        setsJugadorB: 0,
        puntosJugadorA: 0,
        puntosJugadorB: 0,
        servidorActual: config.servidorInicial
    };

    const historialSets: SetCompletadoPingPong[] = [];

    for (const accion of eventosDOM) {
        const transicion = reducerMarcadorPingPong(estado, accion, config);
        estado = transicion.nuevoEstado;
        if (transicion.setCompletado) {
            historialSets.push(transicion.setCompletado);
        }
        if (estado.fase === 'PartidoFinalizado') {
            break;
        }
    }

    const totalPuntosDisputados = historialSets.reduce(
        (acc, s) => acc + s.puntosJugadorA + s.puntosJugadorB,
        estado.fase === 'EnJuego' || estado.fase === 'TiempoFuera'
            ? estado.puntosJugadorA + estado.puntosJugadorB
            : 0
    );

    const setsConDeuceCount = historialSets.filter((s) => s.huboDeuce).length;

    return {
        id: `pp-res-${config.codigoPartido}-${Date.now()}`,
        configuracion: config,
        setsJugadorA: estado.setsJugadorA,
        setsJugadorB: estado.setsJugadorB,
        totalPuntosDisputados,
        setsConDeuceCount,
        historialSets,
        vistaFinalDOM: proyectarVistaMarcadorDOM(estado, config),
        estadoFinal: estado
    };
}

// 6. CÁLCULO DE MÉTRICAS GENERALES (reduce & Record)

const MODALIDADES_PINGPONG: readonly ModalidadPingPong[] = [
    'IndividualMasculino',
    'IndividualFemenino',
    'DoblesMixto',
    'Exhibicion'
];

export function calcularMetricasPingPong(
    resultados: readonly ResultadoPartidoPingPong[]
): MetricasTorneoPingPong {
    if (resultados.length === 0) {
        const desgloseVacio = MODALIDADES_PINGPONG.reduce(
            (acc, mod) => ({ ...acc, [mod]: 0 }),
            {} as Record<ModalidadPingPong, number>
        );

        return {
            totalPartidosProcesados: 0,
            partidosFinalizadosReglamentarios: 0,
            partidosFinalizadosAdministrativos: 0,
            totalSetsJugados: 0,
            totalPuntosDisputados: 0,
            promedioPuntosPorSet: 0,
            totalSetsConDeuce: 0,
            partidoMasRenido: null,
            desglosePorModalidad: desgloseVacio
        };
    }

    const partidosFinalizadosReglamentarios = resultados.filter(
        (r) => r.estadoFinal.fase === 'PartidoFinalizado' && r.estadoFinal.motivoFinalizacion === 'VictoriaReglamentaria'
    ).length;

    const partidosFinalizadosAdministrativos = resultados.filter(
        (r) => r.estadoFinal.fase === 'PartidoFinalizado' && r.estadoFinal.motivoFinalizacion !== 'VictoriaReglamentaria'
    ).length;

    const totalSetsJugados = resultados.reduce((acc, r) => acc + r.historialSets.length, 0);
    const totalPuntosDisputados = resultados.reduce((acc, r) => acc + r.totalPuntosDisputados, 0);
    const promedioPuntosPorSet = totalSetsJugados > 0
        ? Number((totalPuntosDisputados / totalSetsJugados).toFixed(1))
        : 0;

    const totalSetsConDeuce = resultados.reduce((acc, r) => acc + r.setsConDeuceCount, 0);

    const partidoMasRenido = [...resultados].sort(
        (a, b) => b.totalPuntosDisputados - a.totalPuntosDisputados
    )[0] ?? null;

    const desglosePorModalidad = resultados.reduce((acc, r) => {
        acc[r.configuracion.modalidad] = (acc[r.configuracion.modalidad] ?? 0) + 1;
        return acc;
    }, MODALIDADES_PINGPONG.reduce((acc, mod) => ({ ...acc, [mod]: 0 }), {} as Record<ModalidadPingPong, number>));

    return {
        totalPartidosProcesados: resultados.length,
        partidosFinalizadosReglamentarios,
        partidosFinalizadosAdministrativos,
        totalSetsJugados,
        totalPuntosDisputados,
        promedioPuntosPorSet,
        totalSetsConDeuce,
        partidoMasRenido,
        desglosePorModalidad
    };
}

export class ServicioMarcadorPingPongDOM {
    private readonly contenedor = new ContenedorMarcadores<ResultadoPartidoPingPong>();

    public async procesarPartidosAsync(
        partidosEntrada: readonly {
            readonly config: ConfiguracionPartidoPingPong;
            readonly secuenciaEventosDOM: readonly AccionMarcadorPingPong[];
        }[]
    ): Promise<ResumenMarcadorPingPongDOM> {
        const advertencias: string[] = [];

        // Simulación de sincronización asíncrona del estado DOM con el tablero central
        await new Promise((resolve) => setTimeout(resolve, 15));

        if (partidosEntrada.length === 0) {
            advertencias.push('No se recibieron partidos para procesar en el marcador DOM.');
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        for (const entrada of partidosEntrada) {
            const valRes = validarConfiguracionPingPong(entrada.config);
            if (!valRes.esValido) {
                advertencias.push(...valRes.errores);
            } else if (idsVistos.has(entrada.config.id)) {
                advertencias.push(`Partido duplicado detectado por ID: ${entrada.config.id}.`);
            } else if (codigosVistos.has(entrada.config.codigoPartido)) {
                advertencias.push(`Código de partido duplicado: ${entrada.config.codigoPartido}.`);
            } else {
                idsVistos.add(entrada.config.id);
                codigosVistos.add(entrada.config.codigoPartido);

                const resultado = ejecutarSimulacionMarcadorDOM(entrada.config, entrada.secuenciaEventosDOM);
                this.contenedor.agregar(resultado);

                if (
                    resultado.estadoFinal.fase === 'PartidoFinalizado' &&
                    resultado.estadoFinal.motivoFinalizacion !== 'VictoriaReglamentaria'
                ) {
                    advertencias.push(
                        `Cierre administrativo en "${entrada.config.codigoPartido}": ${resultado.estadoFinal.motivoFinalizacion} (Ganador: ${resultado.estadoFinal.nombreGanador}).`
                    );
                }
            }
        }

        const partidosValidos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasPingPong(partidosValidos);

        return {
            ejecucionId: `PP-DOM-EXEC-${Date.now()}`,
            totalPartidosValidos: partidosValidos.length,
            metricas,
            partidosProcesados: partidosValidos,
            advertencias
        };
    }
}

// 7. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenMarcadorDOM(resumen: ResumenMarcadorPingPongDOM, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` MARCADOR PINGPONG DOM - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Ejecución ID        : ${resumen.ejecucionId}`);
    console.log(`Partidos Validados  : ${resumen.totalPartidosValidos}`);
    console.log(`Finales Reglament.  : ${resumen.metricas.partidosFinalizadosReglamentarios}`);
    console.log(`Finales Admin.      : ${resumen.metricas.partidosFinalizadosAdministrativos}`);
    console.log(`Sets Disputados     : ${resumen.metricas.totalSetsJugados} (Sets con Deuce: ${resumen.metricas.totalSetsConDeuce})`);
    console.log(`Puntos Totales      : ${resumen.metricas.totalPuntosDisputados} (Prom: ${resumen.metricas.promedioPuntosPorSet} pts/set)`);
    console.log(`Partido Más Reñido  : ${resumen.metricas.partidoMasRenido ? `"${resumen.metricas.partidoMasRenido.configuracion.codigoPartido}" (${resumen.metricas.partidoMasRenido.totalPuntosDisputados} pts)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y ALERTAS DE MARCADOR (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR MODALIDAD:`);
    Object.entries(resumen.metricas.desglosePorModalidad).forEach(([modalidad, cantidad]) => {
        console.log(`   - ${modalidad.padEnd(20)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.partidosProcesados.map((p) => ({
            Código: p.configuracion.codigoPartido,
            Encuentro: `${p.configuracion.nombreJugadorA} vs ${p.configuracion.nombreJugadorB}`,
            Modalidad: p.configuracion.modalidad,
            Sets: p.vistaFinalDOM.marcadorSetsTexto,
            'Detalle Sets': p.historialSets.map((s) => `${s.puntosJugadorA}-${s.puntosJugadorB}`).join(' | ') || 'Sin sets cerrados',
            'Total Puntos': p.totalPuntosDisputados,
            'Estado DOM UI': p.vistaFinalDOM.alertaEstadoUI
        }))
    );
}

// 8. CASOS DE PRUEBA (Caso Normal con Deuce y Caso Límite Async/Await)

function generarSecuenciaSetGanado(ganador: LadoJugador, puntosGanador: number, puntosPerdedor: number): AccionMarcadorPingPong[] {
    const perdedor: LadoJugador = ganador === 'JugadorA' ? 'JugadorB' : 'JugadorA';
    const acciones: AccionMarcadorPingPong[] = [];
    const paresEmpatados = Math.min(puntosGanador, puntosPerdedor);

    for (let i = 0; i < paresEmpatados; i++) {
        acciones.push({ tipo: 'DOM_CLICK_SUMAR_PUNTO', anotador: 'JugadorA' });
        acciones.push({ tipo: 'DOM_CLICK_SUMAR_PUNTO', anotador: 'JugadorB' });
    }

    const restantesGanador = puntosGanador - paresEmpatados;
    const restantesPerdedor = puntosPerdedor - paresEmpatados;

    for (let i = 0; i < restantesPerdedor; i++) {
        acciones.push({ tipo: 'DOM_CLICK_SUMAR_PUNTO', anotador: perdedor });
    }
    for (let i = 0; i < restantesGanador; i++) {
        acciones.push({ tipo: 'DOM_CLICK_SUMAR_PUNTO', anotador: ganador });
    }

    return acciones;
}

const partidoNormal1: ConfiguracionPartidoPingPong = {
    id: 'pp-01',
    codigoPartido: 'WTT-FINAL-M1',
    nombreJugadorA: 'Fan Zhendong',
    nombreJugadorB: 'Truls Moregard',
    modalidad: 'IndividualMasculino',
    mejorDeSets: 3,
    puntosParaGanarSet: 11,
    servidorInicial: 'JugadorA'
};

// Secuencia con Set 1 ganado en Deuce (13-11), Time-Out y Set 2 ganado 11-8
const secuenciaNormal1: AccionMarcadorPingPong[] = [
    { tipo: 'DOM_CLICK_INICIAR_PARTIDO' },
    ...generarSecuenciaSetGanado('JugadorA', 13, 11),
    { tipo: 'DOM_CLICK_SOLICITAR_TIMEOUT', solicitante: 'JugadorB' },
    { tipo: 'DOM_CLICK_REANUDAR_PARTIDO' },
    ...generarSecuenciaSetGanado('JugadorA', 11, 8)
];

const partidoNormal2: ConfiguracionPartidoPingPong = {
    id: 'pp-02',
    codigoPartido: 'WTT-FINAL-F1',
    nombreJugadorA: 'Sun Yingsha',
    nombreJugadorB: 'Chen Meng',
    modalidad: 'IndividualFemenino',
    mejorDeSets: 3,
    puntosParaGanarSet: 11,
    servidorInicial: 'JugadorB'
};

const secuenciaNormal2: AccionMarcadorPingPong[] = [
    { tipo: 'DOM_CLICK_INICIAR_PARTIDO' },
    ...generarSecuenciaSetGanado('JugadorB', 11, 9),
    ...generarSecuenciaSetGanado('JugadorA', 11, 7),
    ...generarSecuenciaSetGanado('JugadorB', 12, 10)
];

// --- CASO LÍMITE: Mismo Jugador, Puntos Fuera de Rango, Duplicado y Retiro por Lesión ---
const partidoCorrupto: ConfiguracionPartidoPingPong = {
    id: 'pp-99',
    codigoPartido: 'ERR-PP-999',
    nombreJugadorA: 'Hugo Calderano',
    nombreJugadorB: 'Hugo Calderano', // Mismo jugador -> Inválido
    modalidad: 'Exhibicion',
    mejorDeSets: 5,
    puntosParaGanarSet: 2, // < 5 -> Inválido
    servidorInicial: 'JugadorA'
};

const partidoRetiro: ConfiguracionPartidoPingPong = {
    id: 'pp-03',
    codigoPartido: 'WTT-QF-03',
    nombreJugadorA: 'Felix Lebrun',
    nombreJugadorB: 'Tomokazu Harimoto',
    modalidad: 'IndividualMasculino',
    mejorDeSets: 5,
    puntosParaGanarSet: 11,
    servidorInicial: 'JugadorA'
};

const secuenciaRetiro: AccionMarcadorPingPong[] = [
    { tipo: 'DOM_CLICK_INICIAR_PARTIDO' },
    ...generarSecuenciaSetGanado('JugadorA', 11, 6),
    { tipo: 'DOM_CLICK_FINALIZAR_ADMINISTRATIVO', ganador: 'JugadorA', motivo: 'RetiroPorLesion' }
];

async function ejecutarPruebas(): Promise<void> {
    // Ejecución Caso 1 (Normal)
    const servicioNormal = new ServicioMarcadorPingPongDOM();
    const resumenNormal = await servicioNormal.procesarPartidosAsync([
        { config: partidoNormal1, secuenciaEventosDOM: secuenciaNormal1 },
        { config: partidoNormal2, secuenciaEventosDOM: secuenciaNormal2 }
    ]);
    mostrarResumenMarcadorDOM(resumenNormal, 'Caso Normal - Torneo Internacional WTT');

    // Ejecución Caso 2 (Límite)
    const servicioLimite = new ServicioMarcadorPingPongDOM();
    const resumenLimite = await servicioLimite.procesarPartidosAsync([
        { config: partidoRetiro, secuenciaEventosDOM: secuenciaRetiro },
        { config: partidoCorrupto, secuenciaEventosDOM: [] },
        { config: partidoRetiro, secuenciaEventosDOM: secuenciaRetiro } // Duplicado
    ]);
    mostrarResumenMarcadorDOM(resumenLimite, 'Caso Límite - Retiro por Lesión, Duplicado y Datos Inválidos');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));