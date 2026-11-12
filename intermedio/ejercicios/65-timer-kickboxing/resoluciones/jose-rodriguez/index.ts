
// 1. MODELADO DEL DOMINIO CON UNIONES DISCRIMINADAS (Discriminated Unions)

export type TipoCombate =
    | 'Amateur'
    | 'Profesional'
    | 'TituloMundial'
    | 'Sparring';

export type CategoriaPesoKickboxing =
    | 'Pluma'
    | 'Ligero'
    | 'Wélter'
    | 'Mediano'
    | 'Semipesado'
    | 'Pesado';

export interface ConfiguracionPelea {
    readonly id: string;
    readonly codigoPelea: string;
    readonly peleadorEsquinaRoja: string;
    readonly peleadorEsquinaAzul: string;
    readonly categoriaPeso: CategoriaPesoKickboxing;
    readonly tipoCombate: TipoCombate;
    readonly totalRounds: number;
    readonly duracionRoundSegundos: number;
    readonly duracionDescansoSegundos: number;
    readonly tiempoPreparacionSegundos: number;
}

// Discriminated Unions para el Estado del Timer (State Machine)
export type EstadoTimerKickboxing =
    | {
        readonly fase: 'Reposo';
        readonly tiempoTranscurridoTotalSec: 0;
    }
    | {
        readonly fase: 'Preparacion';
        readonly roundActual: number;
        readonly tiempoRestanteSec: number;
        readonly tiempoTranscurridoTotalSec: number;
    }
    | {
        readonly fase: 'EnRound';
        readonly roundActual: number;
        readonly tiempoRestanteRoundSec: number;
        readonly tiempoTranscurridoTotalSec: number;
        readonly golpesRojo: number;
        readonly golpesAzul: number;
    }
    | {
        readonly fase: 'Descanso';
        readonly roundCompletado: number;
        readonly tiempoRestanteDescansoSec: number;
        readonly tiempoTranscurridoTotalSec: number;
    }
    | {
        readonly fase: 'Pausado';
        readonly fasePrevia: 'Preparacion' | 'EnRound' | 'Descanso';
        readonly roundActual: number;
        readonly tiempoRestanteSec: number;
        readonly motivoPausa: string;
        readonly tiempoTranscurridoTotalSec: number;
    }
    | {
        readonly fase: 'CombateFinalizado';
        readonly totalRoundsCompletados: number;
        readonly tiempoTotalCombateSec: number;
        readonly tiempoTranscurridoTotalSec: number;
        readonly totalGolpesRojo: number;
        readonly totalGolpesAzul: number;
        readonly ganadorDecisión: string;
    }
    | {
        readonly fase: 'DetenidoPorKO';
        readonly roundDetencion: number;
        readonly tiempoEnRoundSec: number;
        readonly ganador: string;
        readonly tipoFinalizacion: 'KO' | 'TKO' | 'Descalificacion';
        readonly tiempoTranscurridoTotalSec: number;
    };

// Discriminated Unions para los Eventos del Reducer
export type AccionTimerKickboxing =
    | { readonly tipo: 'INICIAR_COMBATE' }
    | {
        readonly tipo: 'AVANZAR_TIEMPO';
        readonly deltaSegundos: number;
        readonly golpesRojoDelta?: number;
        readonly golpesAzulDelta?: number;
    }
    | { readonly tipo: 'PAUSAR_COMBATE'; readonly motivo: string }
    | { readonly tipo: 'REANUDAR_COMBATE' }
    | {
        readonly tipo: 'DECLARAR_KO_TKO';
        readonly ganador: string;
        readonly tipoFinalizacion: 'KO' | 'TKO' | 'Descalificacion';
    };

export interface RegistroTickTelemetriaTimer {
    readonly tiempoTotalSec: number;
    readonly faseNombre: string;
    readonly roundActual: number;
    readonly tiempoRestanteFaseSec: number;
    readonly golpesRojoAcumulados: number;
    readonly golpesAzulAcumulados: number;
}

