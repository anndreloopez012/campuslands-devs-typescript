
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Promises)

export type CategoriaGaraje =
    | 'GranTurismo'
    | 'Superdeportivo'
    | 'Hiperdeportivo'
    | 'ClasicoEdicionEspecial';

export type EstadoVehiculoGaraje =
    | 'Almacenado'
    | 'EnMantenimiento'
    | 'EnExhibicion'
    | 'EnEnfriamiento'
    | 'EnTransito';

export interface EspecificacionesGaraje {
    readonly potenciaHP: number;
    readonly velocidadMaximaKMH: number;
    readonly valorEstimadoUSD: number;
    readonly costoMantenimientoAnualUSD: number;
}

export interface AutoGaraje {
    readonly id: string;
    readonly codigoVehiculo: string;
    readonly marca: string;
    readonly modelo: string;
    readonly anoFabricacion: number;
    readonly categoria: CategoriaGaraje;
    readonly estado: EstadoVehiculoGaraje;
    readonly numeroNaveGaraje: number;
    readonly especificaciones: EspecificacionesGaraje;
    readonly nivelBateriaOMantenimientoPct: number;
}

export interface GarajeLujoRaw {
    readonly id: string;
    readonly codigoGaraje: string;
    readonly nombreGaraje: string;
    readonly propietarioColeccionista: string;
    readonly capacidadMaximaVehiculos: number;
    readonly vehiculos: readonly AutoGaraje[];
}

export interface MetricasGarajeLujo {
    readonly totalVehiculosAlmacenados: number;
    readonly valorTotalColeccionUSD: number;
    readonly valorPromedioVehiculoUSD: number;
    readonly costoMantenimientoAnualTotalUSD: number;
    readonly porcentajeOcupacionGaraje: number;
    readonly vehiculoMasValioso: AutoGaraje | null;
    readonly vehiculoMasPotente: AutoGaraje | null;
    readonly desglosePorEstado: Readonly<Record<EstadoVehiculoGaraje, number>>;
    readonly desglosePorCategoria: Readonly<Record<CategoriaGaraje, number>>;
}

