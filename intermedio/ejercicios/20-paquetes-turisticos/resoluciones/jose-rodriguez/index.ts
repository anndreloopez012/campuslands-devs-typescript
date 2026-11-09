
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type TipoTurismo =
    | 'Aventura'
    | 'Cultural'
    | 'Gastronomico'
    | 'Ecologico'
    | 'Lujo'
    | 'Relax';

export type NivelAlojamiento =
    | 'Hostal'
    | 'TresEstrellas'
    | 'CuatroEstrellas'
    | 'CincoEstrellas'
    | 'ResortLujo';

export interface PaqueteTuristico {
    readonly id: string;
    readonly nombrePaquete: string;
    readonly destino: string;
    readonly pais: string;
    readonly duracionDias: number;
    readonly tipoTurismo: TipoTurismo;
    readonly alojamiento: NivelAlojamiento;
    readonly precioPorPersonaUSD: number;
    readonly incluyeVuelos: boolean;
    readonly incluyeGuia: boolean;
    readonly calificacionUsuarios: number; // Evaluacion de 1.0 a 5.0
    readonly cuposDisponibles: number;
}

export interface CriteriosFiltroTurismo {
    readonly presupuestoMaximoUSD?: number;
    readonly duracionMinimaDias?: number;
    readonly tipoTurismoDeseado?: TipoTurismo;
    readonly requiereVuelos?: boolean;
}

export interface MetricasComparacionTurismo {
    readonly totalPaquetesEvaluados: number;
    readonly totalPaquetesElegibles: number;
    readonly paqueteMasEconomico: PaqueteTuristico | null;
    readonly paqueteMejorValorado: PaqueteTuristico | null;
    readonly mejorRelacionCalidadPrecio: PaqueteTuristico | null;
    readonly precioPromedioUSD: number;
    readonly desglosePorTipo: Readonly<Record<TipoTurismo, number>>;
}

