
// 1. MODELADO DEL DOMINIO (Discriminated Unions, Types & Interfaces)

export type TipoPropulsion = 'Combustion' | 'Hibrido' | 'Electrico';
export type TipoTraccion = 'RWD' | 'AWD' | 'FWD';

export interface EspecificacionesHipercar {
    readonly id: string;
    readonly codigoVehiculo: string;
    readonly marca: string;
    readonly modelo: string;
    readonly potenciaHP: number;
    readonly torqueNM: number;
    readonly pesoKG: number;
    readonly coeficienteAerodinamicoCd: number;
    readonly velocidadMaximaKMH: number;
    readonly propulsion: TipoPropulsion;
    readonly traccion: TipoTraccion;
}

// Discriminated Unions para la Máquina de Estados del Simulador
export type EstadoSimulacion =
    | { readonly estado: 'Reposo'; readonly velocidadKMH: 0; readonly tiempoSegundos: 0; readonly distanciaMetros: 0 }
    | {
        readonly estado: 'Acelerando';
        readonly velocidadKMH: number;
        readonly aceleracionMS2: number;
        readonly marchaActual: number;
        readonly rpm: number;
        readonly tiempoSegundos: number;
        readonly distanciaMetros: number;
    }
    | { readonly estado: 'VelocidadMaximaAlcanzada'; readonly velocidadKMH: number; readonly tiempoSegundos: number; readonly distanciaMetros: number }
    | { readonly estado: 'Frenando'; readonly velocidadKMH: number; readonly tiempoSegundos: number; readonly distanciaMetros: number }
    | { readonly estado: 'Finalizado'; readonly velocidadKMH: number; readonly tiempoSegundos: number; readonly distanciaMetros: number }
    | { readonly estado: 'FallaMecanica'; readonly error: string; readonly tiempoSegundos: number; readonly velocidadKMH: number; readonly distanciaMetros: number };

// Discriminated Unions para los Eventos del Reducer
export type EventoSimulador =
    | { readonly tipo: 'INICIAR_LAUNCH_CONTROL' }
    | { readonly tipo: 'AVANZAR_TIEMPO'; readonly deltaSegundos: number; readonly pedalAceleradorPct: number }
    | { readonly tipo: 'APLICAR_FRENOS'; readonly fuerzaFrenadoPct: number }
    | { readonly tipo: 'REGISTRAR_FALLA'; readonly razon: string };

export interface RegistroTelemetriaTick {
    readonly tiempoSegundos: number;
    readonly velocidadKMH: number;
    readonly aceleracionMS2: number;
    readonly distanciaMetros: number;
    readonly estadoNombre: string;
}

export interface ResultadoSimulacionAceleracion {
    readonly id: string;
    readonly hipercar: EspecificacionesHipercar;
    readonly tiempo0a100KMH: number | null;
    readonly tiempo0a200KMH: number | null;
    readonly tiempo0a300KMH: number | null;
    readonly tiempoCuartoMilla400m: number | null;
    readonly velocidadMaximaAlcanzadaKMH: number;
    readonly distanciaTotalRecorridaM: number;
    readonly tiempoTotalSimuladoS: number;
    readonly historialTelemetria: readonly RegistroTelemetriaTick[];
    readonly estadoFinal: EstadoSimulacion;
}

export interface MetricasSimulador {
    readonly totalSimulaciones: number;
    readonly simulacionesExitosasCount: number;
    readonly porcentajeExito: number;
    readonly tiempoPromedio0a100S: number;
    readonly velocidadMaximaPromedioKMH: number;
    readonly hipercarMasRapido0a100: EspecificacionesHipercar | null;
    readonly desglosePorPropulsion: Readonly<Record<TipoPropulsion, number>>;
    readonly desglosePorTraccion: Readonly<Record<TipoTraccion, number>>;
}