export interface ResumenGarajeLujo {
    readonly garajeId: string;
    readonly codigoGaraje: string;
    readonly nombreGaraje: string;
    readonly propietarioColeccionista: string;
    readonly totalVehiculosValidos: number;
    readonly metricas: MetricasGarajeLujo;
    readonly vehiculosProcesados: readonly AutoGaraje[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y GESTIÓN DE GARAJE (Generics & Encapsulamiento)

export class ContenedorGarajeLujo<T extends { readonly id: string; readonly codigoVehiculo: string }> {
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

export function validarEspecificacionesGaraje(
    specs: EspecificacionesGaraje,
    nombreModelo: string
): readonly string[] {
    const errores: string[] = [];

    if (specs.potenciaHP <= 0 || specs.potenciaHP > 3000) {
        errores.push(`Potencia fuera de rango (${specs.potenciaHP} HP) para "${nombreModelo}".`);
    }

    if (specs.velocidadMaximaKMH <= 0 || specs.velocidadMaximaKMH > 600) {
        errores.push(`Velocidad maxima invalida (${specs.velocidadMaximaKMH} km/h) en "${nombreModelo}".`);
    }

    if (specs.valorEstimadoUSD <= 0) {
        errores.push(`Valor estimado invalido ($${specs.valorEstimadoUSD} USD) para "${nombreModelo}".`);
    }

    if (specs.costoMantenimientoAnualUSD < 0) {
        errores.push(`Costo de mantenimiento negativo ($${specs.costoMantenimientoAnualUSD} USD) para "${nombreModelo}".`);
    }

    return errores;
}

export function validarAutoGaraje(auto: AutoGaraje): ResultadoValidacion<AutoGaraje> {
    const errores: string[] = [];

    const nombreCompleto = `${auto.marca} ${auto.modelo}`;

    if (auto.anoFabricacion < 1950 || auto.anoFabricacion > 2030) {
        errores.push(`Ano de fabricacion fuera de rango (${auto.anoFabricacion}) para "${nombreCompleto}".`);
    }

    if (auto.numeroNaveGaraje <= 0) {
        errores.push(`Numero de nave invalido (${auto.numeroNaveGaraje}) para "${nombreCompleto}".`);
    }

    if (auto.nivelBateriaOMantenimientoPct < 0 || auto.nivelBateriaOMantenimientoPct > 100) {
        errores.push(`Porcentaje de mantenimento/bateria fuera de rango (${auto.nivelBateriaOMantenimientoPct}%) en "${nombreCompleto}".`);
    }

    if (auto.marca.trim().length === 0 || auto.modelo.trim().length === 0) {
        errores.push(`El vehiculo con codigo "${auto.codigoVehiculo}" debe tener marca y modelo validos.`);
    }

    const erroresSpecs = validarEspecificacionesGaraje(auto.especificaciones, nombreCompleto);
    if (erroresSpecs.length > 0) {
        errores.push(...erroresSpecs);
    }

    return errores.length === 0
        ? { esValido: true, datos: auto }
        : { esValido: false, errores };
}

export async function validarGarajeRawAsync(
    garajeRaw: GarajeLujoRaw
): Promise<ResultadoValidacion<GarajeLujoRaw>> {
    // Simulacion de verificacion asincrona en el sistema de seguridad y clima del garaje
    await new Promise((resolve) => setTimeout(resolve, 15));

    const errores: string[] = [];

    if (garajeRaw.capacidadMaximaVehiculos <= 0) {
        errores.push(`Capacidad maxima del garaje invalida (${garajeRaw.capacidadMaximaVehiculos}) en "${garajeRaw.nombreGaraje}".`);
    }

    if (garajeRaw.vehiculos.length > garajeRaw.capacidadMaximaVehiculos) {
        errores.push(
            `Exceso de capacidad: El garaje "${garajeRaw.nombreGaraje}" alberga ${garajeRaw.vehiculos.length} vehiculos pero su limite es ${garajeRaw.capacidadMaximaVehiculos}.`
        );
    }

    if (garajeRaw.vehiculos.length === 0) {
        errores.push(`El garaje de lujo "${garajeRaw.nombreGaraje}" no registra vehiculos almacenados.`);
    }

    for (const auto of garajeRaw.vehiculos) {
        const resVal = validarAutoGaraje(auto);
        if (!resVal.esValido) {
            errores.push(...resVal.errores);
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: garajeRaw }
        : { esValido: false, errores };
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const CATEGORIAS_GARAJE: readonly CategoriaGaraje[] = [
    'GranTurismo',
    'Superdeportivo',
    'Hiperdeportivo',
    'ClasicoEdicionEspecial'
];

const ESTADOS_VEHICULO_GARAJE: readonly EstadoVehiculoGaraje[] = [
    'Almacenado',
    'EnMantenimiento',
    'EnExhibicion',
    'EnEnfriamiento',
    'EnTransito'
];

export function calcularMetricasGaraje(
    vehiculos: readonly AutoGaraje[],
    capacidadMaxima: number
): MetricasGarajeLujo {
    if (vehiculos.length === 0) {
        const desgloseEstadoVacio = ESTADOS_VEHICULO_GARAJE.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoVehiculoGaraje, number>);

        const desgloseCatVacio = CATEGORIAS_GARAJE.reduce((acc, c) => {
            acc[c] = 0;
            return acc;
        }, {} as Record<CategoriaGaraje, number>);

        return {
            totalVehiculosAlmacenados: 0,
            valorTotalColeccionUSD: 0,
            valorPromedioVehiculoUSD: 0,
            costoMantenimientoAnualTotalUSD: 0,
            porcentajeOcupacionGaraje: 0,
            vehiculoMasValioso: null,
            vehiculoMasPotente: null,
            desglosePorEstado: desgloseEstadoVacio,
            desglosePorCategoria: desgloseCatVacio
        };
    }

    const valorTotalColeccionUSD = Number(
        vehiculos.reduce((acc, v) => acc + v.especificaciones.valorEstimadoUSD, 0).toFixed(2)
    );

    const valorPromedioVehiculoUSD = Number((valorTotalColeccionUSD / vehiculos.length).toFixed(2));

    const costoMantenimientoAnualTotalUSD = Number(
        vehiculos.reduce((acc, v) => acc + v.especificaciones.costoMantenimientoAnualUSD, 0).toFixed(2)
    );

    const porcentajeOcupacionGaraje = capacidadMaxima > 0
        ? Number(((vehiculos.length / capacidadMaxima) * 100).toFixed(1))
        : 0;

    const vehiculoMasValioso = [...vehiculos].sort(
        (a, b) => b.especificaciones.valorEstimadoUSD - a.especificaciones.valorEstimadoUSD
    )[0] ?? null;

    const vehiculoMasPotente = [...vehiculos].sort(
        (a, b) => b.especificaciones.potenciaHP - a.especificaciones.potenciaHP
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorEstado = vehiculos.reduce((acc, v) => {
        acc[v.estado] = (acc[v.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_VEHICULO_GARAJE.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoVehiculoGaraje, number>));

    const desglosePorCategoria = vehiculos.reduce((acc, v) => {
        acc[v.categoria] = (acc[v.categoria] ?? 0) + 1;
        return acc;
    }, CATEGORIAS_GARAJE.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CategoriaGaraje, number>));

    return {
        totalVehiculosAlmacenados: vehiculos.length,
        valorTotalColeccionUSD,
        valorPromedioVehiculoUSD,
        costoMantenimientoAnualTotalUSD,
        porcentajeOcupacionGaraje,
        vehiculoMasValioso,
        vehiculoMasPotente,
        desglosePorEstado,
        desglosePorCategoria
    };
}

export class ServicioGestionGarajeLujo {
    private readonly contenedor = new ContenedorGarajeLujo<AutoGaraje>();

    public async procesarGarajeAsync(
        garajeRaw: GarajeLujoRaw
    ): Promise<ResumenGarajeLujo> {
        const advertencias: string[] = [];
        const valRes = await validarGarajeRawAsync(garajeRaw);

        if (!valRes.esValido) {
            advertencias.push(...valRes.errores);
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        for (const rawAuto of garajeRaw.vehiculos) {
            if (idsVistos.has(rawAuto.id)) {
                advertencias.push(`Vehiculo duplicado detectado por ID: ${rawAuto.id}.`);
            } else if (codigosVistos.has(rawAuto.codigoVehiculo)) {
                advertencias.push(`Codigo de vehiculo duplicado: ${rawAuto.codigoVehiculo}.`);
            } else {
                idsVistos.add(rawAuto.id);
                codigosVistos.add(rawAuto.codigoVehiculo);
                this.contenedor.agregar(rawAuto);
            }
        }

        const vehiculosValidos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasGaraje(vehiculosValidos, garajeRaw.capacidadMaximaVehiculos);

        const requiereCargaOBateria = vehiculosValidos.filter((v) => v.nivelBateriaOMantenimientoPct < 25);
        if (requiereCargaOBateria.length > 0) {
            advertencias.push(
                `Alerta de conservacion: Se detectaron ${requiereCargaOBateria.length} vehiculo(s) con nivel de bateria/mantenimiento bajo (< 25%).`
            );
        }

        return {
            garajeId: garajeRaw.id,
            codigoGaraje: garajeRaw.codigoGaraje,
            nombreGaraje: garajeRaw.nombreGaraje,
            propietarioColeccionista: garajeRaw.propietarioColeccionista,
            totalVehiculosValidos: vehiculosValidos.length,
            metricas,
            vehiculosProcesados: vehiculosValidos,
            advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenGarajeLujo(resumen: ResumenGarajeLujo, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` GARAJE DE LUJO Y HIPERDEPORTIVOS - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Nombre Garaje       : ${resumen.nombreGaraje}`);
    console.log(`Propietario         : ${resumen.propietarioColeccionista}`);
    console.log(`Vehiculos Validados : ${resumen.totalVehiculosValidos}`);
    console.log(`Valor Coleccion     : $${resumen.metricas.valorTotalColeccionUSD.toLocaleString()} USD`);
    console.log(`Valor Prom. / Auto  : $${resumen.metricas.valorPromedioVehiculoUSD.toLocaleString()} USD`);
    console.log(`Mantenimiento Anual : $${resumen.metricas.costoMantenimientoAnualTotalUSD.toLocaleString()} USD`);
    console.log(`Ocupacion del Garaje: ${resumen.metricas.porcentajeOcupacionGaraje}% de capacidad`);
    console.log(`Auto Mas Valioso    : ${resumen.metricas.vehiculoMasValioso ? `${resumen.metricas.vehiculoMasValioso.marca} ${resumen.metricas.vehiculoMasValioso.modelo} ($${resumen.metricas.vehiculoMasValioso.especificaciones.valorEstimadoUSD.toLocaleString()} USD)` : 'N/A'}`);
    console.log(`Auto Mas Potente    : ${resumen.metricas.vehiculoMasPotente ? `${resumen.metricas.vehiculoMasPotente.marca} ${resumen.metricas.vehiculoMasPotente.modelo} (${resumen.metricas.vehiculoMasPotente.especificaciones.potenciaHP} HP)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE SEGURIDAD Y MANTENIMIENTO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR ESTADO DE ALMACENAMIENTO:`);
    Object.entries(resumen.metricas.desglosePorEstado).forEach(([estado, cantidad]) => {
        console.log(`   - ${estado.padEnd(18)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.vehiculosProcesados.map((v) => ({
            Nave: `Nave ${v.numeroNaveGaraje}`,
            Codigo: v.codigoVehiculo,
            Vehiculo: `${v.marca} ${v.modelo}`,
            Ano: v.anoFabricacion,
            Categoria: v.categoria,
            Estado: v.estado,
            Potencia: `${v.especificaciones.potenciaHP} HP`,
            Valor: `$${v.especificaciones.valorEstimadoUSD.toLocaleString()} USD`,
            'Conservacion': `${v.nivelBateriaOMantenimientoPct}%`
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const g1: AutoGaraje = {
    id: 'gar-01',
    codigoVehiculo: 'BUG-BOLIDE-01',
    marca: 'Bugatti',
    modelo: 'Bolide Track Edition',
    anoFabricacion: 2024,
    categoria: 'Hiperdeportivo',
    estado: 'Almacenado',
    numeroNaveGaraje: 1,
    especificaciones: {
        potenciaHP: 1825,
        velocidadMaximaKMH: 501,
        valorEstimadoUSD: 4400000,
        costoMantenimientoAnualUSD: 120000
    },
    nivelBateriaOMantenimientoPct: 95
};

const g2: AutoGaraje = {
    id: 'gar-02',
    codigoVehiculo: 'KOE-JESKO-02',
    marca: 'Koenigsegg',
    modelo: 'Jesko Attack',
    anoFabricacion: 2025,
    categoria: 'Hiperdeportivo',
    estado: 'EnExhibicion',
    numeroNaveGaraje: 2,
    especificaciones: {
        potenciaHP: 1600,
        velocidadMaximaKMH: 482,
        valorEstimadoUSD: 3400000,
        costoMantenimientoAnualUSD: 95000
    },
    nivelBateriaOMantenimientoPct: 88
};

const g3: AutoGaraje = {
    id: 'gar-03',
    codigoVehiculo: 'PAG-UTOPIA-03',
    marca: 'Pagani',
    modelo: 'Utopia V12',
    anoFabricacion: 2026,
    categoria: 'Hiperdeportivo',
    estado: 'Almacenado',
    numeroNaveGaraje: 3,
    especificaciones: {
        potenciaHP: 864,
        velocidadMaximaKMH: 370,
        valorEstimadoUSD: 2500000,
        costoMantenimientoAnualUSD: 65000
    },
    nivelBateriaOMantenimientoPct: 18 // Bateria baja -> Alerta de conservacion
};

// --- CASO 1: Garaje Privado de Hiperdeportivos (Caso Normal) ---
const garajeNormal: GarajeLujoRaw = {
    id: 'GAR-APEX-01',
    codigoGaraje: 'GAR-APEX-SANCTUARY',
    nombreGaraje: 'Apex Sanctuary Private Vault',
    propietarioColeccionista: 'José Rodríguez Samcam',
    capacidadMaximaVehiculos: 5,
    vehiculos: [g1, g2, g3]
};

// --- CASO 2: Exceso de Capacidad, Valores Negativos y Registro Duplicado (Caso Límite) ---
const autoCorrupto: AutoGaraje = {
    id: 'gar-99',
    codigoVehiculo: 'GAR-ERR-999',
    marca: 'Marca Desconocida',
    modelo: 'Prototipo Danado',
    anoFabricacion: 1940, // Ano anterior a 1950 -> Invalido
    categoria: 'Superdeportivo',
    estado: 'EnMantenimiento',
    numeroNaveGaraje: -1, // Nave negativa -> Invalido
    especificaciones: {
        potenciaHP: -500, // Potencia negativa -> Invalido
        velocidadMaximaKMH: -100, // Velocidad negativa -> Invalido
        valorEstimadoUSD: -1000000, // Valor negativo -> Invalido
        costoMantenimientoAnualUSD: -50000
    },
    nivelBateriaOMantenimientoPct: 150 // Porcentaje > 100% -> Invalido
};

const garajeLimiteCorrupto: GarajeLujoRaw = {
    id: 'GAR-FAIL-02',
    codigoGaraje: 'GAR-FAIL-02',
    nombreGaraje: 'Garaje Con Exceso de Capacidad y Errores',
    propietarioColeccionista: 'Coleccionista Anonimo',
    capacidadMaximaVehiculos: 2, // Capacidad 2 pero se envian 3 elementos -> Exceso de capacidad
    vehiculos: [
        g1,
        autoCorrupto,
        g1 // Vehiculo duplicado
    ]
};

async function ejecutarPruebas(): Promise<void> {
    const servicio = new ServicioGestionGarajeLujo();

    // Ejecución Caso 1
    const resumenNormal = await servicio.procesarGarajeAsync(garajeNormal);
    mostrarResumenGarajeLujo(resumenNormal, 'Caso Normal - Apex Sanctuary Vault');

    // Ejecución Caso 2
    const resumenLimite = await servicio.procesarGarajeAsync(garajeLimiteCorrupto);
    mostrarResumenGarajeLujo(resumenLimite, 'Caso Limite - Exceso de Capacidad y Datos Corruptos');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecucion:', err));