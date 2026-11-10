
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Promises)

export type TipoSensorMoto =
    | 'TemperaturaMotor'
    | 'PresionAceite'
    | 'VelocidadRPM'
    | 'NivelCombustible'
    | 'VoltajeBateria'
    | 'PresionNeumaticos';

export type EstadoSensor =
    | 'Normal'
    | 'Advertencia'
    | 'Critico'
    | 'FalloSensor';

export type UnidadMedida =
    | 'Celsius'
    | 'PSI'
    | 'RPM'
    | 'Porcentaje'
    | 'Voltios'
    | 'Bar';

export interface LecturaSensor {
    readonly id: string;
    readonly codigoSensor: string;
    readonly nombreSensor: string;
    readonly tipo: TipoSensorMoto;
    readonly valorMedido: number;
    readonly unidad: UnidadMedida;
    readonly umbralMinimo: number;
    readonly umbralMaximo: number;
    readonly estado: EstadoSensor;
    readonly timestamp: string;
}

export interface TelemetriaMotoRaw {
    readonly id: string;
    readonly codigoMoto: string;
    readonly modeloMoto: string;
    readonly kilometrajeTotalKM: number;
    readonly lecturas: readonly LecturaSensor[];
}

export interface MetricasPanelSensores {
    readonly totalSensores: number;
    readonly sensoresNormalesCount: number;
    readonly sensoresAdvertenciaCount: number;
    readonly sensoresCriticosCount: number;
    readonly porcentajeSaludPanel: number;
    readonly sensorMasCritico: LecturaSensor | null;
    readonly desglosePorTipo: Readonly<Record<TipoSensorMoto, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoSensor, number>>;
}

