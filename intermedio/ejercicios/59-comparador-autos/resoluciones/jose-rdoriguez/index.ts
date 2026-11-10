
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Promises)

export type CategoriaAuto =
    | 'GranTurismo'
    | 'Superdeportivo'
    | 'Hiperdeportivo'
    | 'SUVLujo';

export type TipoPropulsion =
    | 'CombustionV8'
    | 'CombustionV12'
    | 'CombustionW16'
    | 'HibridoPlugIn'
    | '100PorCientoElectrico';

export interface EspecificacionesTecnicas {
    readonly potenciaHP: number;
    readonly torqueNM: number;
    readonly aceleracion0a100Sec: number;
    readonly velocidadMaximaKMH: number;
    readonly pesoKG: number;
    readonly precioBaseUSD: number;
}

export interface AutoPremium {
    readonly id: string;
    readonly codigoAuto: string;
    readonly marca: string;
    readonly modelo: string;
    readonly anoFabricacion: number;
    readonly categoria: CategoriaAuto;
    readonly propulsion: TipoPropulsion;
    readonly especificaciones: EspecificacionesTecnicas;
    readonly produccionLimitadaUnidades: number;
}

export interface ComparativaAutosRaw {
    readonly id: string;
    readonly tituloComparativa: string;
    readonly autorAnalista: string;
    readonly autos: readonly AutoPremium[];
}

export interface MetricasComparativaAutos {
    readonly totalAutosComparados: number;
    readonly potenciaPromedioHP: number;
    readonly velocidadMaximaPromedioKMH: number;
    readonly precioPromedioUSD: number;
    readonly relacionPotenciaPesoPromedioHPporTon: number;
    readonly autoMasRapido: AutoPremium | null;
    readonly autoMasPotente: AutoPremium | null;
    readonly autoMasCaro: AutoPremium | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaAuto, number>>;
    readonly desglosePorPropulsion: Readonly<Record<TipoPropulsion, number>>;
}