export interface ResumenSimuladorHipercar {
    readonly ejecucionId: string;
    readonly totalSimulacionesValidas: number;
    readonly metricas: MetricasSimulador;
    readonly resultadosProcesados: readonly ResultadoSimulacionAceleracion[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO (Generics & Encapsulamiento)

export class ContenedorSimulaciones<T extends { readonly id: string }> {
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

export function validarEspecificacionesHipercar(
    car: EspecificacionesHipercar
): ResultadoValidacion<EspecificacionesHipercar> {
    const errores: string[] = [];

    if (car.potenciaHP <= 0 || car.potenciaHP > 3000) {
        errores.push(`Potencia fuera de rango (${car.potenciaHP} HP) en "${car.marca} ${car.modelo}".`);
    }

    if (car.pesoKG <= 0 || car.pesoKG > 4000) {
        errores.push(`Peso fuera de rango (${car.pesoKG} kg) en "${car.marca} ${car.modelo}".`);
    }

    if (car.coeficienteAerodinamicoCd <= 0 || car.coeficienteAerodinamicoCd > 1.0) {
        errores.push(`Coeficiente aerodinámico Cd inválido (${car.coeficienteAerodinamicoCd}) en "${car.marca} ${car.modelo}".`);
    }

    if (car.velocidadMaximaKMH <= 0 || car.velocidadMaximaKMH > 600) {
        errores.push(`Velocidad máxima fuera de rango (${car.velocidadMaximaKMH} km/h) en "${car.marca} ${car.modelo}".`);
    }

    return errores.length === 0
        ? { esValido: true, datos: car }
        : { esValido: false, errores };
}

// 4. MÁQUINA DE ESTADOS Y REDUCER DE ACELERACIÓN

export function reducerSimulacion(
    estadoActual: EstadoSimulacion,
    evento: EventoSimulador,
    car: EspecificacionesHipercar
): EstadoSimulacion {
    switch (evento.tipo) {
        case 'INICIAR_LAUNCH_CONTROL': {
            if (estadoActual.estado === 'Reposo' || estadoActual.estado === 'Finalizado') {
                return {
                    estado: 'Acelerando',
                    velocidadKMH: 0,
                    aceleracionMS2: 0,
                    marchaActual: 1,
                    rpm: 3500,
                    tiempoSegundos: 0,
                    distanciaMetros: 0
                };
            }
            return estadoActual;
        }

        case 'AVANZAR_TIEMPO': {
            if (estadoActual.estado !== 'Acelerando' && estadoActual.estado !== 'VelocidadMaximaAlcanzada') {
                return estadoActual;
            }

            const tiempoNuevo = Number((estadoActual.tiempoSegundos + evento.deltaSegundos).toFixed(2));
            const velMS = (estadoActual.velocidadKMH * 1000) / 3600;

            const fDrag = 0.5 * 1.2 * car.coeficienteAerodinamicoCd * 2.1 * (velMS * velMS);
            const factorTraccion = car.traccion === 'AWD' ? 1.0 : car.traccion === 'RWD' ? 0.85 : 0.7;
            const potenciaWatts = car.potenciaHP * 745.7;
            const fMotor = velMS > 5 ? (potenciaWatts / velMS) * factorTraccion : (car.torqueNM * 3.5) / 0.35 * factorTraccion;

            const fNeta = Math.max(0, (fMotor - fDrag) * (evento.pedalAceleradorPct / 100));
            const aceleracionMS2 = Number((fNeta / car.pesoKG).toFixed(2));

            let nuevaVelMS = velMS + aceleracionMS2 * evento.deltaSegundos;
            let nuevaVelKMH = Number(((nuevaVelMS * 3600) / 1000).toFixed(1));

            if (nuevaVelKMH >= car.velocidadMaximaKMH) {
                nuevaVelKMH = car.velocidadMaximaKMH;
                nuevaVelMS = (nuevaVelKMH * 1000) / 3600;
            }

            const distanciaNueva = Number((estadoActual.distanciaMetros + nuevaVelMS * evento.deltaSegundos).toFixed(2));
            const marchaCalculada = Math.min(7, Math.floor(nuevaVelKMH / 60) + 1);
            const rpmCalculadas = Math.min(9000, 2000 + (nuevaVelKMH % 60) * 110);

            if (nuevaVelKMH >= car.velocidadMaximaKMH) {
                return {
                    estado: 'VelocidadMaximaAlcanzada',
                    velocidadKMH: nuevaVelKMH,
                    tiempoSegundos: tiempoNuevo,
                    distanciaMetros: distanciaNueva
                };
            }

            return {
                estado: 'Acelerando',
                velocidadKMH: nuevaVelKMH,
                aceleracionMS2,
                marchaActual: marchaCalculada,
                rpm: Math.round(rpmCalculadas),
                tiempoSegundos: tiempoNuevo,
                distanciaMetros: distanciaNueva
            };
        }

        case 'APLICAR_FRENOS': {
            if (estadoActual.estado === 'Reposo' || estadoActual.estado === 'Finalizado') {
                return estadoActual;
            }
            return {
                estado: 'Finalizado',
                tiempoSegundos: estadoActual.tiempoSegundos,
                distanciaMetros: estadoActual.distanciaMetros,
                velocidadKMH: estadoActual.velocidadKMH
            };
        }

        case 'REGISTRAR_FALLA': {
            return {
                estado: 'FallaMecanica',
                error: evento.razon,
                tiempoSegundos: estadoActual.tiempoSegundos,
                velocidadKMH: estadoActual.velocidadKMH,
                distanciaMetros: estadoActual.distanciaMetros
            };
        }

        default:
            return estadoActual;
    }
}

export function ejecutarSimulacionLaunch(
    car: EspecificacionesHipercar,
    duracionMaxSegundos: number = 15,
    simularFalla: boolean = false
): ResultadoSimulacionAceleracion {
    let estado: EstadoSimulacion = { estado: 'Reposo', velocidadKMH: 0, tiempoSegundos: 0, distanciaMetros: 0 };
    const historial: RegistroTelemetriaTick[] = [];

    estado = reducerSimulacion(estado, { tipo: 'INICIAR_LAUNCH_CONTROL' }, car);

    let tiempo0a100: number | null = null;
    let tiempo0a200: number | null = null;
    let tiempo0a300: number | null = null;
    let tiempo400m: number | null = null;

    const dt = 0.5;
    const pasosTotales = Math.floor(duracionMaxSegundos / dt);

    for (let i = 0; i < pasosTotales; i++) {
        if (simularFalla && i === 6) {
            estado = reducerSimulacion(
                estado,
                { tipo: 'REGISTRAR_FALLA', razon: 'Sobrecalentamiento en embrague de transmisión' },
                car
            );
            break;
        }

        estado = reducerSimulacion(estado, { tipo: 'AVANZAR_TIEMPO', deltaSegundos: dt, pedalAceleradorPct: 100 }, car);

        if (estado.estado === 'Acelerando' || estado.estado === 'VelocidadMaximaAlcanzada') {
            historial.push({
                tiempoSegundos: estado.tiempoSegundos,
                velocidadKMH: estado.velocidadKMH,
                aceleracionMS2: estado.estado === 'Acelerando' ? estado.aceleracionMS2 : 0,
                distanciaMetros: estado.distanciaMetros,
                estadoNombre: estado.estado
            });

            if (tiempo0a100 === null && estado.velocidadKMH >= 100) {
                tiempo0a100 = estado.tiempoSegundos;
            }
            if (tiempo0a200 === null && estado.velocidadKMH >= 200) {
                tiempo0a200 = estado.tiempoSegundos;
            }
            if (tiempo0a300 === null && estado.velocidadKMH >= 300) {
                tiempo0a300 = estado.tiempoSegundos;
            }
            if (tiempo400m === null && estado.distanciaMetros >= 400) {
                tiempo400m = estado.tiempoSegundos;
            }

            if (estado.estado === 'VelocidadMaximaAlcanzada') {
                break;
            }
        }
    }

    if (estado.estado !== 'FallaMecanica') {
        estado = reducerSimulacion(estado, { tipo: 'APLICAR_FRENOS', fuerzaFrenadoPct: 100 }, car);
    }

    const velMaxAlcanzada = historial.reduce((max, h) => Math.max(max, h.velocidadKMH), 0);
    const distTotal = historial.length > 0 ? historial[historial.length - 1].distanciaMetros : 0;
    const tiempoTotal = historial.length > 0 ? historial[historial.length - 1].tiempoSegundos : 0;

    return {
        id: `sim-${car.codigoVehiculo}-${Date.now()}`,
        hipercar: car,
        tiempo0a100KMH: tiempo0a100,
        tiempo0a200KMH: tiempo0a200,
        tiempo0a300KMH: tiempo0a300,
        tiempoCuartoMilla400m: tiempo400m,
        velocidadMaximaAlcanzadaKMH: velMaxAlcanzada,
        distanciaTotalRecorridaM: distTotal,
        tiempoTotalSimuladoS: tiempoTotal,
        historialTelemetria: historial,
        estadoFinal: estado
    };
}

// 5. CÁLCULO DE MÉTRICAS GENERALES

const TIPOS_PROPULSION: readonly TipoPropulsion[] = ['Combustion', 'Hibrido', 'Electrico'];
const TIPOS_TRACCION: readonly TipoTraccion[] = ['RWD', 'AWD', 'FWD'];

export function calcularMetricasSimulaciones(
    resultados: readonly ResultadoSimulacionAceleracion[]
): MetricasSimulador {
    if (resultados.length === 0) {
        const desglosePropVacio = TIPOS_PROPULSION.reduce((acc, p) => ({ ...acc, [p]: 0 }), {} as Record<TipoPropulsion, number>);
        const desgloseTracVacio = TIPOS_TRACCION.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoTraccion, number>);

        return {
            totalSimulaciones: 0,
            simulacionesExitosasCount: 0,
            porcentajeExito: 0,
            tiempoPromedio0a100S: 0,
            velocidadMaximaPromedioKMH: 0,
            hipercarMasRapido0a100: null,
            desglosePorPropulsion: desglosePropVacio,
            desglosePorTraccion: desgloseTracVacio
        };
    }

    const exitosas = resultados.filter((r) => r.estadoFinal.estado !== 'FallaMecanica');
    const simulacionesExitosasCount = exitosas.length;
    const porcentajeExito = Number(((simulacionesExitosasCount / resultados.length) * 100).toFixed(1));

    const t0a100Validos = exitosas.map((r) => r.tiempo0a100KMH).filter((t): t is number => t !== null);
    const tiempoPromedio0a100S = t0a100Validos.length > 0
        ? Number((t0a100Validos.reduce((acc, val) => acc + val, 0) / t0a100Validos.length).toFixed(2))
        : 0;

    const vMaxValidas = exitosas.map((r) => r.velocidadMaximaAlcanzadaKMH);
    const velocidadMaximaPromedioKMH = vMaxValidas.length > 0
        ? Math.round(vMaxValidas.reduce((acc, val) => acc + val, 0) / vMaxValidas.length)
        : 0;

    const hipercarMasRapido0a100 = [...exitosas]
        .filter((r) => r.tiempo0a100KMH !== null)
        .sort((a, b) => (a.tiempo0a100KMH ?? 99) - (b.tiempo0a100KMH ?? 99))[0]?.hipercar ?? null;

    const desglosePorPropulsion = resultados.reduce((acc, r) => {
        acc[r.hipercar.propulsion] = (acc[r.hipercar.propulsion] ?? 0) + 1;
        return acc;
    }, TIPOS_PROPULSION.reduce((acc, p) => ({ ...acc, [p]: 0 }), {} as Record<TipoPropulsion, number>));

    const desglosePorTraccion = resultados.reduce((acc, r) => {
        acc[r.hipercar.traccion] = (acc[r.hipercar.traccion] ?? 0) + 1;
        return acc;
    }, TIPOS_TRACCION.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoTraccion, number>));

    return {
        totalSimulaciones: resultados.length,
        simulacionesExitosasCount,
        porcentajeExito,
        tiempoPromedio0a100S,
        velocidadMaximaPromedioKMH,
        hipercarMasRapido0a100,
        desglosePorPropulsion,
        desglosePorTraccion
    };
}

export class ServicioSimuladorHipercar {
    private readonly contenedor = new ContenedorSimulaciones<ResultadoSimulacionAceleracion>();

