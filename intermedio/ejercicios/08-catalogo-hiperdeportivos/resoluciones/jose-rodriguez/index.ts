
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type TipoPropulsion = 'Gasolina' | 'Hibrido' | 'Electrico';
export type SegmentoHiperdeportivo = 'Hypercar' | 'Megacar' | 'TrackOnly' | 'GrandTourer';

export interface EspecificacionesTecnicas {
    readonly caballosFuerza: number;
    readonly velocidadMaximaKmh: number;
    readonly aceleracion0a100Sec: number; // Segundos de 0 a 100 km/h
    readonly pesoKg: number;
    readonly unidadesProducidas: number;
}

export interface Hiperdeportivo {
    readonly id: string;
    readonly marca: string;
    readonly modelo: string;
    readonly anio: number;
    readonly propulsion: TipoPropulsion;
    readonly segmento: SegmentoHiperdeportivo;
    readonly precioUSD: number;
    readonly especificaciones: EspecificacionesTecnicas;
}

export interface MetricasCatalogo {
    readonly relacionPesoPotenciaPromedio: number; // kg por caballo de fuerza (kg/HP)
    readonly autoMasRapido: Hiperdeportivo | null;
    readonly autoMasPotente: Hiperdeportivo | null;
    readonly valorTotalCatalogoUSD: number;
    readonly precioPromedioUSD: number;
    readonly desglosePorPropulsion: Readonly<Record<TipoPropulsion, number>>;
}

