
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type CategoriaCompuesto =
    | 'Organico'
    | 'Inorganico'
    | 'Acido'
    | 'Base'
    | 'Sal'
    | 'Oxido';

export type EstadoMateria = 'Gas' | 'Liquido' | 'Solido' | 'Acuoso';

export interface ElementoQuimico {
    readonly simbolo: string;
    readonly nombre: string;
    readonly numeroAtomico: number;
    readonly masaAtomica: number; // g/mol
}

export interface ElementoEnFormula {
    readonly elemento: ElementoQuimico;
    readonly cantidad: number;
}

export interface CompuestoQuimico {
    readonly id: string;
    readonly formulaMolecular: string;
    readonly nombreIupac: string;
    readonly nombreComun: string;
    readonly categoria: CategoriaCompuesto;
    readonly estadoEstandard: EstadoMateria;
    readonly elementos: readonly ElementoEnFormula[];
    readonly esPeligroso: boolean;
}

export interface MetricasFormulasQuimicas {
    readonly totalCompuestos: number;
    readonly totalCompuestosValidos: number;
    readonly masaMolarPromedio: number;
    readonly compuestoMasPesado: CompuestoQuimico | null;
    readonly compuestoMasLigero: CompuestoQuimico | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaCompuesto, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoMateria, number>>;
}

