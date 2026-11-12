
// 1. MODELADO DEL DOMINIO CON UNIONES DISCRIMINADAS (Discriminated Unions)

export type TipoCategoriaCarrera =
    | 'Formula1'
    | 'GT3'
    | 'MotoGP'
    | 'Endurance';

export type EstadoVuelta =
    | 'Valida'
    | 'InvalidaPorLimites'
    | 'VueltaRapida'
    | 'PitIn';

export interface EspecificacionesPilotoAuto {
    readonly id: string;
    readonly codigoPiloto: string;
    readonly nombrePiloto: string;
    readonly equipo: string;
    readonly numeroAuto: number;
    readonly categoria: TipoCategoriaCarrera;
}

export interface RegistroVuelta {
    readonly numeroVuelta: number;
    readonly tiempoSector1Sec: number;
    readonly tiempoSector2Sec: number;
    readonly tiempoSector3Sec: number;
    readonly tiempoTotalVueltaSec: number;
    readonly estadoVuelta: EstadoVuelta;
    readonly velocidadMaximaSectorKMH: number;
}

export interface ConfiguracionSesionTiming {
    readonly id: string;
    readonly codigoSesion: string;
    readonly pilotoAuto: EspecificacionesPilotoAuto;
    readonly nombreCircuito: string;
    readonly totalVueltasProgramadas: number;
    readonly tiempoRecordCircuitoSec: number;
}

// Discriminated Unions para el Estado del Cronómetro (State Machine)
export type EstadoCronometroCarreras =
    | {
        readonly fase: 'Reposo';
        readonly tiempoTranscurridoTotalSec: 0;
        readonly vueltaActual: 0;
    }
    | {
        readonly fase: 'EnVuelta';
        readonly vueltaActual: number;
        readonly tiempoVueltaActualSec: number;
        readonly tiempoTranscurridoTotalSec: number;
        readonly sectorActual: 1 | 2 | 3;
        readonly tiempoSector1Sec: number | null;
        readonly tiempoSector2Sec: number | null;
    }
    | {
        readonly fase: 'PausaPitStop';
        readonly vueltaActual: number;
        readonly tiempoRestantePitSec: number;
        readonly tiempoTranscurridoTotalSec: number;
    }
    | {
        readonly fase: 'CarreraFinalizada';
        readonly totalVueltasCompletadas: number;
        readonly tiempoTotalCarreraSec: number;
        readonly tiempoTranscurridoTotalSec: number;
        readonly vueltaRapida: RegistroVuelta | null;
    }
    | {
        readonly fase: 'Abandono';
        readonly vueltaAbandono: number;
        readonly motivo: string;
        readonly tiempoTranscurridoTotalSec: number;
    };

// Discriminated Unions para las Acciones / Eventos del Reducer
export type AccionCronometro =
    | { readonly tipo: 'INICIAR_SESION' }
    | {
        readonly tipo: 'REGISTRAR_TIEMPO_SECTOR';
        readonly deltaSec: number;
        readonly velocidadKMH: number;
        readonly excedeLimitesPista?: boolean;
    }
    | { readonly tipo: 'INGRESAR_PIT_STOP'; readonly duracionPitSec: number }
    | { readonly tipo: 'ABANDONAR_CARRERA'; readonly motivo: string };

export interface RegistroTickTelemetriaCronometro {
    readonly tiempoTotalSec: number;
    readonly faseNombre: string;
    readonly vueltaActual: number;
    readonly tiempoVueltaActualSec: number;
    readonly sectorActual: number;
}

export interface ResultadoSesionTiming {
    readonly id: string;
    readonly configuracion: ConfiguracionSesionTiming;
    readonly totalVueltasCompletadas: number;
    readonly vueltasValidasCount: number;
    readonly tiempoTotalAcumuladoSec: number;
    readonly vueltaMasRapida: RegistroVuelta | null;
    readonly tiempoPromedioVueltaSec: number;
    readonly historialVueltas: readonly RegistroVuelta[];
    readonly estadoFinal: EstadoCronometroCarreras;
}

export interface MetricasCronometroCarreras {
    readonly totalSesionesProcesadas: number;
    readonly sesionesCompletadasCount: number;
    readonly porcentajeFinalizacion: number;
    readonly tiempoPromedioVueltaGlobalSec: number;
    readonly pilotoConVueltaAbsolutaMasRapida: EspecificacionesPilotoAuto | null;
    readonly desglosePorCategoria: Readonly<Record<TipoCategoriaCarrera, number>>;
    readonly desglosePorEstadoVuelta: Readonly<Record<EstadoVuelta, number>>;
}