export interface ResumenCatalogoHiperdeportivos {
    readonly totalAutosValidos: number;
    readonly metricas: MetricasCatalogo;
    readonly autosProcesados: readonly Hiperdeportivo[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarHiperdeportivo(auto: Hiperdeportivo): ResultadoValidacion<Hiperdeportivo> {
    const errores: string[] = [];
    const { caballosFuerza, velocidadMaximaKmh, aceleracion0a100Sec, pesoKg, unidadesProducidas } = auto.especificaciones;

    if (auto.precioUSD <= 0) {
        errores.push(`El auto "${auto.marca} ${auto.modelo}" contiene un precio invalido ($${auto.precioUSD}).`);
    }

    if (auto.anio < 1990 || auto.anio > 2030) {
        errores.push(`El anio de fabricacion (${auto.anio}) del auto "${auto.modelo}" esta fuera de rango.`);
    }

    if (caballosFuerza <= 0 || velocidadMaximaKmh <= 0 || pesoKg <= 0) {
        errores.push(`El auto "${auto.modelo}" tiene especificaciones mecanicas fundamentales invalidas (HP, Velocidad o Peso <= 0).`);
    }

    if (aceleracion0a100Sec <= 0 || aceleracion0a100Sec > 15) {
        errores.push(`El tiempo de aceleracion de 0 a 100 km/h (${aceleracion0a100Sec}s) es anomalo para un hiperdeportivo.`);
    }

    if (unidadesProducidas <= 0) {
        errores.push(`El volumen de produccion de "${auto.modelo}" debe ser mayor a 0 unidades.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: auto }
        : { esValido: false, errores };
}

export function validarCatalogoRaw(autos: readonly Hiperdeportivo[]): readonly string[] {
    const advertencias: string[] = [];
    const idsRegistrados = new Set<string>();

    if (autos.length === 0) {
        advertencias.push('El catalogo no contiene ningun hiperdeportivo registrado.');
    }

    for (const auto of autos) {
        if (idsRegistrados.has(auto.id)) {
            advertencias.push(`Registro duplicado detectado: ${auto.marca} ${auto.modelo} (ID: ${auto.id}).`);
        }
        idsRegistrados.add(auto.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS

const TIPOS_PROPULSION: readonly TipoPropulsion[] = ['Gasolina', 'Hibrido', 'Electrico'];

export function calcularRelacionPesoPotencia(pesoKg: number, hp: number): number {
    if (hp <= 0) return 0;
    return Number((pesoKg / hp).toFixed(2));
}

export function calcularMetricasCatalogo(autos: readonly Hiperdeportivo[]): MetricasCatalogo {
    if (autos.length === 0) {
        const desgloseVacio = TIPOS_PROPULSION.reduce((acc, prop) => {
            acc[prop] = 0;
            return acc;
        }, {} as Record<TipoPropulsion, number>);

        return {
            relacionPesoPotenciaPromedio: 0,
            autoMasRapido: null,
            autoMasPotente: null,
            valorTotalCatalogoUSD: 0,
            precioPromedioUSD: 0,
            desglosePorPropulsion: desgloseVacio
        };
    }

    const valorTotalCatalogoUSD = Number(
        autos.reduce((acc, auto) => acc + auto.precioUSD, 0).toFixed(2)
    );
    const precioPromedioUSD = Number((valorTotalCatalogoUSD / autos.length).toFixed(2));

    const sumaRelacionPesoPotencia = autos.reduce(
        (acc, auto) => acc + calcularRelacionPesoPotencia(auto.especificaciones.pesoKg, auto.especificaciones.caballosFuerza),
        0
    );
    const relacionPesoPotenciaPromedio = Number((sumaRelacionPesoPotencia / autos.length).toFixed(2));

    // Auto con mayor velocidad máxima
    const autoMasRapido = [...autos].sort(
        (a, b) => b.especificaciones.velocidadMaximaKmh - a.especificaciones.velocidadMaximaKmh
    )[0] ?? null;

    // Auto con mayor potencia (Caballos de Fuerza)
    const autoMasPotente = [...autos].sort(
        (a, b) => b.especificaciones.caballosFuerza - a.especificaciones.caballosFuerza
    )[0] ?? null;

    const desglosePorPropulsion = autos.reduce((acc, auto) => {
        acc[auto.propulsion] = (acc[auto.propulsion] ?? 0) + 1;
        return acc;
    }, TIPOS_PROPULSION.reduce((acc, prop) => ({ ...acc, [prop]: 0 }), {} as Record<TipoPropulsion, number>));

    return {
        relacionPesoPotenciaPromedio,
        autoMasRapido,
        autoMasPotente,
        valorTotalCatalogoUSD,
        precioPromedioUSD,
        desglosePorPropulsion
    };
}

export function procesarCatalogoHiperdeportivos(autosRaw: readonly Hiperdeportivo[]): ResumenCatalogoHiperdeportivos {
    const advertencias: string[] = [...validarCatalogoRaw(autosRaw)];
    const autosValidos: Hiperdeportivo[] = [];

    for (const raw of autosRaw) {
        const res = validarHiperdeportivo(raw);
        if (res.esValido) {
            autosValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasCatalogo(autosValidos);

    return {
        totalAutosValidos: autosValidos.length,
        metricas,
        autosProcesados: autosValidos,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenCatalogo(resumen: ResumenCatalogoHiperdeportivos, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` CATALOGO DE VEHICULOS HIPERDEPORTIVOS - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Autos Validados     : ${resumen.totalAutosValidos}`);
    console.log(`Valor Total Catalogo: $${resumen.metricas.valorTotalCatalogoUSD.toLocaleString()}`);
    console.log(`Precio Promedio     : $${resumen.metricas.precioPromedioUSD.toLocaleString()}`);
    console.log(`Relacion Peso/HP Prom: ${resumen.metricas.relacionPesoPotenciaPromedio} kg/HP`);
    console.log(`Auto Mas Rapido     : ${resumen.metricas.autoMasRapido ? `${resumen.metricas.autoMasRapido.marca} ${resumen.metricas.autoMasRapido.modelo} (${resumen.metricas.autoMasRapido.especificaciones.velocidadMaximaKmh} km/h)` : 'N/A'}`);
    console.log(`Auto Mas Potente    : ${resumen.metricas.autoMasPotente ? `${resumen.metricas.autoMasPotente.marca} ${resumen.metricas.autoMasPotente.modelo} (${resumen.metricas.autoMasPotente.especificaciones.caballosFuerza} HP)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REGISTRO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR TIPO DE PROPULSION:`);
    Object.entries(resumen.metricas.desglosePorPropulsion).forEach(([propulsion, cantidad]) => {
        console.log(`   - ${propulsion.padEnd(12)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.autosProcesados.map((auto) => ({
            ID: auto.id,
            Vehiculo: `${auto.marca} ${auto.modelo}`,
            Anio: auto.anio,
            Propulsion: auto.propulsion,
            Segmento: auto.segmento,
            Potencia: `${auto.especificaciones.caballosFuerza} HP`,
            Velocidad: `${auto.especificaciones.velocidadMaximaKmh} km/h`,
            '0-100 km/h': `${auto.especificaciones.aceleracion0a100Sec}s`,
            'Peso/HP': `${calcularRelacionPesoPotencia(auto.especificaciones.pesoKg, auto.especificaciones.caballosFuerza)} kg/HP`,
            Precio: `$${auto.precioUSD.toLocaleString()}`
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: Catálogo Exclusivo de Hiperdeportivos Modernos (Caso Normal) ---
const catalogoExclusivoNormal: readonly Hiperdeportivo[] = [
    {
        id: 'HYP-001',
        marca: 'Bugatti',
        modelo: 'Tourbillon',
        anio: 2026,
        propulsion: 'Hibrido',
        segmento: 'Megacar',
        precioUSD: 4100000,
        especificaciones: {
            caballosFuerza: 1800,
            velocidadMaximaKmh: 445,
            aceleracion0a100Sec: 2.0,
            pesoKg: 1995,
            unidadesProducidas: 250
        }
    },
    {
        id: 'HYP-002',
        marca: 'Koenigsegg',
        modelo: 'Jesko Absolut',
        anio: 2024,
        propulsion: 'Gasolina',
        segmento: 'Megacar',
        precioUSD: 3400000,
        especificaciones: {
            caballosFuerza: 1600,
            velocidadMaximaKmh: 500,
            aceleracion0a100Sec: 2.5,
            pesoKg: 1390,
            unidadesProducidas: 125
        }
    },
    {
        id: 'HYP-003',
        marca: 'Rimac',
        modelo: 'Nevera R',
        anio: 2025,
        propulsion: 'Electrico',
        segmento: 'Hypercar',
        precioUSD: 2530000,
        especificaciones: {
            caballosFuerza: 2107,
            velocidadMaximaKmh: 412,
            aceleracion0a100Sec: 1.81,
            pesoKg: 2277,
            unidadesProducidas: 40
        }
    },
    {
        id: 'HYP-004',
        marca: 'Ferrari',
        modelo: 'FXX-K EVO',
        anio: 2023,
        propulsion: 'Hibrido',
        segmento: 'TrackOnly',
        precioUSD: 2600000,
        especificaciones: {
            caballosFuerza: 1050,
            velocidadMaximaKmh: 350,
            aceleracion0a100Sec: 2.6,
            pesoKg: 1265,
            unidadesProducidas: 40
        }
    }
];

// --- CASO 2: Datos Corruptos, Valores Negativos y Duplicados (Caso Límite) ---
const catalogoLimiteCorrupto: readonly Hiperdeportivo[] = [
    {
        id: 'HYP-005',
        marca: 'Concept',
        modelo: 'Fantasme',
        anio: 2026,
        propulsion: 'Electrico',
        segmento: 'Hypercar',
        precioUSD: -500000, // Precio negativo invalido
        especificaciones: {
            caballosFuerza: -100, // Potencia negativa invalida
            velocidadMaximaKmh: 0, // Velocidad invalida
            aceleracion0a100Sec: 0, // Aceleracion invalida
            pesoKg: 1500,
            unidadesProducidas: 1
        }
    },
    {
        id: 'HYP-001', // ID Duplicado con el Bugatti Tourbillon del caso anterior
        marca: 'Replica',
        modelo: 'Imitacion Tourbillon',
        anio: 2025,
        propulsion: 'Gasolina',
        segmento: 'Hypercar',
        precioUSD: 100000,
        especificaciones: {
            caballosFuerza: 300,
            velocidadMaximaKmh: 200,
            aceleracion0a100Sec: 6.5,
            pesoKg: 1600,
            unidadesProducidas: 10
        }
    }
];

// Ejecución
const resumenNormal = procesarCatalogoHiperdeportivos(catalogoExclusivoNormal);
mostrarResumenCatalogo(resumenNormal, 'Caso Normal - Superdeportivos y Megacars');

const resumenLimite = procesarCatalogoHiperdeportivos(catalogoLimiteCorrupto);
mostrarResumenCatalogo(resumenLimite, 'Caso Limite - Registros Invalidos y Datos Corruptos');