export interface ResumenPanelSensores {
    readonly telemetriaId: string;
    readonly codigoMoto: string;
    readonly modeloMoto: string;
    readonly kilometrajeTotalKM: number;
    readonly totalSensoresValidos: number;
    readonly metricas: MetricasPanelSensores;
    readonly lecturasProcesadas: readonly LecturaSensor[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y GESTIÓN DE TELEMETRÍA (Generics & Encapsulamiento)

export class ContenedorSensores<T extends { readonly id: string; readonly codigoSensor: string }> {
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

// 3. VALIDACIONES Y REGLAS DE NEGOCIO (Async/Promise support)

export function evaluarEstadoSensor(lectura: LecturaSensor): EstadoSensor {
    if (lectura.valorMedido < 0 && lectura.tipo !== 'TemperaturaMotor') {
        return 'FalloSensor';
    }

    if (lectura.valorMedido > lectura.umbralMaximo * 1.25 || lectura.valorMedido < lectura.umbralMinimo * 0.5) {
        return 'Critico';
    }

    if (lectura.valorMedido > lectura.umbralMaximo || lectura.valorMedido < lectura.umbralMinimo) {
        return 'Advertencia';
    }

    return 'Normal';
}

export function validarLecturaSensor(lectura: LecturaSensor): ResultadoValidacion<LecturaSensor> {
    const errores: string[] = [];

    if (lectura.umbralMinimo >= lectura.umbralMaximo) {
        errores.push(
            `Inconsistencia de umbrales en "${lectura.nombreSensor}": Umbral minimo (${lectura.umbralMinimo}) debe ser menor al maximo (${lectura.umbralMaximo}).`
        );
    }

    if (lectura.nombreSensor.trim().length === 0) {
        errores.push(`El sensor con codigo "${lectura.codigoSensor}" debe tener un nombre valido.`);
    }

    if (lectura.codigoSensor.trim().length === 0) {
        errores.push('El sensor debe incluir un codigo identificador valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: lectura }
        : { esValido: false, errores };
}

export async function validarTelemetriaAsync(
    telemetria: TelemetriaMotoRaw
): Promise<ResultadoValidacion<TelemetriaMotoRaw>> {
    // Simulacion de lectura asincrona de bus CAN y ECU de la motocicleta
    await new Promise((resolve) => setTimeout(resolve, 15));

    const errores: string[] = [];

    if (telemetria.kilometrajeTotalKM < 0) {
        errores.push(`Kilometraje negativo (${telemetria.kilometrajeTotalKM} km) en la motocicleta.`);
    }

    if (telemetria.lecturas.length === 0) {
        errores.push(`La telemetria de la moto "${telemetria.modeloMoto}" no registra lecturas de sensores.`);
    }

    for (const lec of telemetria.lecturas) {
        const resVal = validarLecturaSensor(lec);
        if (!resVal.esValido) {
            errores.push(...resVal.errores);
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: telemetria }
        : { esValido: false, errores };
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const TIPOS_SENSOR: readonly TipoSensorMoto[] = [
    'TemperaturaMotor',
    'PresionAceite',
    'VelocidadRPM',
    'NivelCombustible',
    'VoltajeBateria',
    'PresionNeumaticos'
];

const ESTADOS_SENSOR: readonly EstadoSensor[] = [
    'Normal',
    'Advertencia',
    'Critico',
    'FalloSensor'
];

export function calcularMetricasPanel(lecturas: readonly LecturaSensor[]): MetricasPanelSensores {
    if (lecturas.length === 0) {
        const desgloseTipoVacio = TIPOS_SENSOR.reduce((acc, t) => {
            acc[t] = 0;
            return acc;
        }, {} as Record<TipoSensorMoto, number>);

        const desgloseEstadoVacio = ESTADOS_SENSOR.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoSensor, number>);

        return {
            totalSensores: 0,
            sensoresNormalesCount: 0,
            sensoresAdvertenciaCount: 0,
            sensoresCriticosCount: 0,
            porcentajeSaludPanel: 0,
            sensorMasCritico: null,
            desglosePorTipo: desgloseTipoVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const normales = lecturas.filter((l) => l.estado === 'Normal');
    const advertencias = lecturas.filter((l) => l.estado === 'Advertencia');
    const criticos = lecturas.filter((l) => l.estado === 'Critico' || l.estado === 'FalloSensor');

    const porcentajeSaludPanel = Number(((normales.length / lecturas.length) * 100).toFixed(1));

    const sensorMasCritico = [...lecturas].sort((a, b) => {
        const pesoEstado = (e: EstadoSensor) => (e === 'Critico' ? 4 : e === 'FalloSensor' ? 3 : e === 'Advertencia' ? 2 : 1);
        return pesoEstado(b.estado) - pesoEstado(a.estado);
    })[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorTipo = lecturas.reduce((acc, l) => {
        acc[l.tipo] = (acc[l.tipo] ?? 0) + 1;
        return acc;
    }, TIPOS_SENSOR.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoSensorMoto, number>));

    const desglosePorEstado = lecturas.reduce((acc, l) => {
        acc[l.estado] = (acc[l.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_SENSOR.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoSensor, number>));

    return {
        totalSensores: lecturas.length,
        sensoresNormalesCount: normales.length,
        sensoresAdvertenciaCount: advertencias.length,
        sensoresCriticosCount: criticos.length,
        porcentajeSaludPanel,
        sensorMasCritico,
        desglosePorTipo,
        desglosePorEstado
    };
}

export class ServicioPanelDOMSensoresMoto {
    private readonly contenedor = new ContenedorSensores<LecturaSensor>();

    public async procesarTelemetriaAsync(
        telemetriaRaw: TelemetriaMotoRaw
    ): Promise<ResumenPanelSensores> {
        const advertencias: string[] = [];
        const valRes = await validarTelemetriaAsync(telemetriaRaw);

        if (!valRes.esValido) {
            advertencias.push(...valRes.errores);
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        for (const rawLec of telemetriaRaw.lecturas) {
            if (idsVistos.has(rawLec.id)) {
                advertencias.push(`Lectura duplicada detectada por ID: ${rawLec.id}.`);
            } else if (codigosVistos.has(rawLec.codigoSensor)) {
                advertencias.push(`Codigo de sensor duplicado: ${rawLec.codigoSensor}.`);
            } else {
                idsVistos.add(rawLec.id);
                codigosVistos.add(rawLec.codigoSensor);

                const estadoCalculado = evaluarEstadoSensor(rawLec);
                const lecturaProcesada: LecturaSensor = {
                    ...rawLec,
                    estado: estadoCalculado
                };
                this.contenedor.agregar(lecturaProcesada);
            }
        }

        const lecturasValidas = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasPanel(lecturasValidas);

        if (metricas.sensoresCriticosCount > 0) {
            advertencias.push(
                `Alerta mecanica: Se detectaron ${metricas.sensoresCriticosCount} sensor(es) en estado Critico o Fallo.`
            );
        }

        return {
            telemetriaId: telemetriaRaw.id,
            codigoMoto: telemetriaRaw.codigoMoto,
            modeloMoto: telemetriaRaw.modeloMoto,
            kilometrajeTotalKM: telemetriaRaw.kilometrajeTotalKM,
            totalSensoresValidos: lecturasValidas.length,
            metricas,
            lecturasProcesadas: lecturasValidas,
            advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenPanelDOM(resumen: ResumenPanelSensores, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` PANEL DOM DE SENSORES MOTO - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Modelo Motocicleta  : ${resumen.modeloMoto}`);
    console.log(`Codigo Vehiculo     : ${resumen.codigoMoto}`);
    console.log(`Kilometraje Total   : ${resumen.kilometrajeTotalKM.toLocaleString()} km`);
    console.log(`Sensores Monitoreados: ${resumen.totalSensoresValidos}`);
    console.log(`Salud del Panel     : ${resumen.metricas.sensoresNormalesCount} de ${resumen.metricas.totalSensores} (${resumen.metricas.porcentajeSaludPanel}%)`);
    console.log(`Sensores Advertencia: ${resumen.metricas.sensoresAdvertenciaCount}`);
    console.log(`Sensores Criticos   : ${resumen.metricas.sensoresCriticosCount}`);
    console.log(`Sensor Mas Critico  : ${resumen.metricas.sensorMasCritico ? `"${resumen.metricas.sensorMasCritico.nombreSensor}" (${resumen.metricas.sensorMasCritico.valorMedido} ${resumen.metricas.sensorMasCritico.unidad} - ${resumen.metricas.sensorMasCritico.estado})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE PANEL / ECU (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE SENSORES POR TIPO DE MEDICION:`);
    Object.entries(resumen.metricas.desglosePorTipo).forEach(([tipo, cantidad]) => {
        console.log(`   - ${tipo.padEnd(20)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.lecturasProcesadas.map((l) => ({
            Codigo: l.codigoSensor,
            Sensor: l.nombreSensor,
            Tipo: l.tipo,
            Valor: `${l.valorMedido} ${l.unidad}`,
            'Rango Normal': `${l.umbralMinimo} - ${l.umbralMaximo}`,
            Estado: l.estado
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const l1: LecturaSensor = {
    id: 'sen-01',
    codigoSensor: 'TEMP-ENG-01',
    nombreSensor: 'Temperatura de Aceite Motor',
    tipo: 'TemperaturaMotor',
    valorMedido: 92.5,
    unidad: 'Celsius',
    umbralMinimo: 70.0,
    umbralMaximo: 110.0,
    estado: 'Normal',
    timestamp: '2026-11-09T18:00:00Z'
};

const l2: LecturaSensor = {
    id: 'sen-02',
    codigoSensor: 'PRESS-OIL-02',
    nombreSensor: 'Presion de Aceite Principal',
    tipo: 'PresionAceite',
    valorMedido: 42.0,
    unidad: 'PSI',
    umbralMinimo: 30.0,
    umbralMaximo: 60.0,
    estado: 'Normal',
    timestamp: '2026-11-09T18:00:00Z'
};

const l3: LecturaSensor = {
    id: 'sen-03',
    codigoSensor: 'VOLT-BAT-03',
    nombreSensor: 'Voltaje de Bateria LiFePO4',
    tipo: 'VoltajeBateria',
    valorMedido: 13.8,
    unidad: 'Voltios',
    umbralMinimo: 12.4,
    umbralMaximo: 14.6,
    estado: 'Normal',
    timestamp: '2026-11-09T18:00:00Z'
};

// --- CASO 1: Telemetría de Motocicleta Superbike en Rendimiento Normal (Caso Normal) ---
const telemetriaNormal: TelemetriaMotoRaw = {
    id: 'TEL-DUCATI-2026',
    codigoMoto: 'MOTO-SBK-1199',
    modeloMoto: 'Ducati Panigale V4 S',
    kilometrajeTotalKM: 12450,
    lecturas: [l1, l2, l3]
};

// --- CASO 2: Sobrecalentamiento Crítico, Umbrales Inconsistentes y Sensor Duplicado (Caso Límite) ---
const lecturaSobrecalentamiento: LecturaSensor = {
    id: 'sen-99',
    codigoSensor: 'TEMP-CRIT-999',
    nombreSensor: 'Sensor Temperatura Culata',
    tipo: 'TemperaturaMotor',
    valorMedido: 145.0, // 145 C > 110 C max -> Estado Critico
    unidad: 'Celsius',
    umbralMinimo: 70.0,
    umbralMaximo: 110.0,
    estado: 'Normal',
    timestamp: '2026-11-09T18:05:00Z'
};

const lecturaInvalida: LecturaSensor = {
    id: 'sen-98',
    codigoSensor: 'PRESS-TIRE-ERR',
    nombreSensor: 'Sensor Presion Neumatico Trasero',
    tipo: 'PresionNeumaticos',
    valorMedido: 32.0,
    unidad: 'PSI',
    umbralMinimo: 50.0, // Umbral Min (50) > Umbral Max (40) -> Inconsistencia de validacion
    umbralMaximo: 40.0,
    estado: 'Normal',
    timestamp: '2026-11-09T18:05:00Z'
};

const telemetriaLimiteCorrupta: TelemetriaMotoRaw = {
    id: 'TEL-FAIL-02',
    codigoMoto: 'MOTO-FAIL-02',
    modeloMoto: 'Motocicleta Con Sobrecalentamiento y Sensor Corrupto',
    kilometrajeTotalKM: 45000,
    lecturas: [
        l1,
        lecturaSobrecalentamiento,
        lecturaInvalida,
        l1 // Lectura duplicada
    ]
};

async function ejecutarPruebas(): Promise<void> {
    const servicio = new ServicioPanelDOMSensoresMoto();

    // Ejecución Caso 1
    const resumenNormal = await servicio.procesarTelemetriaAsync(telemetriaNormal);
    mostrarResumenPanelDOM(resumenNormal, 'Caso Normal - Ducati Panigale V4 S');

    // Ejecución Caso 2
    const resumenLimite = await servicio.procesarTelemetriaAsync(telemetriaLimiteCorrupta);
    mostrarResumenPanelDOM(resumenLimite, 'Caso Limite - Sobrecalentamiento Critico y Umbrales Erroneos');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecucion:', err));