    public procesarSimulaciones(
        hipercars: readonly EspecificacionesHipercar[],
        fallaEnIndice: number = -1
    ): ResumenSimuladorHipercar {
        const advertencias: string[] = [];
        const resultados: ResultadoSimulacionAceleracion[] = [];

        hipercars.forEach((car, index) => {
            const resVal = validarEspecificacionesHipercar(car);
            if (!resVal.esValido) {
                advertencias.push(...resVal.errores);
            } else {
                const simularFalla = index === fallaEnIndice;
                const resSim = ejecutarSimulacionLaunch(car, 12, simularFalla);
                this.contenedor.agregar(resSim);
                resultados.push(resSim);

                if (resSim.estadoFinal.estado === 'FallaMecanica') {
                    advertencias.push(
                        `Falla de telemetría en "${car.marca} ${car.modelo}": ${resSim.estadoFinal.error} a los ${resSim.estadoFinal.tiempoSegundos}s.`
                    );
                }
            }
        });

        const validos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasSimulaciones(validos);

        return {
            ejecucionId: `EXEC-SIM-${Date.now()}`,
            totalSimulacionesValidas: validos.length,
            metricas,
            resultadosProcesados: validos,
            advertencias
        };
    }
}

// 6. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenSimulador(resumen: ResumenSimuladorHipercar, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` SIMULADOR DE ACELERACIÓN HYPERCAR - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Ejecución ID        : ${resumen.ejecucionId}`);
    console.log(`Simulaciones Validas: ${resumen.totalSimulacionesValidas}`);
    console.log(`Tasa de Éxito       : ${resumen.metricas.simulacionesExitosasCount} de ${resumen.metricas.totalSimulaciones} (${resumen.metricas.porcentajeExito}%)`);
    console.log(`Tiempo Prom. 0-100  : ${resumen.metricas.tiempoPromedio0a100S} s`);
    console.log(`Velocidad Max Prom. : ${resumen.metricas.velocidadMaximaPromedioKMH} km/h`);
    console.log(`Hipercar Más Rápido : ${resumen.metricas.hipercarMasRapido0a100 ? `${resumen.metricas.hipercarMasRapido0a100.marca} ${resumen.metricas.hipercarMasRapido0a100.modelo}` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y FALLAS DE TELEMETRÍA (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR PROPULSIÓN:`);
    Object.entries(resumen.metricas.desglosePorPropulsion).forEach(([prop, cantidad]) => {
        console.log(`   - ${prop.padEnd(14)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.resultadosProcesados.map((r) => ({
            Vehículo: `${r.hipercar.marca} ${r.hipercar.modelo}`,
            Potencia: `${r.hipercar.potenciaHP} HP`,
            Propulsión: r.hipercar.propulsion,
            Tracción: r.hipercar.traccion,
            '0-100 km/h': r.tiempo0a100KMH ? `${r.tiempo0a100KMH} s` : 'N/A',
            '0-200 km/h': r.tiempo0a200KMH ? `${r.tiempo0a200KMH} s` : 'N/A',
            '1/4 Milla': r.tiempoCuartoMilla400m ? `${r.tiempoCuartoMilla400m} s` : 'N/A',
            'Vel. Máxima': `${r.velocidadMaximaAlcanzadaKMH} km/h`,
            'Dist. Total': `${r.distanciaTotalRecorridaM} m`,
            Estado: r.estadoFinal.estado
        }))
    );
}

// 7. CASOS DE PRUEBA (Caso Normal y Caso Límite / Falla)

const h1: EspecificacionesHipercar = {
    id: 'hyp-01',
    codigoVehiculo: 'RIM-NEVERA',
    marca: 'Rimac',
    modelo: 'Nevera R',
    potenciaHP: 2107,
    torqueNM: 2360,
    pesoKG: 2277,
    coeficienteAerodinamicoCd: 0.3,
    velocidadMaximaKMH: 412,
    propulsion: 'Electrico',
    traccion: 'AWD'
};

const h2: EspecificacionesHipercar = {
    id: 'hyp-02',
    codigoVehiculo: 'BUG-CHIRON-SS',
    marca: 'Bugatti',
    modelo: 'Chiron Super Sport',
    potenciaHP: 1600,
    torqueNM: 1600,
    pesoKG: 1975,
    coeficienteAerodinamicoCd: 0.35,
    velocidadMaximaKMH: 440,
    propulsion: 'Combustion',
    traccion: 'AWD'
};

const h3: EspecificacionesHipercar = {
    id: 'hyp-03',
    codigoVehiculo: 'KOE-JESKO-ABS',
    marca: 'Koenigsegg',
    modelo: 'Jesko Absolut',
    potenciaHP: 1600,
    torqueNM: 1500,
    pesoKG: 1390,
    coeficienteAerodinamicoCd: 0.278,
    velocidadMaximaKMH: 500,
    propulsion: 'Combustion',
    traccion: 'RWD'
};

// --- CASO 1: Pruebas de Launch Control en Pista de Pruebas (Caso Normal) ---
const servicioNormal = new ServicioSimuladorHipercar();
const resumenNormal = servicioNormal.procesarSimulaciones([h1, h2, h3]);
mostrarResumenSimulador(resumenNormal, 'Caso Normal - Launch Control Telemetry');

// --- CASO 2: Falla Mecánica en Launch y Datos de Especificación Inválidos (Caso Límite) ---
const hipercarInvalido: EspecificacionesHipercar = {
    id: 'hyp-99',
    codigoVehiculo: 'ERR-HYPER',
    marca: 'Prototipo',
    modelo: 'Error specs',
    potenciaHP: 5000, // Fuera de rango (> 3000)
    torqueNM: -100,
    pesoKG: -500, // Peso negativo
    coeficienteAerodinamicoCd: 1.5,
    velocidadMaximaKMH: 800,
    propulsion: 'Hibrido',
    traccion: 'AWD'
};

const servicioLimite = new ServicioSimuladorHipercar();
const resumenLimite = servicioLimite.procesarSimulaciones([h1, hipercarInvalido, h2], 0); // Falla simulada en índice 0
mostrarResumenSimulador(resumenLimite, 'Caso Límite - Falla Mecánica y Especificaciones Inválidas');