export interface ResumenComparacionTurismo {
    readonly totalPaquetesValidos: number;
    readonly metricas: MetricasComparacionTurismo;
    readonly paquetesElegibles: readonly PaqueteTuristico[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarPaqueteTuristico(paquete: PaqueteTuristico): ResultadoValidacion<PaqueteTuristico> {
    const errores: string[] = [];

    if (paquete.duracionDias <= 0 || paquete.duracionDias > 90) {
        errores.push(`La duracion del paquete "${paquete.nombrePaquete}" esta fuera del rango permitido (${paquete.duracionDias} dias).`);
    }

    if (paquete.precioPorPersonaUSD <= 0) {
        errores.push(`El precio por persona de "${paquete.nombrePaquete}" debe ser mayor a 0 USD ($${paquete.precioPorPersonaUSD}).`);
    }

    if (paquete.calificacionUsuarios < 1.0 || paquete.calificacionUsuarios > 5.0) {
        errores.push(`La calificacion de "${paquete.nombrePaquete}" debe estar entre 1.0 y 5.0 (${paquete.calificacionUsuarios}).`);
    }

    if (paquete.cuposDisponibles < 0) {
        errores.push(`Los cupos disponibles no pueden ser negativos en "${paquete.nombrePaquete}".`);
    }

    if (paquete.nombrePaquete.trim().length === 0 || paquete.destino.trim().length === 0) {
        errores.push('El paquete turistico debe incluir un nombre y destino validos.');
    }

    return errores.length === 0
        ? { esValido: true, datos: paquete }
        : { esValido: false, errores };
}

export function validarCatalogoTurismoRaw(paquetes: readonly PaqueteTuristico[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (paquetes.length === 0) {
        advertencias.push('El comparador de turismo no registra paquetes turisticos disponibles.');
    }

    for (const paquete of paquetes) {
        if (idsVistos.has(paquete.id)) {
            advertencias.push(`Paquete duplicado detectado: "${paquete.nombrePaquete}" (ID: ${paquete.id}).`);
        }
        idsVistos.add(paquete.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN, FILTRADO Y CÁLCULOS COMPARATIVOS

const TIPOS_TURISMO: readonly TipoTurismo[] = [
    'Aventura',
    'Cultural',
    'Gastronomico',
    'Ecologico',
    'Lujo',
    'Relax'
];

export function calcularIndiceCalidadPrecio(paquete: PaqueteTuristico): number {
    if (paquete.precioPorPersonaUSD <= 0) return 0;
    // Indice: (Calificacion * 100) / Precio
    return Number(((paquete.calificacionUsuarios * 100) / paquete.precioPorPersonaUSD).toFixed(4));
}

export function filtrarPaquetesTuristicos(
    paquetes: readonly PaqueteTuristico[],
    criterios: CriteriosFiltroTurismo
): readonly PaqueteTuristico[] {
    return paquetes.filter((p) => {
        if (criterios.presupuestoMaximoUSD !== undefined && p.precioPorPersonaUSD > criterios.presupuestoMaximoUSD) {
            return false;
        }
        if (criterios.duracionMinimaDias !== undefined && p.duracionDias < criterios.duracionMinimaDias) {
            return false;
        }
        if (criterios.tipoTurismoDeseado !== undefined && p.tipoTurismo !== criterios.tipoTurismoDeseado) {
            return false;
        }
        if (criterios.requiereVuelos !== undefined && criterios.requiereVuelos && !p.incluyeVuelos) {
            return false;
        }
        return p.cuposDisponibles > 0;
    });
}

export function calcularMetricasComparacion(
    paquetesEvaluados: readonly PaqueteTuristico[],
    paquetesElegibles: readonly PaqueteTuristico[]
): MetricasComparacionTurismo {
    if (paquetesElegibles.length === 0) {
        const desgloseVacio = TIPOS_TURISMO.reduce((acc, tipo) => {
            acc[tipo] = 0;
            return acc;
        }, {} as Record<TipoTurismo, number>);

        return {
            totalPaquetesEvaluados: paquetesEvaluados.length,
            totalPaquetesElegibles: 0,
            paqueteMasEconomico: null,
            paqueteMejorValorado: null,
            mejorRelacionCalidadPrecio: null,
            precioPromedioUSD: 0,
            desglosePorTipo: desgloseVacio
        };
    }

    const sumaPrecios = paquetesElegibles.reduce((acc, p) => acc + p.precioPorPersonaUSD, 0);
    const precioPromedioUSD = Number((sumaPrecios / paquetesElegibles.length).toFixed(2));

    const paqueteMasEconomico = [...paquetesElegibles].sort(
        (a, b) => a.precioPorPersonaUSD - b.precioPorPersonaUSD
    )[0] ?? null;

    const paqueteMejorValorado = [...paquetesElegibles].sort(
        (a, b) => b.calificacionUsuarios - a.calificacionUsuarios
    )[0] ?? null;

    const mejorRelacionCalidadPrecio = [...paquetesElegibles].sort(
        (a, b) => calcularIndiceCalidadPrecio(b) - calcularIndiceCalidadPrecio(a)
    )[0] ?? null;

    const desglosePorTipo = paquetesElegibles.reduce((acc, p) => {
        acc[p.tipoTurismo] = (acc[p.tipoTurismo] ?? 0) + 1;
        return acc;
    }, TIPOS_TURISMO.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoTurismo, number>));

    return {
        totalPaquetesEvaluados: paquetesEvaluados.length,
        totalPaquetesElegibles: paquetesElegibles.length,
        paqueteMasEconomico,
        paqueteMejorValorado,
        mejorRelacionCalidadPrecio,
        precioPromedioUSD,
        desglosePorTipo
    };
}

export function procesarComparadorTurismo(
    paquetesRaw: readonly PaqueteTuristico[],
    criterios: CriteriosFiltroTurismo
): ResumenComparacionTurismo {
    const advertencias: string[] = [...validarCatalogoTurismoRaw(paquetesRaw)];
    const paquetesValidos: PaqueteTuristico[] = [];

    for (const raw of paquetesRaw) {
        const res = validarPaqueteTuristico(raw);
        if (res.esValido) {
            paquetesValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const elegibles = filtrarPaquetesTuristicos(paquetesValidos, criterios);
    const metricas = calcularMetricasComparacion(paquetesValidos, elegibles);

    if (elegibles.length === 0 && paquetesValidos.length > 0) {
        advertencias.push('Ningun paquete turistico cumple con los criterios de filtro especificados.');
    }

    return {
        totalPaquetesValidos: paquetesValidos.length,
        metricas,
        paquetesElegibles: elegibles,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenComparador(resumen: ResumenComparacionTurismo, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` COMPARADOR DE PAQUETES TURISTICOS - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Paquetes Validados : ${resumen.totalPaquetesValidos}`);
    console.log(`Paquetes Elegibles : ${resumen.metricas.totalPaquetesElegibles} de ${resumen.metricas.totalPaquetesEvaluados}`);
    console.log(`Precio Promedio    : $${resumen.metricas.precioPromedioUSD.toLocaleString()} USD`);
    console.log(`Mas Economico      : ${resumen.metricas.paqueteMasEconomico ? `${resumen.metricas.paqueteMasEconomico.nombrePaquete} ($${resumen.metricas.paqueteMasEconomico.precioPorPersonaUSD})` : 'N/A'}`);
    console.log(`Mejor Valoracion   : ${resumen.metricas.paqueteMejorValorado ? `${resumen.metricas.paqueteMejorValorado.nombrePaquete} (${resumen.metricas.paqueteMejorValorado.calificacionUsuarios} estrellas)` : 'N/A'}`);
    console.log(`Top Calidad/Precio : ${resumen.metricas.mejorRelacionCalidadPrecio ? `${resumen.metricas.mejorRelacionCalidadPrecio.nombrePaquete} (Indice: ${calcularIndiceCalidadPrecio(resumen.metricas.mejorRelacionCalidadPrecio)})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE FILTRADO Y VALIDACION (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE PAQUETES ELEGIBLES POR TIPO:`);
    Object.entries(resumen.metricas.desglosePorTipo).forEach(([tipo, cantidad]) => {
        console.log(`   - ${tipo.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.paquetesElegibles.map((p) => ({
            ID: p.id,
            Paquete: p.nombrePaquete,
            Destino: `${p.destino}, ${p.pais}`,
            Dias: `${p.duracionDias}d`,
            Tipo: p.tipoTurismo,
            Alojamiento: p.alojamiento,
            Precio: `$${p.precioPorPersonaUSD}`,
            Vuelos: p.incluyeVuelos ? 'SI' : 'NO',
            Guia: p.incluyeGuia ? 'SI' : 'NO',
            Calificacion: `${p.calificacionUsuarios} / 5.0`,
            Cupos: p.cuposDisponibles
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: Búsqueda de Viaje de Aventura / Cultural con Vuelos (Caso Normal) ---
const catalogoTurismoNormal: readonly PaqueteTuristico[] = [
    {
        id: 'TR-001',
        nombrePaquete: 'Inca Trail & Machu Picchu Magic',
        destino: 'Cusco',
        pais: 'Peru',
        duracionDias: 7,
        tipoTurismo: 'Aventura',
        alojamiento: 'CuatroEstrellas',
        precioPorPersonaUSD: 1250.0,
        incluyeVuelos: true,
        incluyeGuia: true,
        calificacionUsuarios: 4.9,
        cuposDisponibles: 8
    },
    {
        id: 'TR-002',
        nombrePaquete: 'Ruta Maya & Tikal Expedition',
        destino: 'Petén',
        pais: 'Guatemala',
        duracionDias: 5,
        tipoTurismo: 'Cultural',
        alojamiento: 'TresEstrellas',
        precioPorPersonaUSD: 850.0,
        incluyeVuelos: true,
        incluyeGuia: true,
        calificacionUsuarios: 4.7,
        cuposDisponibles: 12
    },
    {
        id: 'TR-003',
        nombrePaquete: 'Safari & Playas de Zanzibar',
        destino: 'Serengeti',
        pais: 'Tanzania',
        duracionDias: 10,
        tipoTurismo: 'Lujo',
        alojamiento: 'ResortLujo',
        precioPorPersonaUSD: 3400.0,
        incluyeVuelos: true,
        incluyeGuia: true,
        calificacionUsuarios: 4.8,
        cuposDisponibles: 4
    },
    {
        id: 'TR-004',
        nombrePaquete: 'Escapada Ecologica Selva Lacandona',
        destino: 'Chiapas',
        pais: 'Mexico',
        duracionDias: 4,
        tipoTurismo: 'Ecologico',
        alojamiento: 'Hostal',
        precioPorPersonaUSD: 450.0,
        incluyeVuelos: false,
        incluyeGuia: true,
        calificacionUsuarios: 4.5,
        cuposDisponibles: 15
    }
];

const criteriosNormales: CriteriosFiltroTurismo = {
    presupuestoMaximoUSD: 2000.0,
    duracionMinimaDias: 5,
    requiereVuelos: true
};

// --- CASO 2: Paquetes con Precios Negativos, Duraciones Inválidas e ID Duplicado (Caso Límite) ---
const catalogoTurismoLimite: readonly PaqueteTuristico[] = [
    {
        id: 'TR-005',
        nombrePaquete: 'Paquete Precio Invalido',
        destino: 'Desconocido',
        pais: 'Sin Pais',
        duracionDias: 3,
        tipoTurismo: 'Relax',
        alojamiento: 'Hostal',
        precioPorPersonaUSD: -100.0, // Precio negativo -> Invalido
        incluyeVuelos: false,
        incluyeGuia: false,
        calificacionUsuarios: 4.0,
        cuposDisponibles: 5
    },
    {
        id: 'TR-006',
        nombrePaquete: 'Paquete Duracion Cero',
        destino: 'Error',
        pais: 'Error',
        duracionDias: 0, // Duracion 0 -> Invalido
        tipoTurismo: 'Aventura',
        alojamiento: 'TresEstrellas',
        precioPorPersonaUSD: 500.0,
        incluyeVuelos: true,
        incluyeGuia: true,
        calificacionUsuarios: 6.0, // Rating > 5.0 -> Invalido
        cuposDisponibles: 2
    },
    {
        id: 'TR-001', // ID Duplicado con Inca Trail
        nombrePaquete: 'Inca Trail Copia',
        destino: 'Cusco',
        pais: 'Peru',
        duracionDias: 7,
        tipoTurismo: 'Aventura',
        alojamiento: 'CuatroEstrellas',
        precioPorPersonaUSD: 1250.0,
        incluyeVuelos: true,
        incluyeGuia: true,
        calificacionUsuarios: 4.9,
        cuposDisponibles: 2
    }
];

const criteriosLimite: CriteriosFiltroTurismo = {
    presupuestoMaximoUSD: 300.0 // Ninguno cumplirá por presupuesto
};

// Ejecución
const resumenNormal = procesarComparadorTurismo(catalogoTurismoNormal, criteriosNormales);
mostrarResumenComparador(resumenNormal, 'Caso Normal - Busqueda de Paquetes con Vuelo < $2000 USD');

const resumenLimite = procesarComparadorTurismo(catalogoTurismoLimite, criteriosLimite);
mostrarResumenComparador(resumenLimite, 'Caso Limite - Registros Corruptos y Filtro Estricto sin Resultados');