export interface ResultadoCombateTimer {
    readonly id: string;
    readonly configuracion: ConfiguracionPelea;
    readonly duracionEfectivaSegundos: number;
    readonly roundsDisputadosCount: number;
    readonly golpesTotalesRoja: number;
    readonly golpesTotalesAzul: number;
    readonly historialTicks: readonly RegistroTickTelemetriaTimer[];
    readonly estadoFinal: EstadoTimerKickboxing;
}

export interface MetricasTimerKickboxing {
    readonly totalCombatesProcesados: number;
    readonly combatesFinalizadosNormalCount: number;
    readonly combatesFinalizadosPorKOCount: number;
    readonly porcentajeFinalizacionNormal: number;
    readonly duracionPromedioCombateSec: number;
    readonly promedioGolpesPorRound: number;
    readonly combateMasLargo: ResultadoCombateTimer | null;
    readonly desglosePorTipoCombate: Readonly<Record<TipoCombate, number>>;
    readonly desglosePorCategoriaPeso: Readonly<Record<CategoriaPesoKickboxing, number>>;
}

export interface ResumenTimerKickboxing {
    readonly ejecucionId: string;
    readonly totalCombatesValidos: number;
    readonly metricas: MetricasTimerKickboxing;
    readonly combatesProcesados: readonly ResultadoCombateTimer[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO (Generics & Encapsulamiento)

export class ContenedorPeleas<T extends { readonly id: string }> {
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

// 3. VALIDACIONES Y REGLAS DE NEGOCIO DE KICKBOXING

export function validarConfiguracionPelea(
    config: ConfiguracionPelea
): ResultadoValidacion<ConfiguracionPelea> {
    const errores: string[] = [];

    if (config.totalRounds <= 0 || config.totalRounds > 12) {
        errores.push(`Cantidad de rounds fuera de reglamento (${config.totalRounds}) en "${config.codigoPelea}".`);
    }

    if (config.duracionRoundSegundos <= 0 || config.duracionRoundSegundos > 300) {
        errores.push(`Duración de round inválida (${config.duracionRoundSegundos} s) en "${config.codigoPelea}".`);
    }

    if (config.duracionDescansoSegundos <= 0 || config.duracionDescansoSegundos > 180) {
        errores.push(`Duración de descanso fuera de estándar (${config.duracionDescansoSegundos} s) en "${config.codigoPelea}".`);
    }

    if (config.peleadorEsquinaRoja.trim().length === 0 || config.peleadorEsquinaAzul.trim().length === 0) {
        errores.push(`La pelea "${config.codigoPelea}" debe incluir nombres válidos para ambas esquinas.`);
    }

    if (config.peleadorEsquinaRoja.trim().toLowerCase() === config.peleadorEsquinaAzul.trim().toLowerCase()) {
        errores.push(`Inconsistencia en "${config.codigoPelea}": Un peleador no puede enfrentarse a sí mismo.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: config }
        : { esValido: false, errores };
}

// 4. MÁQUINA DE ESTADOS Y REDUCER DEL TIMER DE ROUNDS

export function reducerTimerKickboxing(
    estadoActual: EstadoTimerKickboxing,
    accion: AccionTimerKickboxing,
    config: ConfiguracionPelea
): EstadoTimerKickboxing {
    switch (accion.tipo) {
        case 'INICIAR_COMBATE': {
            if (estadoActual.fase === 'Reposo' || estadoActual.fase === 'CombateFinalizado' || estadoActual.fase === 'DetenidoPorKO') {
                return {
                    fase: 'Preparacion',
                    roundActual: 1,
                    tiempoRestanteSec: config.tiempoPreparacionSegundos,
                    tiempoTranscurridoTotalSec: 0
                };
            }
            return estadoActual;
        }

        case 'AVANZAR_TIEMPO': {
            const delta = accion.deltaSegundos;
            const deltaGRoja = accion.golpesRojoDelta ?? 0;
            const deltaGAzul = accion.golpesAzulDelta ?? 0;

            switch (estadoActual.fase) {
                case 'Preparacion': {
                    const nuevoTiempoRestante = estadoActual.tiempoRestanteSec - delta;
                    const nuevoTranscurrido = estadoActual.tiempoTranscurridoTotalSec + delta;

                    if (nuevoTiempoRestante <= 0) {
                        return {
                            fase: 'EnRound',
                            roundActual: estadoActual.roundActual,
                            tiempoRestanteRoundSec: config.duracionRoundSegundos,
                            tiempoTranscurridoTotalSec: nuevoTranscurrido,
                            golpesRojo: 0,
                            golpesAzul: 0
                        };
                    }
                    return {
                        ...estadoActual,
                        tiempoRestanteSec: nuevoTiempoRestante,
                        tiempoTranscurridoTotalSec: nuevoTranscurrido
                    };
                }

                case 'EnRound': {
                    const nuevoTiempoRound = estadoActual.tiempoRestanteRoundSec - delta;
                    const nuevoTranscurrido = estadoActual.tiempoTranscurridoTotalSec + delta;
                    const nuevosGolpesRojo = estadoActual.golpesRojo + deltaGRoja;
                    const nuevosGolpesAzul = estadoActual.golpesAzul + deltaGAzul;

                    if (nuevoTiempoRound <= 0) {
                        if (estadoActual.roundActual >= config.totalRounds) {
                            const ganadorDecis =
                                nuevosGolpesRojo > nuevosGolpesAzul
                                    ? config.peleadorEsquinaRoja
                                    : nuevosGolpesAzul > nuevosGolpesRojo
                                        ? config.peleadorEsquinaAzul
                                        : 'Empate Técnico por Puntos';

                            return {
                                fase: 'CombateFinalizado',
                                totalRoundsCompletados: config.totalRounds,
                                tiempoTotalCombateSec: nuevoTranscurrido,
                                tiempoTranscurridoTotalSec: nuevoTranscurrido,
                                totalGolpesRojo: nuevosGolpesRojo,
                                totalGolpesAzul: nuevosGolpesAzul,
                                ganadorDecisión: ganadorDecis
                            };
                        }

                        return {
                            fase: 'Descanso',
                            roundCompletado: estadoActual.roundActual,
                            tiempoRestanteDescansoSec: config.duracionDescansoSegundos,
                            tiempoTranscurridoTotalSec: nuevoTranscurrido
                        };
                    }

                    return {
                        ...estadoActual,
                        tiempoRestanteRoundSec: nuevoTiempoRound,
                        tiempoTranscurridoTotalSec: nuevoTranscurrido,
                        golpesRojo: nuevosGolpesRojo,
                        golpesAzul: nuevosGolpesAzul
                    };
                }

                case 'Descanso': {
                    const nuevoTiempoDescanso = estadoActual.tiempoRestanteDescansoSec - delta;
                    const nuevoTranscurrido = estadoActual.tiempoTranscurridoTotalSec + delta;

                    if (nuevoTiempoDescanso <= 0) {
                        return {
                            fase: 'EnRound',
                            roundActual: estadoActual.roundCompletado + 1,
                            tiempoRestanteRoundSec: config.duracionRoundSegundos,
                            tiempoTranscurridoTotalSec: nuevoTranscurrido,
                            golpesRojo: 0,
                            golpesAzul: 0
                        };
                    }

                    return {
                        ...estadoActual,
                        tiempoRestanteDescansoSec: nuevoTiempoDescanso,
                        tiempoTranscurridoTotalSec: nuevoTranscurrido
                    };
                }

                default:
                    return estadoActual;
            }
        }

        case 'PAUSAR_COMBATE': {
            if (estadoActual.fase === 'EnRound' || estadoActual.fase === 'Descanso' || estadoActual.fase === 'Preparacion') {
                const tiempoRestante =
                    estadoActual.fase === 'EnRound'
                        ? estadoActual.tiempoRestanteRoundSec
                        : estadoActual.fase === 'Descanso'
                            ? estadoActual.tiempoRestanteDescansoSec
                            : estadoActual.tiempoRestanteSec;

                return {
                    fase: 'Pausado',
                    fasePrevia: estadoActual.fase,
                    roundActual: estadoActual.fase === 'Descanso' ? estadoActual.roundCompletado : estadoActual.roundActual,
                    tiempoRestanteSec: tiempoRestante,
                    motivoPausa: accion.motivo,
                    tiempoTranscurridoTotalSec: estadoActual.tiempoTranscurridoTotalSec
                };
            }
            return estadoActual;
        }

        case 'REANUDAR_COMBATE': {
            if (estadoActual.fase === 'Pausado') {
                if (estadoActual.fasePrevia === 'EnRound') {
                    return {
                        fase: 'EnRound',
                        roundActual: estadoActual.roundActual,
                        tiempoRestanteRoundSec: estadoActual.tiempoRestanteSec,
                        tiempoTranscurridoTotalSec: estadoActual.tiempoTranscurridoTotalSec,
                        golpesRojo: 0,
                        golpesAzul: 0
                    };
                }
                if (estadoActual.fasePrevia === 'Descanso') {
                    return {
                        fase: 'Descanso',
                        roundCompletado: estadoActual.roundActual,
                        tiempoRestanteDescansoSec: estadoActual.tiempoRestanteSec,
                        tiempoTranscurridoTotalSec: estadoActual.tiempoTranscurridoTotalSec
                    };
                }
                return {
                    fase: 'Preparacion',
                    roundActual: estadoActual.roundActual,
                    tiempoRestanteSec: estadoActual.tiempoRestanteSec,
                    tiempoTranscurridoTotalSec: estadoActual.tiempoTranscurridoTotalSec
                };
            }
            return estadoActual;
        }

        case 'DECLARAR_KO_TKO': {
            const roundActual =
                estadoActual.fase === 'EnRound' || estadoActual.fase === 'Preparacion'
                    ? estadoActual.roundActual
                    : estadoActual.fase === 'Descanso'
                        ? estadoActual.roundCompletado
                        : 1;

            return {
                fase: 'DetenidoPorKO',
                roundDetencion: roundActual,
                tiempoEnRoundSec: estadoActual.fase === 'EnRound' ? config.duracionRoundSegundos - estadoActual.tiempoRestanteRoundSec : 0,
                ganador: accion.ganador,
                tipoFinalizacion: accion.tipoFinalizacion,
                tiempoTranscurridoTotalSec: estadoActual.tiempoTranscurridoTotalSec
            };
        }

        default:
            return estadoActual;
    }
}

export function ejecutarSimulacionTimer(
    config: ConfiguracionPelea,
    provocarKOEnRound: number = -1
): ResultadoCombateTimer {
    let estado: EstadoTimerKickboxing = { fase: 'Reposo', tiempoTranscurridoTotalSec: 0 };
    const historial: RegistroTickTelemetriaTimer[] = [];

    estado = reducerTimerKickboxing(estado, { tipo: 'INICIAR_COMBATE' }, config);

    let golpesRojaAcum = 0;
    let golpesAzulAcum = 0;
    const dt = 15;

    while (
        estado.fase !== 'CombateFinalizado' &&
        estado.fase !== 'DetenidoPorKO' &&
        estado.tiempoTranscurridoTotalSec < 3600
    ) {
        if (estado.fase === 'EnRound' && estado.roundActual === provocarKOEnRound && estado.tiempoRestanteRoundSec <= 60) {
            estado = reducerTimerKickboxing(
                estado,
                {
                    tipo: 'DECLARAR_KO_TKO',
                    ganador: config.peleadorEsquinaRoja,
                    tipoFinalizacion: 'KO'
                },
                config
            );
            break;
        }

        const deltaGRed = estado.fase === 'EnRound' ? Math.floor(Math.random() * 4) + 1 : 0;
        const deltaGAzul = estado.fase === 'EnRound' ? Math.floor(Math.random() * 4) + 1 : 0;

        golpesRojaAcum += deltaGRed;
        golpesAzulAcum += deltaGAzul;

        estado = reducerTimerKickboxing(
            estado,
            {
                tipo: 'AVANZAR_TIEMPO',
                deltaSegundos: dt,
                golpesRojoDelta: deltaGRed,
                golpesAzulDelta: deltaGAzul
            },
            config
        );

        const roundActual =
            estado.fase === 'EnRound' || estado.fase === 'Preparacion'
                ? estado.roundActual
                : estado.fase === 'Descanso'
                    ? estado.roundCompletado
                    : config.totalRounds;

        const tiempoRestanteFase =
            estado.fase === 'EnRound'
                ? estado.tiempoRestanteRoundSec
                : estado.fase === 'Descanso'
                    ? estado.tiempoRestanteDescansoSec
                    : estado.fase === 'Preparacion'
                        ? estado.tiempoRestanteSec
                        : 0;

        historial.push({
            tiempoTotalSec: estado.tiempoTranscurridoTotalSec,
            faseNombre: estado.fase,
            roundActual,
            tiempoRestanteFaseSec: tiempoRestanteFase,
            golpesRojoAcumulados: golpesRojaAcum,
            golpesAzulAcumulados: golpesAzulAcum
        });
    }

    const roundsDisputados =
        estado.fase === 'CombateFinalizado'
            ? estado.totalRoundsCompletados
            : estado.fase === 'DetenidoPorKO'
                ? estado.roundDetencion
                : config.totalRounds;

    return {
        id: `timer-res-${config.codigoPelea}-${Date.now()}`,
        configuracion: config,
        duracionEfectivaSegundos: estado.tiempoTranscurridoTotalSec,
        roundsDisputadosCount: roundsDisputados,
        golpesTotalesRoja: golpesRojaAcum,
        golpesTotalesAzul: golpesAzulAcum,
        historialTicks: historial,
        estadoFinal: estado
    };
}

// 5. CÁLCULO DE MÉTRICAS GENERALES DE COMBATE (reduce & Record)

const TIPOS_COMBATE: readonly TipoCombate[] = [
    'Amateur',
    'Profesional',
    'TituloMundial',
    'Sparring'
];

const CATEGORIAS_PESO: readonly CategoriaPesoKickboxing[] = [
    'Pluma',
    'Ligero',
    'Wélter',
    'Mediano',
    'Semipesado',
    'Pesado'
];

export function calcularMetricasTimer(
    resultados: readonly ResultadoCombateTimer[]
): MetricasTimerKickboxing {
    if (resultados.length === 0) {
        const desgloseTipoVacio = TIPOS_COMBATE.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoCombate, number>);
        const desgloseCatVacio = CATEGORIAS_PESO.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CategoriaPesoKickboxing, number>);

        return {
            totalCombatesProcesados: 0,
            combatesFinalizadosNormalCount: 0,
            combatesFinalizadosPorKOCount: 0,
            porcentajeFinalizacionNormal: 0,
            duracionPromedioCombateSec: 0,
            promedioGolpesPorRound: 0,
            combateMasLargo: null,
            desglosePorTipoCombate: desgloseTipoVacio,
            desglosePorCategoriaPeso: desgloseCatVacio
        };
    }

    const normales = resultados.filter((r) => r.estadoFinal.fase === 'CombateFinalizado');
    const kos = resultados.filter((r) => r.estadoFinal.fase === 'DetenidoPorKO');

    const combatesFinalizadosNormalCount = normales.length;
    const combatesFinalizadosPorKOCount = kos.length;

    const porcentajeFinalizacionNormal = Number(((combatesFinalizadosNormalCount / resultados.length) * 100).toFixed(1));

    const sumaDuracion = resultados.reduce((acc, r) => acc + r.duracionEfectivaSegundos, 0);
    const duracionPromedioCombateSec = Math.round(sumaDuracion / resultados.length);

    const sumaGolpes = resultados.reduce((acc, r) => acc + r.golpesTotalesRoja + r.golpesTotalesAzul, 0);
    const sumaRounds = resultados.reduce((acc, r) => acc + r.roundsDisputadosCount, 0);
    const promedioGolpesPorRound = sumaRounds > 0 ? Number((sumaGolpes / sumaRounds).toFixed(1)) : 0;

    const combateMasLargo = [...resultados].sort((a, b) => b.duracionEfectivaSegundos - a.duracionEfectivaSegundos)[0] ?? null;

    const desglosePorTipoCombate = resultados.reduce((acc, r) => {
        acc[r.configuracion.tipoCombate] = (acc[r.configuracion.tipoCombate] ?? 0) + 1;
        return acc;
    }, TIPOS_COMBATE.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoCombate, number>));

    const desglosePorCategoriaPeso = resultados.reduce((acc, r) => {
        acc[r.configuracion.categoriaPeso] = (acc[r.configuracion.categoriaPeso] ?? 0) + 1;
        return acc;
    }, CATEGORIAS_PESO.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CategoriaPesoKickboxing, number>));

    return {
        totalCombatesProcesados: resultados.length,
        combatesFinalizadosNormalCount,
        combatesFinalizadosPorKOCount,
        porcentajeFinalizacionNormal,
        duracionPromedioCombateSec,
        promedioGolpesPorRound,
        combateMasLargo,
        desglosePorTipoCombate,
        desglosePorCategoriaPeso
    };
}

export class ServicioTimerKickboxing {
    private readonly contenedor = new ContenedorPeleas<ResultadoCombateTimer>();

    public async procesarCombatesAsync(
        peleasRaw: readonly ConfiguracionPelea[],
        koEnIndice: number = -1
    ): Promise<ResumenTimerKickboxing> {
        const advertencias: string[] = [];

        await new Promise((resolve) => setTimeout(resolve, 15));

        if (peleasRaw.length === 0) {
            advertencias.push('No se recibieron configuraciones de pelea para el timer.');
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        peleasRaw.forEach((config, idx) => {
            const valRes = validarConfiguracionPelea(config);
            if (!valRes.esValido) {
                advertencias.push(...valRes.errores);
            } else if (idsVistos.has(config.id)) {
                advertencias.push(`Configuración duplicada detectada por ID: ${config.id}.`);
            } else if (codigosVistos.has(config.codigoPelea)) {
                advertencias.push(`Código de pelea duplicado: ${config.codigoPelea}.`);
            } else {
                idsVistos.add(config.id);
                codigosVistos.add(config.codigoPelea);

                const provocKORound = idx === koEnIndice ? 2 : -1;
                const resSim = ejecutarSimulacionTimer(config, provocKORound);

                if (resSim.estadoFinal.fase === 'DetenidoPorKO') {
                    advertencias.push(
                        `Detención de combate: KO en Round ${resSim.estadoFinal.roundDetencion} a favor de ${resSim.estadoFinal.ganador}.`
                    );
                }

                this.contenedor.agregar(resSim);
            }
        });

        const combatesValidos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasTimer(combatesValidos);

        return {
            ejecucionId: `KICK-TIMER-EXEC-${Date.now()}`,
            totalCombatesValidos: combatesValidos.length,
            metricas,
            combatesProcesados: combatesValidos,
            advertencias
        };
    }
}

// 6. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenTimerKickboxing(resumen: ResumenTimerKickboxing, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` TIMER DE ROUNDS KICKBOXING - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Ejecución ID        : ${resumen.ejecucionId}`);
    console.log(`Combates Validados  : ${resumen.totalCombatesValidos}`);
    console.log(`Decisión por Puntos : ${resumen.metricas.combatesFinalizadosNormalCount}`);
    console.log(`Detenidos por KO/TKO: ${resumen.metricas.combatesFinalizadosPorKOCount}`);
    console.log(`Duración Promedio   : ${resumen.metricas.duracionPromedioCombateSec} segundos`);
    console.log(`Promedio Golpes/Rnd : ${resumen.metricas.promedioGolpesPorRound} impactos`);
    console.log(`Combate Más Largo   : ${resumen.metricas.combateMasLargo ? `"${resumen.metricas.combateMasLargo.configuracion.codigoPelea}" (${resumen.metricas.combateMasLargo.duracionEfectivaSegundos} s)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REGLAMENTO Y EVENTOS DE RING (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR TIPO DE COMBATE:`);
    Object.entries(resumen.metricas.desglosePorTipoCombate).forEach(([tipo, cantidad]) => {
        console.log(`   - ${tipo.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.combatesProcesados.map((c) => ({
            Código: c.configuracion.codigoPelea,
            Esquinas: `${c.configuracion.peleadorEsquinaRoja} (Rojo) vs ${c.configuracion.peleadorEsquinaAzul} (Azul)`,
            Categoría: `${c.configuracion.categoriaPeso} (${c.configuracion.tipoCombate})`,
            Rounds: `${c.roundsDisputadosCount} / ${c.configuracion.totalRounds}`,
            'Duración Total': `${c.duracionEfectivaSegundos} s`,
            'Impactos (Rojo/Azul)': `${c.golpesTotalesRoja} / ${c.golpesTotalesAzul}`,
            ResultadoFase: c.estadoFinal.fase === 'CombateFinalizado'
                ? `Ganador: ${c.estadoFinal.ganadorDecisión}`
                : c.estadoFinal.fase === 'DetenidoPorKO'
                    ? `KO R${c.estadoFinal.roundDetencion} (${c.estadoFinal.ganador})`
                    : c.estadoFinal.fase
        }))
    );
}

// 7. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const c1: ConfiguracionPelea = {
    id: 'fight-01',
    codigoPelea: 'GLORY-88-MAIN',
    peleadorEsquinaRoja: 'Rico Verhoeven',
    peleadorEsquinaAzul: 'Tariq Osaro',
    categoriaPeso: 'Pesado',
    tipoCombate: 'TituloMundial',
    totalRounds: 5,
    duracionRoundSegundos: 180,
    duracionDescansoSegundos: 60,
    tiempoPreparacionSegundos: 10
};

const c2: ConfiguracionPelea = {
    id: 'fight-02',
    codigoPelea: 'ONE-FC-WELTER',
    peleadorEsquinaRoja: 'Regian Eersel',
    peleadorEsquinaAzul: 'Alexis Nicolas',
    categoriaPeso: 'Wélter',
    tipoCombate: 'Profesional',
    totalRounds: 3,
    duracionRoundSegundos: 180,
    duracionDescansoSegundos: 60,
    tiempoPreparacionSegundos: 10
};

// --- CASO 1: Campeonato Mundial de Kickboxing (Caso Normal) ---
const servicioNormal = new ServicioTimerKickboxing();

// --- CASO 2: Mismo Peleador, Duración Fuera de Rango y KO en Round 2 (Caso Límite) ---
const peleaCorrupta: ConfiguracionPelea = {
    id: 'fight-99',
    codigoPelea: 'ERR-FIGHT-999',
    peleadorEsquinaRoja: 'Rico Verhoeven',
    peleadorEsquinaAzul: 'Rico Verhoeven',
    categoriaPeso: 'Pesado',
    tipoCombate: 'Amateur',
    totalRounds: 20,
    duracionRoundSegundos: 600,
    duracionDescansoSegundos: 10,
    tiempoPreparacionSegundos: 5
};

const servicioLimite = new ServicioTimerKickboxing();

async function ejecutarPruebas(): Promise<void> {
    const resumenNormal = await servicioNormal.procesarCombatesAsync([c1, c2]);
    mostrarResumenTimerKickboxing(resumenNormal, 'Caso Normal - Cartelera Profesional Glory/ONE');

    const resumenLimite = await servicioLimite.procesarCombatesAsync([c1, peleaCorrupta, c1], 0);
    mostrarResumenTimerKickboxing(resumenLimite, 'Caso Límite - Mismo Peleador y KO Prematuro');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));