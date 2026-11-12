
// 1. MODELADO DEL DOMINIO CON UNIONES DISCRIMINADAS (Discriminated Unions)

export type NivelAutorizacionSciFi =
    | 'Cadete'
    | 'IngenieroDeSistemas'
    | 'ComandanteDeFlota'
    | 'InteligenciaArtificialCentral';

export type SubsistemaNave =
    | 'ReactorFusion'
    | 'EscudosDeflectores'
    | 'PropulsionWarp'
    | 'SoporteVital'
    | 'ComunicacionesSubespaciales';

export type SeveridadAlerta =
    | 'Nominal'
    | 'Advertencia'
    | 'Critico'
    | 'BrechaDeContencion';

export interface ConfiguracionTerminalNave {
    readonly id: string;
    readonly codigoNave: string;
    readonly nombreNave: string;
    readonly claseNave: string;
    readonly energiaMaximaMW: number;
    readonly temperaturaMaximaReactorK: number;
    readonly nivelAutorizacionRequerido: NivelAutorizacionSciFi;
}

export interface RegistroComandoTerminal {
    readonly secuencia: number;
    readonly timestampEstelar: string;
    readonly comandoEntrada: string;
    readonly subsistemaObjetivo: SubsistemaNave;
    readonly resultadoEjecucion: 'Exitoso' | 'DenegadoPorAutorizacion' | 'FalloCritico';
    readonly energiaConsumidaMW: number;
    readonly salidaConsola: string;
}

// Discriminated Unions para el Estado de la Terminal Sci-Fi (State Machine)
export type EstadoTerminalSciFi =
    | {
        readonly modo: 'Standby';
        readonly operadorActual: null;
        readonly nivelAccesoActual: null;
        readonly energiaDisponibleMW: number;
        readonly temperaturaReactorK: number;
        readonly integridadCascoPct: number;
        readonly escudosActivos: boolean;
        readonly velocidadWarp: number;
        readonly alertaSistema: SeveridadAlerta;
        readonly ultimoPrompt: string;
    }
    | {
        readonly modo: 'SesionActiva';
        readonly operadorActual: string;
        readonly nivelAccesoActual: NivelAutorizacionSciFi;
        readonly energiaDisponibleMW: number;
        readonly temperaturaReactorK: number;
        readonly integridadCascoPct: number;
        readonly escudosActivos: boolean;
        readonly velocidadWarp: number;
        readonly alertaSistema: SeveridadAlerta;
        readonly ultimoPrompt: string;
    }
    | {
        readonly modo: 'SaltoHyperespacial';
        readonly operadorActual: string;
        readonly nivelAccesoActual: NivelAutorizacionSciFi;
        readonly sectorDestino: string;
        readonly factorWarpActual: number;
        readonly energiaDisponibleMW: number;
        readonly temperaturaReactorK: number;
        readonly integridadCascoPct: number;
        readonly escudosActivos: boolean;
        readonly alertaSistema: SeveridadAlerta;
        readonly ultimoPrompt: string;
    }
    | {
        readonly modo: 'CuarentenaBloqueada';
        readonly codigoIncidente: string;
        readonly motivoBloqueo: string;
        readonly energiaDisponibleMW: number;
        readonly temperaturaReactorK: number;
        readonly integridadCascoPct: number;
        readonly escudosActivos: boolean;
        readonly alertaSistema: 'BrechaDeContencion';
        readonly ultimoPrompt: string;
    };

// Discriminated Unions para los Comandos / Eventos de la Terminal
export type ComandoTerminalSciFi =
    | {
        readonly tipo: 'CMD_AUTENTICAR_OPERADOR';
        readonly operador: string;
        readonly nivelAcceso: NivelAutorizacionSciFi;
        readonly timestampEstelar: string;
    }
    | {
        readonly tipo: 'CMD_AJUSTAR_REACTOR';
        readonly deltaEnergiaMW: number;
        readonly deltaTemperaturaK: number;
        readonly timestampEstelar: string;
    }
    | {
        readonly tipo: 'CMD_ALTERNAR_ESCUDOS';
        readonly activar: boolean;
        readonly timestampEstelar: string;
    }
    | {
        readonly tipo: 'CMD_INICIAR_SALTO_WARP';
        readonly sectorDestino: string;
        readonly factorWarp: number;
        readonly timestampEstelar: string;
    }
    | {
        readonly tipo: 'CMD_DIAGNOSTICO_SISTEMA';
        readonly subsistema: SubsistemaNave;
        readonly timestampEstelar: string;
    }
    | {
        readonly tipo: 'CMD_ACTIVAR_CUARENTENA';
        readonly codigoIncidente: string;
        readonly motivo: string;
        readonly timestampEstelar: string;
    }
    | {
        readonly tipo: 'CMD_CERRAR_SESION';
        readonly timestampEstelar: string;
    };