export interface ResumenComparativaAutos {
    readonly comparativaId: string;
    readonly tituloComparativa: string;
    readonly autorAnalista: string;
    readonly totalAutosValidos: number;
    readonly metricas: MetricasComparativaAutos;
    readonly autosProcesados: readonly AutoPremium[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y GESTIÓN DE AUTOS (Generics & Encapsulamiento)

export class ContenedorAutosPremium<T extends { readonly id: string; readonly codigoAuto: string }> {
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

export function calcularRelacionPotenciaPeso(potenciaHP: number, pesoKG: number): number {
    if (pesoKG <= 0) return 0;
    return Number(((potenciaHP / pesoKG) * 1000).toFixed(1)); // HP por Tonelada
}

export function validarEspecificaciones(
    specs: EspecificacionesTecnicas,
    nombreModelo: string
): readonly string[] {
    const errores: string[] = [];

    if (specs.potenciaHP <= 0 || specs.potenciaHP > 3000) {
        errores.push(`Potencia fuera de rango (${specs.potenciaHP} HP) para "${nombreModelo}".`);
    }

    if (specs.aceleracion0a100Sec <= 0 || specs.aceleracion0a100Sec > 15) {
        errores.push(`Aceleracion de 0 a 100 km/h invalida (${specs.aceleracion0a100Sec} s) en "${nombreModelo}".`);
    }

    if (specs.velocidadMaximaKMH <= 0 || specs.velocidadMaximaKMH > 600) {
        errores.push(`Velocidad maxima invalida (${specs.velocidadMaximaKMH} km/h) en "${nombreModelo}".`);
    }

    if (specs.pesoKG <= 0 || specs.pesoKG > 5000) {
        errores.push(`Peso invalido (${specs.pesoKG} kg) para "${nombreModelo}".`);
    }

    if (specs.precioBaseUSD <= 0) {
        errores.push(`Precio base invalido ($${specs.precioBaseUSD} USD) para "${nombreModelo}".`);
    }

    return errores;
}

export function validarAutoPremium(auto: AutoPremium): ResultadoValidacion<AutoPremium> {
    const errores: string[] = [];

    const nombreCompleto = `${auto.marca} ${auto.modelo}`;

    if (auto.anoFabricacion < 1990 || auto.anoFabricacion > 2030) {
        errores.push(`Ano de fabricacion fuera de rango (${auto.anoFabricacion}) para "${nombreCompleto}".`);
    }

    if (auto.produccionLimitadaUnidades < 0) {
        errores.push(`Cantidad de produccion limitada negativa (${auto.produccionLimitadaUnidades}) en "${nombreCompleto}".`);
    }

    if (auto.marca.trim().length === 0 || auto.modelo.trim().length === 0) {
        errores.push(`El vehiculo con codigo "${auto.codigoAuto}" debe tener marca y modelo validos.`);
    }

    const erroresSpecs = validarEspecificaciones(auto.especificaciones, nombreCompleto);
    if (erroresSpecs.length > 0) {
        errores.push(...erroresSpecs);
    }

    return errores.length === 0
        ? { esValido: true, datos: auto }
        : { esValido: false, errores };
}

export async function validarComparativaRawAsync(
    comparativaRaw: ComparativaAutosRaw
): Promise<ResultadoValidacion<ComparativaAutosRaw>> {
    // Simulacion de consulta asincrona a la base de datos de homologacion de superdeportivos
    await new Promise((resolve) => setTimeout(resolve, 15));

    const errores: string[] = [];

    if (comparativaRaw.autos.length === 0) {
        errores.push(`La comparativa "${comparativaRaw.tituloComparativa}" no contiene vehiculos registrados.`);
    }

    for (const auto of comparativaRaw.autos) {
        const resVal = validarAutoPremium(auto);
        if (!resVal.esValido) {
            errores.push(...resVal.errores);
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: comparativaRaw }
        : { esValido: false, errores };
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const CATEGORIAS_AUTO: readonly CategoriaAuto[] = [
    'GranTurismo',
    'Superdeportivo',
    'Hiperdeportivo',
    'SUVLujo'
];

const TIPOS_PROPULSION: readonly TipoPropulsion[] = [
    'CombustionV8',
    'CombustionV12',
    'CombustionW16',
    'HibridoPlugIn',
    '100PorCientoElectrico'
];

export function calcularMetricasComparativa(autos: readonly AutoPremium[]): MetricasComparativaAutos {
    if (autos.length === 0) {
        const desgloseCatVacio = CATEGORIAS_AUTO.reduce((acc, c) => {
            acc[c] = 0;
            return acc;
        }, {} as Record<CategoriaAuto, number>);

        const desglosePropVacio = TIPOS_PROPULSION.reduce((acc, p) => {
            acc[p] = 0;
            return acc;
        }, {} as Record<TipoPropulsion, number>);

        return {
            totalAutosComparados: 0,
            potenciaPromedioHP: 0,
            velocidadMaximaPromedioKMH: 0,
            precioPromedioUSD: 0,
            relacionPotenciaPesoPromedioHPporTon: 0,
            autoMasRapido: null,
            autoMasPotente: null,
            autoMasCaro: null,
            desglosePorCategoria: desgloseCatVacio,
            desglosePorPropulsion: desglosePropVacio
        };
    }

    const sumaPotencia = autos.reduce((acc, a) => acc + a.especificaciones.potenciaHP, 0);
    const potenciaPromedioHP = Math.round(sumaPotencia / autos.length);

    const sumaVelocidad = autos.reduce((acc, a) => acc + a.especificaciones.velocidadMaximaKMH, 0);
    const velocidadMaximaPromedioKMH = Math.round(sumaVelocidad / autos.length);

    const sumaPrecio = autos.reduce((acc, a) => acc + a.especificaciones.precioBaseUSD, 0);
    const precioPromedioUSD = Number((sumaPrecio / autos.length).toFixed(2));

    const sumaRelacionPotenciaPeso = autos.reduce(
        (acc, a) => acc + calcularRelacionPotenciaPeso(a.especificaciones.potenciaHP, a.especificaciones.pesoKG),
        0
    );
    const relacionPotenciaPesoPromedioHPporTon = Number((sumaRelacionPotenciaPeso / autos.length).toFixed(1));

    const autoMasRapido = [...autos].sort(
        (a, b) => b.especificaciones.velocidadMaximaKMH - a.especificaciones.velocidadMaximaKMH
    )[0] ?? null;

    const autoMasPotente = [...autos].sort(
        (a, b) => b.especificaciones.potenciaHP - a.especificaciones.potenciaHP
    )[0] ?? null;

    const autoMasCaro = [...autos].sort(
        (a, b) => b.especificaciones.precioBaseUSD - a.especificaciones.precioBaseUSD
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorCategoria = autos.reduce((acc, a) => {
        acc[a.categoria] = (acc[a.categoria] ?? 0) + 1;
        return acc;
    }, CATEGORIAS_AUTO.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CategoriaAuto, number>));

    const desglosePorPropulsion = autos.reduce((acc, a) => {
        acc[a.propulsion] = (acc[a.propulsion] ?? 0) + 1;
        return acc;
    }, TIPOS_PROPULSION.reduce((acc, p) => ({ ...acc, [p]: 0 }), {} as Record<TipoPropulsion, number>));

    return {
        totalAutosComparados: autos.length,
        potenciaPromedioHP,
        velocidadMaximaPromedioKMH,
        precioPromedioUSD,
        relacionPotenciaPesoPromedioHPporTon,
        autoMasRapido,
        autoMasPotente,
        autoMasCaro,
        desglosePorCategoria,
        desglosePorPropulsion
    };
}

export class ServicioComparadorAutosPremium {
    private readonly contenedor = new ContenedorAutosPremium<AutoPremium>();

    public async procesarComparativaAsync(
        comparativaRaw: ComparativaAutosRaw
    ): Promise<ResumenComparativaAutos> {
        const advertencias: string[] = [];
        const valRes = await validarComparativaRawAsync(comparativaRaw);

        if (!valRes.esValido) {
            advertencias.push(...valRes.errores);
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        for (const rawAuto of comparativaRaw.autos) {
            if (idsVistos.has(rawAuto.id)) {
                advertencias.push(`Vehiculo duplicado detectado por ID: ${rawAuto.id}.`);
            } else if (codigosVistos.has(rawAuto.codigoAuto)) {
                advertencias.push(`Codigo de vehiculo duplicado: ${rawAuto.codigoAuto}.`);
            } else {
                idsVistos.add(rawAuto.id);
                codigosVistos.add(rawAuto.codigoAuto);
                this.contenedor.agregar(rawAuto);
            }
        }

        const autosValidos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasComparativa(autosValidos);

        const hipercars = autosValidos.filter((a) => a.categoria === 'Hiperdeportivo');
        if (hipercars.length > 0) {
            advertencias.push(
                `Nota de segmento: Se incluyeron ${hipercars.length} hiperdeportivos de edicion limitada en la comparativa.`
            );
        }

        return {
            comparativaId: comparativaRaw.id,
            tituloComparativa: comparativaRaw.tituloComparativa,
            autorAnalista: comparativaRaw.autorAnalista,
            totalAutosValidos: autosValidos.length,
            metricas,
            autosProcesados: autosValidos,
            advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenComparativa(resumen: ResumenComparativaAutos, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` COMPARADOR DE AUTOS PREMIUM - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Titulo Comparativa  : ${resumen.tituloComparativa}`);
    console.log(`Analista Responsable: ${resumen.autorAnalista}`);
    console.log(`Vehiculos Validados : ${resumen.totalAutosValidos}`);
    console.log(`Potencia Promedio   : ${resumen.metricas.potenciaPromedioHP} HP`);
    console.log(`Velocidad Promedio  : ${resumen.metricas.velocidadMaximaPromedioKMH} km/h`);
    console.log(`Precio Promedio     : $${resumen.metricas.precioPromedioUSD.toLocaleString()} USD`);
    console.log(`Relacion Pot./Peso  : ${resumen.metricas.relacionPotenciaPesoPromedioHPporTon} HP / Tonelada`);
    console.log(`Auto Mas Rapido     : ${resumen.metricas.autoMasRapido ? `${resumen.metricas.autoMasRapido.marca} ${resumen.metricas.autoMasRapido.modelo} (${resumen.metricas.autoMasRapido.especificaciones.velocidadMaximaKMH} km/h)` : 'N/A'}`);
    console.log(`Auto Mas Potente    : ${resumen.metricas.autoMasPotente ? `${resumen.metricas.autoMasPotente.marca} ${resumen.metricas.autoMasPotente.modelo} (${resumen.metricas.autoMasPotente.especificaciones.potenciaHP} HP)` : 'N/A'}`);
    console.log(`Auto Mas Costoso    : ${resumen.metricas.autoMasCaro ? `${resumen.metricas.autoMasCaro.marca} ${resumen.metricas.autoMasCaro.modelo} ($${resumen.metricas.autoMasCaro.especificaciones.precioBaseUSD.toLocaleString()} USD)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE ANALISIS (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR CATEGORIA DE VEHÍCULO:`);
    Object.entries(resumen.metricas.desglosePorCategoria).forEach(([cat, cantidad]) => {
        console.log(`   - ${cat.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.autosProcesados.map((a) => ({
            Codigo: a.codigoAuto,
            Vehiculo: `${a.marca} ${a.modelo}`,
            Ano: a.anoFabricacion,
            Categoria: a.categoria,
            Propulsion: a.propulsion,
            Potencia: `${a.especificaciones.potenciaHP} HP`,
            '0-100 km/h': `${a.especificaciones.aceleracion0a100Sec} s`,
            'Vel. Max': `${a.especificaciones.velocidadMaximaKMH} km/h`,
            'HP/Ton': calcularRelacionPotenciaPeso(a.especificaciones.potenciaHP, a.especificaciones.pesoKG),
            Precio: `$${a.especificaciones.precioBaseUSD.toLocaleString()} USD`
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const a1: AutoPremium = {
    id: 'car-01',
    codigoAuto: 'CAR-BUG-CHIRON',
    marca: 'Bugatti',
    modelo: 'Chiron Super Sport 300+',
    anoFabricacion: 2024,
    categoria: 'Hiperdeportivo',
    propulsion: 'CombustionW16',
    especificaciones: {
        potenciaHP: 1600,
        torqueNM: 1600,
        aceleracion0a100Sec: 2.4,
        velocidadMaximaKMH: 490,
        pesoKG: 1975,
        precioBaseUSD: 3900000
    },
    produccionLimitadaUnidades: 30
};

const a2: AutoPremium = {
    id: 'car-02',
    codigoAuto: 'CAR-FER-SF90',
    marca: 'Ferrari',
    modelo: 'SF90 XX Stradale',
    anoFabricacion: 2025,
    categoria: 'Superdeportivo',
    propulsion: 'HibridoPlugIn',
    especificaciones: {
        potenciaHP: 1030,
        torqueNM: 804,
        aceleracion0a100Sec: 2.3,
        velocidadMaximaKMH: 340,
        pesoKG: 1560,
        precioBaseUSD: 890000
    },
    produccionLimitadaUnidades: 799
};

const a3: AutoPremium = {
    id: 'car-03',
    codigoAuto: 'CAR-RIM-NEVERA',
    marca: 'Rimac',
    modelo: 'Nevera R',
    anoFabricacion: 2026,
    categoria: 'Hiperdeportivo',
    propulsion: '100PorCientoElectrico',
    especificaciones: {
        potenciaHP: 2107,
        torqueNM: 2360,
        aceleracion0a100Sec: 1.81,
        velocidadMaximaKMH: 412,
        pesoKG: 2277,
        precioBaseUSD: 2500000
    },
    produccionLimitadaUnidades: 40
};

// --- CASO 1: Comparativa de Hiperdeportivos de Elite (Caso Normal) ---
const comparativaNormal: ComparativaAutosRaw = {
    id: 'CMP-HYPER-2026',
    tituloComparativa: 'Duelo de Titanes: Hiperdeportivos y Superdeportivos 2026',
    autorAnalista: 'José Rodríguez',
    autos: [a1, a2, a3]
};

// --- CASO 2: Potencia Excesiva, Velocidad Inválida y Auto Duplicado (Caso Límite) ---
const autoCorrupto: AutoPremium = {
    id: 'car-99',
    codigoAuto: 'CAR-ERR-999',
    marca: 'Marca Inexistente',
    modelo: 'Prototipo Invalido',
    anoFabricacion: 1980, // Ano anterior a 1990 -> Invalido
    categoria: 'GranTurismo',
    propulsion: 'CombustionV8',
    especificaciones: {
        potenciaHP: 5000, // Potencia > 3000 HP -> Invalido
        torqueNM: -100,
        aceleracion0a100Sec: -1.5, // Aceleracion negativa -> Invalido
        velocidadMaximaKMH: 750, // Velocidad > 600 km/h -> Invalido
        pesoKG: -500, // Peso negativo -> Invalido
        precioBaseUSD: -100000 // Precio negativo -> Invalido
    },
    produccionLimitadaUnidades: -10
};

const comparativaLimiteCorrupta: ComparativaAutosRaw = {
    id: 'CMP-FAIL-02',
    tituloComparativa: 'Comparativa Con Errores de Homologacion',
    autorAnalista: 'Analista Invitado',
    autos: [
        a1,
        autoCorrupto,
        a1 // Auto duplicado
    ]
};

async function ejecutarPruebas(): Promise<void> {
    const servicio = new ServicioComparadorAutosPremium();

    // Ejecución Caso 1
    const resumenNormal = await servicio.procesarComparativaAsync(comparativaNormal);
    mostrarResumenComparativa(resumenNormal, 'Caso Normal - Hiperdeportivos de Elite');

    // Ejecución Caso 2
    const resumenLimite = await servicio.procesarComparativaAsync(comparativaLimiteCorrupta);
    mostrarResumenComparativa(resumenLimite, 'Caso Limite - Especificaciones Fuera de Rango');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecucion:', err));