export interface ResumenValidadorFormulas {
    readonly totalCompuestosValidos: number;
    readonly metricas: MetricasFormulasQuimicas;
    readonly compuestosProcesados: readonly CompuestoQuimico[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarElementoEnFormula(item: ElementoEnFormula): ResultadoValidacion<ElementoEnFormula> {
    const errores: string[] = [];

    if (item.cantidad <= 0) {
        errores.push(`La cantidad de atomos para el elemento ${item.elemento.simbolo} debe ser mayor a 0 (${item.cantidad}).`);
    }

    if (item.elemento.masaAtomica <= 0) {
        errores.push(`Masa atomica invalida (${item.elemento.masaAtomica} g/mol) para el elemento ${item.elemento.nombre}.`);
    }

    if (item.elemento.numeroAtomico <= 0 || item.elemento.numeroAtomico > 118) {
        errores.push(`Numero atomico fuera de la tabla periodica (${item.elemento.numeroAtomico}) para ${item.elemento.nombre}.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: item }
        : { esValido: false, errores };
}

export function validarCompuestoQuimico(compuesto: CompuestoQuimico): ResultadoValidacion<CompuestoQuimico> {
    const errores: string[] = [];

    if (compuesto.formulaMolecular.trim().length === 0) {
        errores.push(`El compuesto con ID ${compuesto.id} no registra formula molecular.`);
    }

    if (compuesto.elementos.length === 0) {
        errores.push(`La formula "${compuesto.formulaMolecular}" no contiene elementos quimicos asignados.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: compuesto }
        : { esValido: false, errores };
}

export function validarCompuestosRaw(compuestos: readonly CompuestoQuimico[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();
    const formulasVistas = new Set<string>();

    if (compuestos.length === 0) {
        advertencias.push('La lista de compuestos quimicos a validar esta vacia.');
    }

    for (const compuesto of compuestos) {
        if (idsVistos.has(compuesto.id)) {
            advertencias.push(`Compuesto duplicado detectado por ID: ${compuesto.id}.`);
        }
        if (formulasVistas.has(compuesto.formulaMolecular)) {
            advertencias.push(`Formula molecular duplicada: ${compuesto.formulaMolecular}.`);
        }
        idsVistos.add(compuesto.id);
        formulasVistas.add(compuesto.formulaMolecular);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce y Record)

const CATEGORIAS_COMPUESTO: readonly CategoriaCompuesto[] = [
    'Organico',
    'Inorganico',
    'Acido',
    'Base',
    'Sal',
    'Oxido'
];

const ESTADOS_MATERIA: readonly EstadoMateria[] = ['Gas', 'Liquido', 'Solido', 'Acuoso'];

export function calcularMasaMolar(compuesto: CompuestoQuimico): number {
    return Number(
        compuesto.elementos
            .reduce((acc, item) => acc + item.elemento.masaAtomica * item.cantidad, 0)
            .toFixed(3)
    );
}

export function calcularMetricasFormulas(compuestos: readonly CompuestoQuimico[]): MetricasFormulasQuimicas {
    if (compuestos.length === 0) {
        const desgloseCategoriaVacio = CATEGORIAS_COMPUESTO.reduce((acc, cat) => {
            acc[cat] = 0;
            return acc;
        }, {} as Record<CategoriaCompuesto, number>);

        const desgloseEstadoVacio = ESTADOS_MATERIA.reduce((acc, est) => {
            acc[est] = 0;
            return acc;
        }, {} as Record<EstadoMateria, number>);

        return {
            totalCompuestos: 0,
            totalCompuestosValidos: 0,
            masaMolarPromedio: 0,
            compuestoMasPesado: null,
            compuestoMasLigero: null,
            desglosePorCategoria: desgloseCategoriaVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const sumaMasasMolares = compuestos.reduce((acc, c) => acc + calcularMasaMolar(c), 0);
    const masaMolarPromedio = Number((sumaMasasMolares / compuestos.length).toFixed(2));

    const compuestoMasPesado = [...compuestos].sort(
        (a, b) => calcularMasaMolar(b) - calcularMasaMolar(a)
    )[0] ?? null;

    const compuestoMasLigero = [...compuestos].sort(
        (a, b) => calcularMasaMolar(a) - calcularMasaMolar(b)
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorCategoria = compuestos.reduce((acc, c) => {
        acc[c.categoria] = (acc[c.categoria] ?? 0) + 1;
        return acc;
    }, CATEGORIAS_COMPUESTO.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<CategoriaCompuesto, number>));

    const desglosePorEstado = compuestos.reduce((acc, c) => {
        acc[c.estadoEstandard] = (acc[c.estadoEstandard] ?? 0) + 1;
        return acc;
    }, ESTADOS_MATERIA.reduce((acc, est) => ({ ...acc, [est]: 0 }), {} as Record<EstadoMateria, number>));

    return {
        totalCompuestos: compuestos.length,
        totalCompuestosValidos: compuestos.length,
        masaMolarPromedio,
        compuestoMasPesado,
        compuestoMasLigero,
        desglosePorCategoria,
        desglosePorEstado
    };
}

export function procesarValidadorFormulas(compuestosRaw: readonly CompuestoQuimico[]): ResumenValidadorFormulas {
    const advertencias: string[] = [...validarCompuestosRaw(compuestosRaw)];
    const compuestosValidos: CompuestoQuimico[] = [];

    for (const raw of compuestosRaw) {
        const resComp = validarCompuestoQuimico(raw);
        advertencias.push(...(resComp.esValido ? [] : resComp.errores));

        let elementosValidos = true;
        for (const item of raw.elementos) {
            const resElem = validarElementoEnFormula(item);
            if (!resElem.esValido) {
                elementosValidos = false;
                advertencias.push(...resElem.errores.map((err) => `Formula ${raw.formulaMolecular}: ${err}`));
            }
        }

        if (resComp.esValido && elementosValidos) {
            compuestosValidos.push(raw);
        }
    }

    const metricas = calcularMetricasFormulas(compuestosValidos);

    return {
        totalCompuestosValidos: compuestosValidos.length,
        metricas,
        compuestosProcesados: compuestosValidos,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenFormulas(resumen: ResumenValidadorFormulas, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` VALIDADOR DE FORMULAS QUIMICAS - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Compuestos Validadados: ${resumen.totalCompuestosValidos}`);
    console.log(`Masa Molar Promedio   : ${resumen.metricas.masaMolarPromedio} g/mol`);
    console.log(`Compuesto Mas Pesado  : ${resumen.metricas.compuestoMasPesado ? `${resumen.metricas.compuestoMasPesado.formulaMolecular} (${resumen.metricas.compuestoMasPesado.nombreComun} - ${calcularMasaMolar(resumen.metricas.compuestoMasPesado)} g/mol)` : 'N/A'}`);
    console.log(`Compuesto Mas Ligero  : ${resumen.metricas.compuestoMasLigero ? `${resumen.metricas.compuestoMasLigero.formulaMolecular} (${resumen.metricas.compuestoMasLigero.nombreComun} - ${calcularMasaMolar(resumen.metricas.compuestoMasLigero)} g/mol)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE ERRORES DE FORMULA (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR CATEGORIA DE COMPUESTO:`);
    Object.entries(resumen.metricas.desglosePorCategoria).forEach(([categoria, cantidad]) => {
        console.log(`   - ${categoria.padEnd(14)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.compuestosProcesados.map((c) => ({
            ID: c.id,
            Formula: c.formulaMolecular,
            Nombre: c.nombreComun,
            IUPAC: c.nombreIupac,
            Categoria: c.categoria,
            Estado: c.estadoEstandard,
            'Masa Molar': `${calcularMasaMolar(c)} g/mol`,
            Peligroso: c.esPeligroso ? 'SI' : 'NO'
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const elemH: ElementoQuimico = { simbolo: 'H', nombre: 'Hidrogeno', numeroAtomico: 1, masaAtomica: 1.008 };
const elemO: ElementoQuimico = { simbolo: 'O', nombre: 'Oxigeno', numeroAtomico: 8, masaAtomica: 15.999 };
const elemC: ElementoQuimico = { simbolo: 'C', nombre: 'Carbono', numeroAtomico: 6, masaAtomica: 12.011 };
const elemNa: ElementoQuimico = { simbolo: 'Na', nombre: 'Sodio', numeroAtomico: 11, masaAtomica: 22.990 };
const elemCl: ElementoQuimico = { simbolo: 'Cl', nombre: 'Cloro', numeroAtomico: 17, masaAtomica: 35.450 };
const elemS: ElementoQuimico = { simbolo: 'S', nombre: 'Azufre', numeroAtomico: 16, masaAtomica: 32.060 };

// --- CASO 1: Catálogo de Moléculas Comunes en Laboratorio (Caso Normal) ---
const compuestosNormales: readonly CompuestoQuimico[] = [
    {
        id: 'MOL-001',
        formulaMolecular: 'H2O',
        nombreIupac: 'Oxidano',
        nombreComun: 'Agua',
        categoria: 'Inorganico',
        estadoEstandard: 'Liquido',
        elementos: [
            { elemento: elemH, cantidad: 2 },
            { elemento: elemO, cantidad: 1 }
        ],
        esPeligroso: false
    },
    {
        id: 'MOL-002',
        formulaMolecular: 'H2SO4',
        nombreIupac: 'Acido tetraoxosulfurico (VI)',
        nombreComun: 'Acido Sulfurico',
        categoria: 'Acido',
        estadoEstandard: 'Liquido',
        elementos: [
            { elemento: elemH, cantidad: 2 },
            { elemento: elemS, cantidad: 1 },
            { elemento: elemO, cantidad: 4 }
        ],
        esPeligroso: true
    },
    {
        id: 'MOL-003',
        formulaMolecular: 'NaCl',
        nombreIupac: 'Cloruro de Sodio',
        nombreComun: 'Sal de Mesa',
        categoria: 'Sal',
        estadoEstandard: 'Solido',
        elementos: [
            { elemento: elemNa, cantidad: 1 },
            { elemento: elemCl, cantidad: 1 }
        ],
        esPeligroso: false
    },
    {
        id: 'MOL-004',
        formulaMolecular: 'CH4',
        nombreIupac: 'Metano',
        nombreComun: 'Gas Metano',
        categoria: 'Organico',
        estadoEstandard: 'Gas',
        elementos: [
            { elemento: elemC, cantidad: 1 },
            { elemento: elemH, cantidad: 4 }
        ],
        esPeligroso: true
    }
];

// --- CASO 2: Átomos en Cero, Masas Negativas y Fórmulas Duplicadas (Caso Límite) ---
const elemCorrupto: ElementoQuimico = { simbolo: 'Xx', nombre: 'Elemento Falso', numeroAtomico: -5, masaAtomica: -10.0 };

const compuestosLimiteCorruptos: readonly CompuestoQuimico[] = [
    {
        id: 'MOL-005',
        formulaMolecular: 'H0O2',
        nombreIupac: 'Oxido invalido',
        nombreComun: 'Agua Sin Hidrogeno',
        categoria: 'Oxido',
        estadoEstandard: 'Liquido',
        elementos: [
            { elemento: elemH, cantidad: 0 }, // Cantidad 0 -> Invalido
            { elemento: elemO, cantidad: 2 }
        ],
        esPeligroso: false
    },
    {
        id: 'MOL-006',
        formulaMolecular: 'Xx2',
        nombreIupac: 'Falso compuesto',
        nombreComun: 'Elemento Invalido',
        categoria: 'Inorganico',
        estadoEstandard: 'Solido',
        elementos: [
            { elemento: elemCorrupto, cantidad: 2 } // Numero atomico y masa atomica negativos -> Invalido
        ],
        esPeligroso: false
    },
    {
        id: 'MOL-001', // ID Duplicado con MOL-001
        formulaMolecular: 'H2O', // Formula molecular duplicada
        nombreIupac: 'Oxidano',
        nombreComun: 'Agua Copia',
        categoria: 'Inorganico',
        estadoEstandard: 'Liquido',
        elementos: [
            { elemento: elemH, cantidad: 2 },
            { elemento: elemO, cantidad: 1 }
        ],
        esPeligroso: false
    }
];

// Ejecución
const resumenNormal = procesarValidadorFormulas(compuestosNormales);
mostrarResumenFormulas(resumenNormal, 'Caso Normal - Catalogo de Moleculas Quimicas');

const resumenLimite = procesarValidadorFormulas(compuestosLimiteCorruptos);
mostrarResumenFormulas(resumenLimite, 'Caso Limite - Cantidad Cero y Elementos Inexistentes');