export interface ResultadoTerminalNave {
    readonly id: string;
    readonly configuracion: ConfiguracionTerminalNave;
    readonly totalComandosEjecutados: number;
    readonly comandosExitososCount: number;
    readonly comandosDenegadosOFallidosCount: number;
    readonly energiaTotalConsumidaMW: number;
    readonly historialComandos: readonly RegistroComandoTerminal[];
    readonly estadoFinal: EstadoTerminalSciFi;
}

export interface MetricasFlotaSciFi {
    readonly totalNavesProcesadas: number;
    readonly navesOperativasCount: number;
    readonly navesEnCuarentenaCount: number;
    readonly totalComandosProcesados: number;
    readonly tasaExitoComandosPct: number;
    readonly energiaTotalFlotaConsumidaMW: number;
    readonly naveMayorConsumoEnergetico: ResultadoTerminalNave | null;
    readonly desglosePorSubsistema: Readonly<Record<SubsistemaNave, number>>;
}

export interface ResumenTerminalSciFi {
    readonly ejecucionId: string;
    readonly totalTerminalesValidadas: number;
    readonly metricas: MetricasFlotaSciFi;
    readonly terminalesProcesadas: readonly ResultadoTerminalNave[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO DE TERMINALES (Generics & Encapsulamiento)

export class ContenedorTerminales<T extends { readonly id: string }> {
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

// 3. VALIDACIONES Y JERARQUÍA DE AUTORIZACIÓN DE COMANDO

const RANGO_AUTORIZACION: Readonly<Record<NivelAutorizacionSciFi, number>> = {
    Cadete: 1,
    IngenieroDeSistemas: 2,
    ComandanteDeFlota: 3,
    InteligenciaArtificialCentral: 4
};

export function tienePermisoSuficiente(
    nivelOperador: NivelAutorizacionSciFi,
    nivelRequerido: NivelAutorizacionSciFi
): boolean {
    return RANGO_AUTORIZACION[nivelOperador] >= RANGO_AUTORIZACION[nivelRequerido];
}

export function validarConfiguracionNave(
    config: ConfiguracionTerminalNave
): ResultadoValidacion<ConfiguracionTerminalNave> {
    const errores: string[] = [];

    if (config.nombreNave.trim().length === 0 || config.codigoNave.trim().length === 0) {
        errores.push(`Identificación de nave inválida en registro "${config.id}".`);
    }

    if (config.energiaMaximaMW <= 0 || config.energiaMaximaMW > 50000) {
        errores.push(
            `Capacidad máxima de energía fuera de especificación (${config.energiaMaximaMW} MW) en "${config.nombreNave}".`
        );
    }

    if (config.temperaturaMaximaReactorK < 1000 || config.temperaturaMaximaReactorK > 25000) {
        errores.push(
            `Límite térmico del reactor inválido (${config.temperaturaMaximaReactorK} K) en "${config.nombreNave}".`
        );
    }

    return errores.length === 0
        ? { esValido: true, datos: config }
        : { esValido: false, errores };
}

function evaluarSeveridadSistema(
    temperaturaK: number,
    temperaturaMaxK: number,
    energiaMW: number,
    energiaMaxMW: number,
    integridadPct: number
): SeveridadAlerta {
    if (temperaturaK >= temperaturaMaxK || integridadPct <= 25) {
        return 'BrechaDeContencion';
    }
    if (temperaturaK >= temperaturaMaxK * 0.85 || energiaMW <= energiaMaxMW * 0.15 || integridadPct <= 50) {
        return 'Critico';
    }
    if (temperaturaK >= temperaturaMaxK * 0.7 || energiaMW <= energiaMaxMW * 0.3) {
        return 'Advertencia';
    }
    return 'Nominal';
}

// 4. MÁQUINA DE ESTADOS Y REDUCER DE COMANDOS DE TERMINAL SCI-FI

export function reducerTerminalSciFi(
    estadoActual: EstadoTerminalSciFi,
    comando: ComandoTerminalSciFi,
    config: ConfiguracionTerminalNave,
    secuencia: number
): { readonly nuevoEstado: EstadoTerminalSciFi; readonly registro: RegistroComandoTerminal } {
    // En modo CuarentenaBloqueada, ningún comando operativo es aceptado
    if (estadoActual.modo === 'CuarentenaBloqueada') {
        const salida = `[BLOQUEADO] Terminal en cuarentena (${estadoActual.codigoIncidente}). Se requiere intervención física en núcleo.`;
        return {
            nuevoEstado: estadoActual,
            registro: {
                secuencia,
                timestampEstelar: comando.timestampEstelar,
                comandoEntrada: comando.tipo,
                subsistemaObjetivo: 'SoporteVital',
                resultadoEjecucion: 'FalloCritico',
                energiaConsumidaMW: 0,
                salidaConsola: salida
            }
        };
    }

    switch (comando.tipo) {
        case 'CMD_AUTENTICAR_OPERADOR': {
            const autorizado = tienePermisoSuficiente(
                comando.nivelAcceso,
                config.nivelAutorizacionRequerido
            );

            if (!autorizado) {
                const salida = `[ACCESO DENEGADO] Operador "${comando.operador}" (${comando.nivelAcceso}) no cumple nivel mínimo (${config.nivelAutorizacionRequerido}).`;
                return {
                    nuevoEstado: {
                        ...estadoActual,
                        ultimoPrompt: salida
                    },
                    registro: {
                        secuencia,
                        timestampEstelar: comando.timestampEstelar,
                        comandoEntrada: `AUTH ${comando.operador}`,
                        subsistemaObjetivo: 'ComunicacionesSubespaciales',
                        resultadoEjecucion: 'DenegadoPorAutorizacion',
                        energiaConsumidaMW: 5,
                        salidaConsola: salida
                    }
                };
            }

            const salida = `[AUTH OK] Bienvenido a ${config.nombreNave}, ${comando.operador} [${comando.nivelAcceso}].`;
            return {
                nuevoEstado: {
                    modo: 'SesionActiva',
                    operadorActual: comando.operador,
                    nivelAccesoActual: comando.nivelAcceso,
                    energiaDisponibleMW: estadoActual.energiaDisponibleMW,
                    temperaturaReactorK: estadoActual.temperaturaReactorK,
                    integridadCascoPct: estadoActual.integridadCascoPct,
                    escudosActivos: estadoActual.escudosActivos,
                    velocidadWarp: estadoActual.modo === 'SaltoHyperespacial' ? estadoActual.factorWarpActual : 0,
                    alertaSistema: estadoActual.alertaSistema,
                    ultimoPrompt: salida
                },
                registro: {
                    secuencia,
                    timestampEstelar: comando.timestampEstelar,
                    comandoEntrada: `AUTH ${comando.operador}`,
                    subsistemaObjetivo: 'ComunicacionesSubespaciales',
                    resultadoEjecucion: 'Exitoso',
                    energiaConsumidaMW: 5,
                    salidaConsola: salida
                }
            };
        }

        case 'CMD_AJUSTAR_REACTOR': {
            if (estadoActual.modo === 'Standby') {
                const salida = `[ERROR] Terminal en Standby. Autentique un operador antes de manipular el reactor.`;
                return {
                    nuevoEstado: { ...estadoActual, ultimoPrompt: salida },
                    registro: {
                        secuencia,
                        timestampEstelar: comando.timestampEstelar,
                        comandoEntrada: `REACTOR_ADJUST ${comando.deltaEnergiaMW}MW`,
                        subsistemaObjetivo: 'ReactorFusion',
                        resultadoEjecucion: 'DenegadoPorAutorizacion',
                        energiaConsumidaMW: 0,
                        salidaConsola: salida
                    }
                };
            }

            const nuevaEnergia = Math.min(
                config.energiaMaximaMW,
                Math.max(0, estadoActual.energiaDisponibleMW + comando.deltaEnergiaMW)
            );
            const nuevaTemp = Math.max(300, estadoActual.temperaturaReactorK + comando.deltaTemperaturaK);

            if (nuevaTemp >= config.temperaturaMaximaReactorK) {
                const salida = `[SCRAM AUTOMÁTICO] Sobrecarga térmica detectada (${nuevaTemp} K >= ${config.temperaturaMaximaReactorK} K).`;
                return {
                    nuevoEstado: {
                        modo: 'CuarentenaBloqueada',
                        codigoIncidente: `THERMAL-OVERLOAD-${config.codigoNave}`,
                        motivoBloqueo: `Fusión crítica evitada por SCRAM a ${nuevaTemp} K`,
                        energiaDisponibleMW: nuevaEnergia,
                        temperaturaReactorK: nuevaTemp,
                        integridadCascoPct: estadoActual.integridadCascoPct,
                        escudosActivos: false,
                        alertaSistema: 'BrechaDeContencion',
                        ultimoPrompt: salida
                    },
                    registro: {
                        secuencia,
                        timestampEstelar: comando.timestampEstelar,
                        comandoEntrada: `REACTOR_ADJUST ${comando.deltaEnergiaMW}MW`,
                        subsistemaObjetivo: 'ReactorFusion',
                        resultadoEjecucion: 'FalloCritico',
                        energiaConsumidaMW: Math.abs(comando.deltaEnergiaMW),
                        salidaConsola: salida
                    }
                };
            }

            const nuevaAlerta = evaluarSeveridadSistema(
                nuevaTemp,
                config.temperaturaMaximaReactorK,
                nuevaEnergia,
                config.energiaMaximaMW,
                estadoActual.integridadCascoPct
            );

            const salida = `[REACTOR] Energía: ${nuevaEnergia} MW | Núcleo: ${nuevaTemp} K | Estado: ${nuevaAlerta}.`;
            return {
                nuevoEstado: {
                    ...estadoActual,
                    energiaDisponibleMW: nuevaEnergia,
                    temperaturaReactorK: nuevaTemp,
                    alertaSistema: nuevaAlerta,
                    ultimoPrompt: salida
                },
                registro: {
                    secuencia,
                    timestampEstelar: comando.timestampEstelar,
                    comandoEntrada: `REACTOR_ADJUST ${comando.deltaEnergiaMW}MW`,
                    subsistemaObjetivo: 'ReactorFusion',
                    resultadoEjecucion: 'Exitoso',
                    energiaConsumidaMW: comando.deltaEnergiaMW < 0 ? Math.abs(comando.deltaEnergiaMW) : 25,
                    salidaConsola: salida
                }
            };
        }

        case 'CMD_ALTERNAR_ESCUDOS': {
            if (estadoActual.modo === 'Standby') {
                const salida = `[ERROR] Autenticación requerida para operar escudos deflectores.`;
                return {
                    nuevoEstado: { ...estadoActual, ultimoPrompt: salida },
                    registro: {
                        secuencia,
                        timestampEstelar: comando.timestampEstelar,
                        comandoEntrada: `SHIELDS ${comando.activar ? 'ON' : 'OFF'}`,
                        subsistemaObjetivo: 'EscudosDeflectores',
                        resultadoEjecucion: 'DenegadoPorAutorizacion',
                        energiaConsumidaMW: 0,
                        salidaConsola: salida
                    }
                };
            }

            const costoActivacion = comando.activar ? 180 : 10;
            if (comando.activar && estadoActual.energiaDisponibleMW < costoActivacion) {
                const salida = `[ENERGÍA INSUFICIENTE] Se requieren ${costoActivacion} MW para levantar escudos (Disponible: ${estadoActual.energiaDisponibleMW} MW).`;
                return {
                    nuevoEstado: { ...estadoActual, ultimoPrompt: salida },
                    registro: {
                        secuencia,
                        timestampEstelar: comando.timestampEstelar,
                        comandoEntrada: 'SHIELDS ON',
                        subsistemaObjetivo: 'EscudosDeflectores',
                        resultadoEjecucion: 'FalloCritico',
                        energiaConsumidaMW: 0,
                        salidaConsola: salida
                    }
                };
            }

            const energiaRestante = estadoActual.energiaDisponibleMW - costoActivacion;
            const salida = comando.activar
                ? `[ESCUDOS ACTIVOS] Matriz deflectora al 100% (-${costoActivacion} MW).`
                : `[ESCUDOS DESACTIVADOS] Energía redirigida a reserva.`;

            return {
                nuevoEstado: {
                    ...estadoActual,
                    escudosActivos: comando.activar,
                    energiaDisponibleMW: energiaRestante,
                    ultimoPrompt: salida
                },
                registro: {
                    secuencia,
                    timestampEstelar: comando.timestampEstelar,
                    comandoEntrada: `SHIELDS ${comando.activar ? 'ON' : 'OFF'}`,
                    subsistemaObjetivo: 'EscudosDeflectores',
                    resultadoEjecucion: 'Exitoso',
                    energiaConsumidaMW: costoActivacion,
                    salidaConsola: salida
                }
            };
        }

        case 'CMD_INICIAR_SALTO_WARP': {
            if (estadoActual.modo === 'Standby') {
                const salida = `[ERROR] No se puede iniciar salto Warp sin sesión de mando activa.`;
                return {
                    nuevoEstado: { ...estadoActual, ultimoPrompt: salida },
                    registro: {
                        secuencia,
                        timestampEstelar: comando.timestampEstelar,
                        comandoEntrada: `WARP_JUMP ${comando.sectorDestino} W${comando.factorWarp}`,
                        subsistemaObjetivo: 'PropulsionWarp',
                        resultadoEjecucion: 'DenegadoPorAutorizacion',
                        energiaConsumidaMW: 0,
                        salidaConsola: salida
                    }
                };
            }

            const costoWarp = Math.round(comando.factorWarp * 150);
            if (estadoActual.energiaDisponibleMW < costoWarp) {
                const salida = `[WARP ABORTADO] Energía insuficiente (${estadoActual.energiaDisponibleMW} MW) para Factor Warp ${comando.factorWarp} (Requiere ${costoWarp} MW).`;
                return {
                    nuevoEstado: { ...estadoActual, ultimoPrompt: salida },
                    registro: {
                        secuencia,
                        timestampEstelar: comando.timestampEstelar,
                        comandoEntrada: `WARP_JUMP ${comando.sectorDestino} W${comando.factorWarp}`,
                        subsistemaObjetivo: 'PropulsionWarp',
                        resultadoEjecucion: 'FalloCritico',
                        energiaConsumidaMW: 0,
                        salidaConsola: salida
                    }
                };
            }

            const energiaPostSalto = estadoActual.energiaDisponibleMW - costoWarp;
            const tempPostSalto = estadoActual.temperaturaReactorK + Math.round(comando.factorWarp * 320);
            const alertaPostSalto = evaluarSeveridadSistema(
                tempPostSalto,
                config.temperaturaMaximaReactorK,
                energiaPostSalto,
                config.energiaMaximaMW,
                estadoActual.integridadCascoPct
            );

            const salida = `[SALTO WARP] Rumbo fijado a "${comando.sectorDestino}" a Factor Warp ${comando.factorWarp} (-${costoWarp} MW).`;
            return {
                nuevoEstado: {
                    modo: 'SaltoHyperespacial',
                    operadorActual: estadoActual.operadorActual,
                    nivelAccesoActual: estadoActual.nivelAccesoActual,
                    sectorDestino: comando.sectorDestino,
                    factorWarpActual: comando.factorWarp,
                    energiaDisponibleMW: energiaPostSalto,
                    temperaturaReactorK: tempPostSalto,
                    integridadCascoPct: estadoActual.integridadCascoPct,
                    escudosActivos: estadoActual.escudosActivos,
                    alertaSistema: alertaPostSalto,
                    ultimoPrompt: salida
                },
                registro: {
                    secuencia,
                    timestampEstelar: comando.timestampEstelar,
                    comandoEntrada: `WARP_JUMP ${comando.sectorDestino} W${comando.factorWarp}`,
                    subsistemaObjetivo: 'PropulsionWarp',
                    resultadoEjecucion: 'Exitoso',
                    energiaConsumidaMW: costoWarp,
                    salidaConsola: salida
                }
            };
        }

        case 'CMD_DIAGNOSTICO_SISTEMA': {
            const salida = `[DIAGNÓSTICO ${comando.subsistema.toUpperCase()}] Integridad casco: ${estadoActual.integridadCascoPct}% | Energía: ${estadoActual.energiaDisponibleMW} MW | Temp: ${estadoActual.temperaturaReactorK} K.`;
            return {
                nuevoEstado: {
                    ...estadoActual,
                    ultimoPrompt: salida
                },
                registro: {
                    secuencia,
                    timestampEstelar: comando.timestampEstelar,
                    comandoEntrada: `DIAG --target=${comando.subsistema}`,
                    subsistemaObjetivo: comando.subsistema,
                    resultadoEjecucion: 'Exitoso',
                    energiaConsumidaMW: 15,
                    salidaConsola: salida
                }
            };
        }

        case 'CMD_ACTIVAR_CUARENTENA': {
            const salida = `[CUARENTENA ACTIVADA] Código: ${comando.codigoIncidente} - ${comando.motivo}`;
            return {
                nuevoEstado: {
                    modo: 'CuarentenaBloqueada',
                    codigoIncidente: comando.codigoIncidente,
                    motivoBloqueo: comando.motivo,
                    energiaDisponibleMW: estadoActual.energiaDisponibleMW,
                    temperaturaReactorK: estadoActual.temperaturaReactorK,
                    integridadCascoPct: estadoActual.integridadCascoPct,
                    escudosActivos: estadoActual.escudosActivos,
                    alertaSistema: 'BrechaDeContencion',
                    ultimoPrompt: salida
                },
                registro: {
                    secuencia,
                    timestampEstelar: comando.timestampEstelar,
                    comandoEntrada: `LOCKDOWN ${comando.codigoIncidente}`,
                    subsistemaObjetivo: 'SoporteVital',
                    resultadoEjecucion: 'Exitoso',
                    energiaConsumidaMW: 50,
                    salidaConsola: salida
                }
            };
        }

        case 'CMD_CERRAR_SESION': {
            const salida = `[LOGOUT] Sesión cerrada. Terminal ${config.codigoNave} en Standby.`;
            return {
                nuevoEstado: {
                    modo: 'Standby',
                    operadorActual: null,
                    nivelAccesoActual: null,
                    energiaDisponibleMW: estadoActual.energiaDisponibleMW,
                    temperaturaReactorK: estadoActual.temperaturaReactorK,
                    integridadCascoPct: estadoActual.integridadCascoPct,
                    escudosActivos: estadoActual.escudosActivos,
                    velocidadWarp: 0,
                    alertaSistema: estadoActual.alertaSistema,
                    ultimoPrompt: salida
                },
                registro: {
                    secuencia,
                    timestampEstelar: comando.timestampEstelar,
                    comandoEntrada: 'LOGOUT',
                    subsistemaObjetivo: 'ComunicacionesSubespaciales',
                    resultadoEjecucion: 'Exitoso',
                    energiaConsumidaMW: 0,
                    salidaConsola: salida
                }
            };
        }

        default:
            return {
                nuevoEstado: estadoActual,
                registro: {
                    secuencia,
                    timestampEstelar: 'SD-0000.0',
                    comandoEntrada: 'UNKNOWN',
                    subsistemaObjetivo: 'ComunicacionesSubespaciales',
                    resultadoEjecucion: 'FalloCritico',
                    energiaConsumidaMW: 0,
                    salidaConsola: '[ERROR] Comando desconocido.'
                }
            };
    }
}

export function ejecutarSecuenciaTerminal(
    config: ConfiguracionTerminalNave,
    comandos: readonly ComandoTerminalSciFi[]
): ResultadoTerminalNave {
    let estado: EstadoTerminalSciFi = {
        modo: 'Standby',
        operadorActual: null,
        nivelAccesoActual: null,
        energiaDisponibleMW: Math.round(config.energiaMaximaMW * 0.85),
        temperaturaReactorK: 2800,
        integridadCascoPct: 100,
        escudosActivos: false,
        velocidadWarp: 0,
        alertaSistema: 'Nominal',
        ultimoPrompt: `Terminal ${config.nombreNave} inicializada en Standby.`
    };

    const historialComandos: RegistroComandoTerminal[] = [];

    comandos.forEach((cmd, idx) => {
        const transicion = reducerTerminalSciFi(estado, cmd, config, idx + 1);
        estado = transicion.nuevoEstado;
        historialComandos.push(transicion.registro);
    });

    const comandosExitososCount = historialComandos.filter(
        (c) => c.resultadoEjecucion === 'Exitoso'
    ).length;
    const comandosDenegadosOFallidosCount = historialComandos.length - comandosExitososCount;
    const energiaTotalConsumidaMW = historialComandos.reduce(
        (acc, c) => acc + c.energiaConsumidaMW,
        0
    );

    return {
        id: `term-res-${config.codigoNave}-${Date.now()}`,
        configuracion: config,
        totalComandosEjecutados: historialComandos.length,
        comandosExitososCount,
        comandosDenegadosOFallidosCount,
        energiaTotalConsumidaMW,
        historialComandos,
        estadoFinal: estado
    };
}

// 5. CÁLCULO DE MÉTRICAS DE FLOTA (reduce & Record)

const SUBSISTEMAS_NAVE: readonly SubsistemaNave[] = [
    'ReactorFusion',
    'EscudosDeflectores',
    'PropulsionWarp',
    'SoporteVital',
    'ComunicacionesSubespaciales'
];

export function calcularMetricasFlota(
    resultados: readonly ResultadoTerminalNave[]
): MetricasFlotaSciFi {
    if (resultados.length === 0) {
        const desgloseVacio = SUBSISTEMAS_NAVE.reduce(
            (acc, sub) => ({ ...acc, [sub]: 0 }),
            {} as Record<SubsistemaNave, number>
        );

        return {
            totalNavesProcesadas: 0,
            navesOperativasCount: 0,
            navesEnCuarentenaCount: 0,
            totalComandosProcesados: 0,
            tasaExitoComandosPct: 0,
            energiaTotalFlotaConsumidaMW: 0,
            naveMayorConsumoEnergetico: null,
            desglosePorSubsistema: desgloseVacio
        };
    }

    const navesEnCuarentenaCount = resultados.filter(
        (r) => r.estadoFinal.modo === 'CuarentenaBloqueada'
    ).length;
    const navesOperativasCount = resultados.length - navesEnCuarentenaCount;

    const totalComandosProcesados = resultados.reduce(
        (acc, r) => acc + r.totalComandosEjecutados,
        0
    );
    const totalExitosos = resultados.reduce((acc, r) => acc + r.comandosExitososCount, 0);
    const tasaExitoComandosPct = totalComandosProcesados > 0
        ? Number(((totalExitosos / totalComandosProcesados) * 100).toFixed(1))
        : 0;

    const energiaTotalFlotaConsumidaMW = resultados.reduce(
        (acc, r) => acc + r.energiaTotalConsumidaMW,
        0
    );

    const naveMayorConsumoEnergetico = [...resultados].sort(
        (a, b) => b.energiaTotalConsumidaMW - a.energiaTotalConsumidaMW
    )[0] ?? null;

    const todosComandos = resultados.flatMap((r) => r.historialComandos);
    const desglosePorSubsistema = todosComandos.reduce((acc, cmd) => {
        acc[cmd.subsistemaObjetivo] = (acc[cmd.subsistemaObjetivo] ?? 0) + 1;
        return acc;
    }, SUBSISTEMAS_NAVE.reduce((acc, sub) => ({ ...acc, [sub]: 0 }), {} as Record<SubsistemaNave, number>));

    return {
        totalNavesProcesadas: resultados.length,
        navesOperativasCount,
        navesEnCuarentenaCount,
        totalComandosProcesados,
        tasaExitoComandosPct,
        energiaTotalFlotaConsumidaMW,
        naveMayorConsumoEnergetico,
        desglosePorSubsistema
    };
}

export class ServicioTerminalSciFi {
    private readonly contenedor = new ContenedorTerminales<ResultadoTerminalNave>();

    public async procesarTerminalesAsync(
        entradas: readonly {
            readonly config: ConfiguracionTerminalNave;
            readonly comandos: readonly ComandoTerminalSciFi[];
        }[]
    ): Promise<ResumenTerminalSciFi> {
        const advertencias: string[] = [];

        // Simulación asíncrona de enlace subespacial con las terminales de la flota
        await new Promise((resolve) => setTimeout(resolve, 15));

        if (entradas.length === 0) {
            advertencias.push('No se recibieron configuraciones de terminales espaciales.');
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        for (const entrada of entradas) {
            const valRes = validarConfiguracionNave(entrada.config);
            if (!valRes.esValido) {
                advertencias.push(...valRes.errores);
            } else if (idsVistos.has(entrada.config.id)) {
                advertencias.push(`Terminal duplicada detectada por ID: ${entrada.config.id}.`);
            } else if (codigosVistos.has(entrada.config.codigoNave)) {
                advertencias.push(`Código de registro de nave duplicado: ${entrada.config.codigoNave}.`);
            } else {
                idsVistos.add(entrada.config.id);
                codigosVistos.add(entrada.config.codigoNave);

                const resultado = ejecutarSecuenciaTerminal(entrada.config, entrada.comandos);
                this.contenedor.agregar(resultado);

                if (resultado.estadoFinal.modo === 'CuarentenaBloqueada') {
                    advertencias.push(
                        `ALERTA ROJA en "${entrada.config.nombreNave}": ${resultado.estadoFinal.motivoBloqueo} (${resultado.estadoFinal.codigoIncidente}).`
                    );
                }

                if (resultado.comandosDenegadosOFallidosCount > 0) {
                    advertencias.push(
                        `Seguridad "${entrada.config.codigoNave}": ${resultado.comandosDenegadosOFallidosCount} comando(s) rechazado(s) o fallido(s).`
                    );
                }
            }
        }

        const terminalesValidas = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasFlota(terminalesValidas);

        return {
            ejecucionId: `SCIFI-TERM-EXEC-${Date.now()}`,
            totalTerminalesValidadas: terminalesValidas.length,
            metricas,
            terminalesProcesadas: terminalesValidas,
            advertencias
        };
    }
}

// 6. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenTerminalSciFi(resumen: ResumenTerminalSciFi, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` TERMINAL DE MANDO SCI-FI - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Ejecución ID        : ${resumen.ejecucionId}`);
    console.log(`Naves Validadas     : ${resumen.totalTerminalesValidadas}`);
    console.log(`Estado Flota        : ${resumen.metricas.navesOperativasCount} Operativas | ${resumen.metricas.navesEnCuarentenaCount} En Cuarentena`);
    console.log(`Comandos Procesados : ${resumen.metricas.totalComandosProcesados} (Tasa Éxito: ${resumen.metricas.tasaExitoComandosPct}%)`);
    console.log(`Consumo Energético  : ${resumen.metricas.energiaTotalFlotaConsumidaMW} MW totales`);
    console.log(`Mayor Consumo       : ${resumen.metricas.naveMayorConsumoEnergetico ? `"${resumen.metricas.naveMayorConsumoEnergetico.configuracion.nombreNave}" (${resumen.metricas.naveMayorConsumoEnergetico.energiaTotalConsumidaMW} MW)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`BITÁCORA DE SEGURIDAD Y ALERTAS DE FLOTA (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`COMANDOS POR SUBSISTEMA DE NAVE:`);
    Object.entries(resumen.metricas.desglosePorSubsistema).forEach(([sub, cantidad]) => {
        console.log(`   - ${sub.padEnd(28)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.terminalesProcesadas.map((t) => ({
            Código: t.configuracion.codigoNave,
            Nave: `${t.configuracion.nombreNave} (${t.configuracion.claseNave})`,
            ModoFinal: t.estadoFinal.modo,
            Alerta: t.estadoFinal.alertaSistema,
            'Energía Restante': `${t.estadoFinal.energiaDisponibleMW} MW`,
            'Temp Reactor': `${t.estadoFinal.temperaturaReactorK} K`,
            'Cmds (OK/Fail)': `${t.comandosExitososCount} / ${t.comandosDenegadosOFallidosCount}`,
            'Último Prompt': t.estadoFinal.ultimoPrompt
        }))
    );
}

// 7. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const naveNormal1: ConfiguracionTerminalNave = {
    id: 'ship-01',
    codigoNave: 'USS-HYPERION-NCC-01',
    nombreNave: 'USS Hyperion',
    claseNave: 'Crucero de Exploración',
    energiaMaximaMW: 4000,
    temperaturaMaximaReactorK: 9500,
    nivelAutorizacionRequerido: 'IngenieroDeSistemas'
};

const comandosNormal1: readonly ComandoTerminalSciFi[] = [
    {
        tipo: 'CMD_AUTENTICAR_OPERADOR',
        operador: 'Comandante Vance',
        nivelAcceso: 'ComandanteDeFlota',
        timestampEstelar: 'SD-2026.316.01'
    },
    {
        tipo: 'CMD_DIAGNOSTICO_SISTEMA',
        subsistema: 'ReactorFusion',
        timestampEstelar: 'SD-2026.316.02'
    },
    {
        tipo: 'CMD_ALTERNAR_ESCUDOS',
        activar: true,
        timestampEstelar: 'SD-2026.316.03'
    },
    {
        tipo: 'CMD_INICIAR_SALTO_WARP',
        sectorDestino: 'Nebulosa de Orión - Sector 7G',
        factorWarp: 6.5,
        timestampEstelar: 'SD-2026.316.04'
    }
];

const naveNormal2: ConfiguracionTerminalNave = {
    id: 'ship-02',
    codigoNave: 'ISV-ASTRAL-09',
    nombreNave: 'ISV Astral Vanguard',
    claseNave: 'Fragata Científica',
    energiaMaximaMW: 2500,
    temperaturaMaximaReactorK: 8000,
    nivelAutorizacionRequerido: 'IngenieroDeSistemas'
};

const comandosNormal2: readonly ComandoTerminalSciFi[] = [
    {
        tipo: 'CMD_AUTENTICAR_OPERADOR',
        operador: 'IA HELIOS-9',
        nivelAcceso: 'InteligenciaArtificialCentral',
        timestampEstelar: 'SD-2026.316.10'
    },
    {
        tipo: 'CMD_AJUSTAR_REACTOR',
        deltaEnergiaMW: 300,
        deltaTemperaturaK: 650,
        timestampEstelar: 'SD-2026.316.11'
    },
    {
        tipo: 'CMD_DIAGNOSTICO_SISTEMA',
        subsistema: 'SoporteVital',
        timestampEstelar: 'SD-2026.316.12'
    }
];

// --- CASO LÍMITE: Intento de Acceso No Autorizado, Sobrecarga Térmica SCRAM y Nave Corrupta ---
const naveIncidente: ConfiguracionTerminalNave = {
    id: 'ship-03',
    codigoNave: 'NOSTROMO-X4',
    nombreNave: 'USCSS Nostromo X4',
    claseNave: 'Carguero Minero',
    energiaMaximaMW: 2000,
    temperaturaMaximaReactorK: 6000,
    nivelAutorizacionRequerido: 'ComandanteDeFlota'
};

const comandosIncidente: readonly ComandoTerminalSciFi[] = [
    {
        tipo: 'CMD_AUTENTICAR_OPERADOR',
        operador: 'Cadete Miller',
        nivelAcceso: 'Cadete', // Denegado: requiere ComandanteDeFlota
        timestampEstelar: 'SD-2026.316.20'
    },
    {
        tipo: 'CMD_AUTENTICAR_OPERADOR',
        operador: 'Capitana Ripley',
        nivelAcceso: 'ComandanteDeFlota',
        timestampEstelar: 'SD-2026.316.21'
    },
    {
        tipo: 'CMD_AJUSTAR_REACTOR',
        deltaEnergiaMW: 800,
        deltaTemperaturaK: 4200, // Supera 6000 K -> Dispara SCRAM y CuarentenaBloqueada
        timestampEstelar: 'SD-2026.316.22'
    },
    {
        tipo: 'CMD_ALTERNAR_ESCUDOS',
        activar: true, // Rechazado porque la terminal ya entró en CuarentenaBloqueada
        timestampEstelar: 'SD-2026.316.23'
    }
];

const naveCorrupta: ConfiguracionTerminalNave = {
    id: 'ship-99',
    codigoNave: '',
    nombreNave: '',
    claseNave: 'Desconocida',
    energiaMaximaMW: -500, // Inválido
    temperaturaMaximaReactorK: 200, // < 1000 K -> Inválido
    nivelAutorizacionRequerido: 'Cadete'
};

async function ejecutarPruebas(): Promise<void> {
    // Ejecución Caso 1 (Normal)
    const servicioNormal = new ServicioTerminalSciFi();
    const resumenNormal = await servicioNormal.procesarTerminalesAsync([
        { config: naveNormal1, comandos: comandosNormal1 },
        { config: naveNormal2, comandos: comandosNormal2 }
    ]);
    mostrarResumenTerminalSciFi(resumenNormal, 'Caso Normal - Flota de Exploración y Salto Warp');

    // Ejecución Caso 2 (Límite)
    const servicioLimite = new ServicioTerminalSciFi();
    const resumenLimite = await servicioLimite.procesarTerminalesAsync([
        { config: naveIncidente, comandos: comandosIncidente },
        { config: naveCorrupta, comandos: [] },
        { config: naveIncidente, comandos: comandosIncidente } // Duplicada
    ]);
    mostrarResumenTerminalSciFi(resumenLimite, 'Caso Límite - Acceso Denegado, SCRAM Térmico y Nave Corrupta');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));