export interface ResumenCronometroCarreras {
    readonly ejecucionId: string;
    readonly totalSesionesValidas: number;
    readonly metricas: MetricasCronometroCarreras;
    readonly resultadosProcesados: readonly ResultadoSesionTiming[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO (Generics & Encapsulamiento)

export class ContenedorCronometros<T extends { readonly id: string }> {
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

// 3. VALIDACIONES Y REGLAS DE NEGOCIO

export function validarConfiguracionSesion(
    config: ConfiguracionSesionTiming
): ResultadoValidacion<ConfiguracionSesionTiming> {
    const errores: string[] = [];

    if (config.totalVueltasProgramadas <= 0 || config.totalVueltasProgramadas > 200) {
        errores.push(`Total de vueltas fuera de rango (${config.totalVueltasProgramadas}) en "${config.codigoSesion}".`);
    }

    if (config.tiempoRecordCircuitoSec <= 0 || config.tiempoRecordCircuitoSec > 600) {
        errores.push(`Tiempo récord de circuito inválido (${config.tiempoRecordCircuitoSec} s) en "${config.nombreCircuito}".`);
    }

    if (config.pilotoAuto.numeroAuto <= 0 || config.pilotoAuto.numeroAuto > 999) {
        errores.push(`Número de vehículo no válido (${config.pilotoAuto.numeroAuto}) para "${config.pilotoAuto.nombrePiloto}".`);
    }

    if (config.pilotoAuto.nombrePiloto.trim().length === 0 || config.pilotoAuto.equipo.trim().length === 0) {
        errores.push(`La sesión "${config.codigoSesion}" debe incluir nombre de piloto y equipo válidos.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: config }
        : { esValido: false, errores };
}

// 4. MÁQUINA DE ESTADOS Y REDUCER DEL CRONÓMETRO DE VUELTAS

export function reducerCronometroCarreras(
    estadoActual: EstadoCronometroCarreras,
    accion: AccionCronometro,
    config: ConfiguracionSesionTiming,
    vueltasAcumuladas: readonly RegistroVuelta[]
): { readonly nuevoEstado: EstadoCronometroCarreras; readonly nuevaVuelta?: RegistroVuelta } {
    switch (accion.tipo) {
        case 'INICIAR_SESION': {
            if (
                estadoActual.fase === 'Reposo' ||
                estadoActual.fase === 'CarreraFinalizada' ||
                estadoActual.fase === 'Abandono'
            ) {
                return {
                    nuevoEstado: {
                        fase: 'EnVuelta',
                        vueltaActual: 1,
                        tiempoVueltaActualSec: 0,
                        tiempoTranscurridoTotalSec: 0,
                        sectorActual: 1,
                        tiempoSector1Sec: null,
                        tiempoSector2Sec: null
                    }
                };
            }
            return { nuevoEstado: estadoActual };
        }

        case 'REGISTRAR_TIEMPO_SECTOR': {
            if (estadoActual.fase !== 'EnVuelta') {
                return { nuevoEstado: estadoActual };
            }

            const tiempoTranscurridoTotalSec = Number(
                (estadoActual.tiempoTranscurridoTotalSec + accion.deltaSec).toFixed(3)
            );
            const tiempoVueltaActualSec = Number(
                (estadoActual.tiempoVueltaActualSec + accion.deltaSec).toFixed(3)
            );

            if (estadoActual.sectorActual === 1) {
                return {
                    nuevoEstado: {
                        ...estadoActual,
                        sectorActual: 2,
                        tiempoSector1Sec: accion.deltaSec,
                        tiempoVueltaActualSec,
                        tiempoTranscurridoTotalSec
                    }
                };
            }

            if (estadoActual.sectorActual === 2) {
                return {
                    nuevoEstado: {
                        ...estadoActual,
                        sectorActual: 3,
                        tiempoSector2Sec: accion.deltaSec,
                        tiempoVueltaActualSec,
                        tiempoTranscurridoTotalSec
                    }
                };
            }

            // Sector 3 completado -> Vuelta Finalizada
            const tSec1 = estadoActual.tiempoSector1Sec ?? 25.0;
            const tSec2 = estadoActual.tiempoSector2Sec ?? 30.0;
            const tSec3 = accion.deltaSec;
            const tTotalVuelta = Number((tSec1 + tSec2 + tSec3).toFixed(3));

            const esInvalida = accion.excedeLimitesPista ?? false;

            let estadoVuelta: EstadoVuelta = esInvalida ? 'InvalidaPorLimites' : 'Valida';

            if (!esInvalida && tTotalVuelta < config.tiempoRecordCircuitoSec) {
                estadoVuelta = 'VueltaRapida';
            }

            const nuevaVueltaRecord: RegistroVuelta = {
                numeroVuelta: estadoActual.vueltaActual,
                tiempoSector1Sec: tSec1,
                tiempoSector2Sec: tSec2,
                tiempoSector3Sec: tSec3,
                tiempoTotalVueltaSec: tTotalVuelta,
                estadoVuelta,
                velocidadMaximaSectorKMH: accion.velocidadKMH
            };

            if (estadoActual.vueltaActual >= config.totalVueltasProgramadas) {
                const todasVueltas = [...vueltasAcumuladas, nuevaVueltaRecord];
                const validas = todasVueltas.filter((v) => v.estadoVuelta !== 'InvalidaPorLimites');
                const vueltaRapida = validas.length > 0
                    ? [...validas].sort((a, b) => a.tiempoTotalVueltaSec - b.tiempoTotalVueltaSec)[0]
                    : null;

                return {
                    nuevoEstado: {
                        fase: 'CarreraFinalizada',
                        totalVueltasCompletadas: config.totalVueltasProgramadas,
                        tiempoTotalCarreraSec: tiempoTranscurridoTotalSec,
                        tiempoTranscurridoTotalSec,
                        vueltaRapida
                    },
                    nuevaVuelta: nuevaVueltaRecord
                };
            }

            return {
                nuevoEstado: {
                    fase: 'EnVuelta',
                    vueltaActual: estadoActual.vueltaActual + 1,
                    tiempoVueltaActualSec: 0,
                    tiempoTranscurridoTotalSec,
                    sectorActual: 1,
                    tiempoSector1Sec: null,
                    tiempoSector2Sec: null
                },
                nuevaVuelta: nuevaVueltaRecord
            };
        }

        case 'INGRESAR_PIT_STOP': {
            if (estadoActual.fase === 'EnVuelta') {
                const tiempoTranscurridoTotalSec = Number(
                    (estadoActual.tiempoTranscurridoTotalSec + accion.duracionPitSec).toFixed(3)
                );
                return {
                    nuevoEstado: {
                        fase: 'PausaPitStop',
                        vueltaActual: estadoActual.vueltaActual,
                        tiempoRestantePitSec: accion.duracionPitSec,
                        tiempoTranscurridoTotalSec
                    }
                };
            }
            return { nuevoEstado: estadoActual };
        }

        case 'ABANDONAR_CARRERA': {
            const vueltaAbandono =
                estadoActual.fase === 'EnVuelta' || estadoActual.fase === 'PausaPitStop'
                    ? estadoActual.vueltaActual
                    : 1;

            return {
                nuevoEstado: {
                    fase: 'Abandono',
                    vueltaAbandono,
                    motivo: accion.motivo,
                    tiempoTranscurridoTotalSec: estadoActual.tiempoTranscurridoTotalSec
                }
            };
        }

        default:
            return { nuevoEstado: estadoActual };
    }
}

export function ejecutarSimulacionCronometro(
    config: ConfiguracionSesionTiming,
    provocarAbandonoEnVuelta: number = -1
): ResultadoSesionTiming {
    let estado: EstadoCronometroCarreras = { fase: 'Reposo', tiempoTranscurridoTotalSec: 0, vueltaActual: 0 };
    const historialVueltas: RegistroVuelta[] = [];
    const historialTicks: RegistroTickTelemetriaCronometro[] = [];

    let res = reducerCronometroCarreras(estado, { tipo: 'INICIAR_SESION' }, config, historialVueltas);
    estado = res.nuevoEstado;

    while (
        estado.fase !== 'CarreraFinalizada' &&
        estado.fase !== 'Abandono' &&
        estado.tiempoTranscurridoTotalSec < 14400
    ) {
        if (
            estado.fase === 'EnVuelta' &&
            estado.vueltaActual === provocarAbandonoEnVuelta &&
            estado.sectorActual === 2
        ) {
            res = reducerCronometroCarreras(
                estado,
                { tipo: 'ABANDONAR_CARRERA', motivo: 'Falla de presión de aceite en motor' },
                config,
                historialVueltas
            );
            estado = res.nuevoEstado;
            break;
        }

        if (estado.fase === 'EnVuelta') {
            const deltaSec = Number((25.0 + Math.random() * 8.0).toFixed(3));
            const velKMH = Math.round(280 + Math.random() * 60);
            const excedeLimites = Math.random() < 0.15;

            res = reducerCronometroCarreras(
                estado,
                { tipo: 'REGISTRAR_TIEMPO_SECTOR', deltaSec, velocidadKMH: velKMH, excedeLimitesPista: excedeLimites },
                config,
                historialVueltas
            );

            estado = res.nuevoEstado;
            if (res.nuevaVuelta) {
                historialVueltas.push(res.nuevaVuelta);
            }

            const vActual = estado.fase === 'EnVuelta' ? estado.vueltaActual : config.totalVueltasProgramadas;
            const tVueltaAct = estado.fase === 'EnVuelta' ? estado.tiempoVueltaActualSec : 0;
            const secAct = estado.fase === 'EnVuelta' ? estado.sectorActual : 3;

            historialTicks.push({
                tiempoTotalSec: estado.tiempoTranscurridoTotalSec,
                faseNombre: estado.fase,
                vueltaActual: vActual,
                tiempoVueltaActualSec: tVueltaAct,
                sectorActual: secAct
            });
        }
    }

    const vueltasValidas = historialVueltas.filter((v) => v.estadoVuelta !== 'InvalidaPorLimites');

    const vueltaMasRapida = vueltasValidas.length > 0
        ? [...vueltasValidas].sort((a, b) => a.tiempoTotalVueltaSec - b.tiempoTotalVueltaSec)[0]
        : null;

    const tiempoTotalAcumuladoSec = Number(
        historialVueltas.reduce((acc, v) => acc + v.tiempoTotalVueltaSec, 0).toFixed(3)
    );

    const tiempoPromedioVueltaSec = historialVueltas.length > 0
        ? Number((tiempoTotalAcumuladoSec / historialVueltas.length).toFixed(3))
        : 0;

    return {
        id: `cron-res-${config.codigoSesion}-${Date.now()}`,
        configuracion: config,
        totalVueltasCompletadas: historialVueltas.length,
        vueltasValidasCount: vueltasValidas.length,
        tiempoTotalAcumuladoSec,
        vueltaMasRapida,
        tiempoPromedioVueltaSec,
        historialVueltas,
        estadoFinal: estado
    };
}

// 5. CÁLCULO DE MÉTRICAS GENERALES DE CARRERAS (reduce & Record)

const TIPOS_CATEGORIA: readonly TipoCategoriaCarrera[] = ['Formula1', 'GT3', 'MotoGP', 'Endurance'];
const ESTADOS_VUELTA: readonly EstadoVuelta[] = ['Valida', 'InvalidaPorLimites', 'VueltaRapida', 'PitIn'];

export function calcularMetricasCronometro(
    resultados: readonly ResultadoSesionTiming[]
): MetricasCronometroCarreras {
    if (resultados.length === 0) {
        const desgloseCatVacio = TIPOS_CATEGORIA.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<TipoCategoriaCarrera, number>);
        const desgloseEstVacio = ESTADOS_VUELTA.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoVuelta, number>);

        return {
            totalSesionesProcesadas: 0,
            sesionesCompletadasCount: 0,
            porcentajeFinalizacion: 0,
            tiempoPromedioVueltaGlobalSec: 0,
            pilotoConVueltaAbsolutaMasRapida: null,
            desglosePorCategoria: desgloseCatVacio,
            desglosePorEstadoVuelta: desgloseEstVacio
        };
    }

    const completadas = resultados.filter((r) => r.estadoFinal.fase === 'CarreraFinalizada');
    const sesionesCompletadasCount = completadas.length;
    const porcentajeFinalizacion = Number(((sesionesCompletadasCount / resultados.length) * 100).toFixed(1));

    const todasVueltas = resultados.flatMap((r) => r.historialVueltas);
    const sumaTiemposVueltas = todasVueltas.reduce((acc, v) => acc + v.tiempoTotalVueltaSec, 0);
    const tiempoPromedioVueltaGlobalSec = todasVueltas.length > 0
        ? Number((sumaTiemposVueltas / todasVueltas.length).toFixed(3))
        : 0;

    const sesionConVueltaMasRapida = [...resultados]
        .filter((r) => r.vueltaMasRapida !== null)
        .sort((a, b) => (a.vueltaMasRapida?.tiempoTotalVueltaSec ?? 999) - (b.vueltaMasRapida?.tiempoTotalVueltaSec ?? 999))[0];

    const pilotoConVueltaAbsolutaMasRapida = sesionConVueltaMasRapida
        ? sesionConVueltaMasRapida.configuracion.pilotoAuto
        : null;

    const desglosePorCategoria = resultados.reduce((acc, r) => {
        acc[r.configuracion.pilotoAuto.categoria] = (acc[r.configuracion.pilotoAuto.categoria] ?? 0) + 1;
        return acc;
    }, TIPOS_CATEGORIA.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<TipoCategoriaCarrera, number>));

    const desglosePorEstadoVuelta = todasVueltas.reduce((acc, v) => {
        acc[v.estadoVuelta] = (acc[v.estadoVuelta] ?? 0) + 1;
        return acc;
    }, ESTADOS_VUELTA.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoVuelta, number>));

    return {
        totalSesionesProcesadas: resultados.length,
        sesionesCompletadasCount,
        porcentajeFinalizacion,
        tiempoPromedioVueltaGlobalSec,
        pilotoConVueltaAbsolutaMasRapida,
        desglosePorCategoria,
        desglosePorEstadoVuelta
    };
}

export class ServicioCronometroCarreras {
    private readonly contenedor = new ContenedorCronometros<ResultadoSesionTiming>();

    public async procesarSesionesAsync(
        sesionesRaw: readonly ConfiguracionSesionTiming[],
        abandonoEnIndice: number = -1
    ): Promise<ResumenCronometroCarreras> {
        const advertencias: string[] = [];

        // Simulación de sincronización asíncrona con los sensores de telemetría de pista
        await new Promise((resolve) => setTimeout(resolve, 15));

        if (sesionesRaw.length === 0) {
            advertencias.push('No se recibieron configuraciones de sesión para el cronómetro de vueltas.');
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        sesionesRaw.forEach((config, idx) => {
            const valRes = validarConfiguracionSesion(config);
            if (!valRes.esValido) {
                advertencias.push(...valRes.errores);
            } else if (idsVistos.has(config.id)) {
                advertencias.push(`Configuración duplicada detectada por ID: ${config.id}.`);
            } else if (codigosVistos.has(config.codigoSesion)) {
                advertencias.push(`Código de sesión duplicado: ${config.codigoSesion}.`);
            } else {
                idsVistos.add(config.id);
                codigosVistos.add(config.codigoSesion);

                const provocAbandonoVuelta = idx === abandonoEnIndice ? 2 : -1;
                const resSim = ejecutarSimulacionCronometro(config, provocAbandonoVuelta);

                if (resSim.estadoFinal.fase === 'Abandono') {
                    advertencias.push(
                        `Abandono registrado para "${config.pilotoAuto.nombrePiloto}" en vuelta ${resSim.estadoFinal.vueltaAbandono}: ${resSim.estadoFinal.motivo}.`
                    );
                }

                const invalidaCount = resSim.historialVueltas.filter((v) => v.estadoVuelta === 'InvalidaPorLimites').length;
                if (invalidaCount > 0) {
                    advertencias.push(
                        `Alerta de pista: ${invalidaCount} vuelta(s) anulada(s) por límites de pista para "${config.pilotoAuto.nombrePiloto}".`
                    );
                }

                this.contenedor.agregar(resSim);
            }
        });

        const sesionesValidas = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasCronometro(sesionesValidas);

        return {
            ejecucionId: `LAP-TIMER-EXEC-${Date.now()}`,
            totalSesionesValidas: sesionesValidas.length,
            metricas,
            resultadosProcesados: sesionesValidas,
            advertencias
        };
    }
}

// 6. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenCronometro(resumen: ResumenCronometroCarreras, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` CRONÓMETRO DE VUELTAS DE CARRERAS - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Ejecución ID        : ${resumen.ejecucionId}`);
    console.log(`Sesiones Validadas  : ${resumen.totalSesionesValidas}`);
    console.log(`Sesiones Completadas: ${resumen.metricas.sesionesCompletadasCount} (${resumen.metricas.porcentajeFinalizacion}%)`);
    console.log(`Tiempo Prom. Vuelta : ${resumen.metricas.tiempoPromedioVueltaGlobalSec} s`);
    console.log(`Piloto Vuelta Rápida: ${resumen.metricas.pilotoConVueltaAbsolutaMasRapida ? `${resumen.metricas.pilotoConVueltaAbsolutaMasRapida.nombrePiloto} (${resumen.metricas.pilotoConVueltaAbsolutaMasRapida.equipo})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y SANCIONES DE PISTA (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR ESTADO DE VUELTA:`);
    Object.entries(resumen.metricas.desglosePorEstadoVuelta).forEach(([est, cantidad]) => {
        console.log(`   - ${est.padEnd(20)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.resultadosProcesados.map((r) => ({
            Código: r.configuracion.codigoSesion,
            Piloto: `${r.configuracion.pilotoAuto.nombrePiloto} (#${r.configuracion.pilotoAuto.numeroAuto})`,
            Circuito: r.configuracion.nombreCircuito,
            Categoría: r.configuracion.pilotoAuto.categoria,
            'Vueltas (Comp/Val)': `${r.totalVueltasCompletadas} / ${r.vueltasValidasCount}`,
            'Tiempo Total': `${r.tiempoTotalAcumuladoSec} s`,
            'Mejor Vuelta': r.vueltaMasRapida ? `${r.vueltaMasRapida.tiempoTotalVueltaSec} s (V${r.vueltaMasRapida.numeroVuelta})` : 'N/A',
            'Promedio Vuelta': `${r.tiempoPromedioVueltaSec} s`,
            EstadoFinal: r.estadoFinal.fase
        }))
    );
}

// 7. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const s1: ConfiguracionSesionTiming = {
    id: 'ses-01',
    codigoSesion: 'F1-SPA-QUALY-01',
    pilotoAuto: {
        id: 'pil-01',
        codigoPiloto: 'VER-1',
        nombrePiloto: 'Max Verstappen',
        equipo: 'Red Bull Racing',
        numeroAuto: 1,
        categoria: 'Formula1'
    },
    nombreCircuito: 'Circuit de Spa-Francorchamps',
    totalVueltasProgramadas: 4,
    tiempoRecordCircuitoSec: 85.0
};

const s2: ConfiguracionSesionTiming = {
    id: 'ses-02',
    codigoSesion: 'GT3-MONZA-RACE-02',
    pilotoAuto: {
        id: 'pil-02',
        codigoPiloto: 'ROS-46',
        nombrePiloto: 'Valentino Rossi',
        equipo: 'Team WRT BMW',
        numeroAuto: 46,
        categoria: 'GT3'
    },
    nombreCircuito: 'Autodromo Nazionale Monza',
    totalVueltasProgramadas: 3,
    tiempoRecordCircuitoSec: 92.5
};

// --- CASO 1: Sesión Oficial de Calificación y Carrera (Caso Normal) ---
const servicioNormal = new ServicioCronometroCarreras();

// --- CASO 2: Número de Auto Inválido, Abandono por Falla y Sesión Duplicada (Caso Límite) ---
const sesionCorrupta: ConfiguracionSesionTiming = {
    id: 'ses-99',
    codigoSesion: 'ERR-SES-999',
    pilotoAuto: {
        id: 'pil-99',
        codigoPiloto: 'ERR-99',
        nombrePiloto: 'Piloto Anonimo',
        equipo: 'Equipo Fantasma',
        numeroAuto: -5, // Número negativo -> Inválido
        categoria: 'Formula1'
    },
    nombreCircuito: 'Circuito Desconocido',
    totalVueltasProgramadas: 500, // > 200 -> Inválido
    tiempoRecordCircuitoSec: -10.0 // Récord negativo -> Inválido
};

const servicioLimite = new ServicioCronometroCarreras();

async function ejecutarPruebas(): Promise<void> {
    const resumenNormal = await servicioNormal.procesarSesionesAsync([s1, s2]);
    mostrarResumenCronometro(resumenNormal, 'Caso Normal - Calificación Spa y Monza GT3');

    const resumenLimite = await servicioLimite.procesarSesionesAsync([s1, sesionCorrupta, s1], 0); // Abandono en índice 0
    mostrarResumenCronometro(resumenLimite, 'Caso Límite - Abandono por Falla y Número Inválido');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));
