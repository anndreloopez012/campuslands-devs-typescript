
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Promises)

export type TipoReaccionQuimica =
    | 'Combustión'
    | 'Síntesis'
    | 'Descomposición'
    | 'DesplazamientoSimple'
    | 'DobleSustitución';

export type EstadoBalance = 'Balanceado' | 'Desbalanceado' | 'Inválido';

export interface AtomoComponente {
    readonly simbolo: string; // e.g., 'H', 'O', 'C', 'Na'
    readonly cantidadAtomos: number;
}

export interface EspecieQuimica {
    readonly id: string;
    readonly formula: string; // e.g., 'H2O', 'CH4', 'CO2'
    readonly nombreComun: string;
    readonly coeficienteEstequiometrico: number; // e.g., 2 en 2H2O
    readonly composicion: readonly AtomoComponente[];
    readonly masaMolarGramosMol: number;
}

export interface ReaccionQuimicaRaw {
    readonly id: string;
    readonly codigoReaccion: string;
    readonly nombre: string;
    readonly tipo: TipoReaccionQuimica;
    readonly reactivos: readonly EspecieQuimica[];
    readonly productos: readonly EspecieQuimica[];
}

export interface ConteoElemento {
    readonly simbolo: string;
    readonly atomosReactivos: number;
    readonly atomosProductos: number;
    readonly estaBalanceado: boolean;
}

export interface MetricasBalanceQuimico {
    readonly totalEspeciesReactivos: number;
    readonly totalEspeciesProductos: number;
    readonly masaTotalReactivosGramos: number;
    readonly masaTotalProductosGramos: number;
    readonly conservacionMasaValida: boolean;
    readonly estadoBalance: EstadoBalance;
    readonly conteoPorElemento: Readonly<Record<string, ConteoElemento>>;
}

export interface ResumenBalanceQuimico {
    readonly reaccionId: string;
    readonly codigoReaccion: string;
    readonly nombreReaccion: string;
    readonly ecuacionTexto: string;
    readonly metricas: MetricasBalanceQuimico;
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y GESTIÓN DE REACCIONES (Generics & Encapsulamiento)

export class ContenedorReacciones<T extends { readonly id: string; readonly codigoReaccion: string }> {
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

export function validarEspecieQuimica(especie: EspecieQuimica): ResultadoValidacion<EspecieQuimica> {
    const errores: string[] = [];

    if (especie.coeficienteEstequiometrico <= 0) {
        errores.push(`Coeficiente estequiométrico inválido (${especie.coeficienteEstequiometrico}) en "${especie.formula}".`);
    }

    if (especie.masaMolarGramosMol <= 0) {
        errores.push(`Masa molar inválida (${especie.masaMolarGramosMol} g/mol) en "${especie.formula}".`);
    }

    if (especie.composicion.length === 0) {
        errores.push(`La especie química "${especie.formula}" no contiene átomos asignados.`);
    }

    for (const at of especie.composicion) {
        if (at.cantidadAtomos <= 0) {
            errores.push(`Subíndice de átomo inválido (${at.cantidadAtomos}) para el elemento "${at.simbolo}" en "${especie.formula}".`);
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: especie }
        : { esValido: false, errores };
}

export async function validarReaccionQuimicaAsync(
    reaccion: ReaccionQuimicaRaw
): Promise<ResultadoValidacion<ReaccionQuimicaRaw>> {
    // Simulación de procesamiento asíncrono de base de datos estequiométrica
    await new Promise((resolve) => setTimeout(resolve, 10));

    const errores: string[] = [];

    if (reaccion.reactivos.length === 0) {
        errores.push(`La reacción "${reaccion.nombre}" no contiene reactivos.`);
    }

    if (reaccion.productos.length === 0) {
        errores.push(`La reacción "${reaccion.nombre}" no contiene productos.`);
    }

    for (const r of reaccion.reactivos) {
        const resR = validarEspecieQuimica(r);
        if (!resR.esValido) {
            errores.push(...resR.errores);
        }
    }

    for (const p of reaccion.productos) {
        const resP = validarEspecieQuimica(p);
        if (!resP.esValido) {
            errores.push(...resP.errores);
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: reaccion }
        : { esValido: false, errores };
}

// 4. TRANSFORMACIÓN Y CÁLCULOS ESTEQUIOMÉTRICOS (reduce & Record)

export function calcularAtomosTotalesPorLado(
    especies: readonly EspecieQuimica[]
): Record<string, number> {
    return especies.reduce((acc, esp) => {
        for (const at of esp.composicion) {
            const atomosAportados = esp.coeficienteEstequiometrico * at.cantidadAtomos;
            acc[at.simbolo] = (acc[at.simbolo] ?? 0) + atomosAportados;
        }
        return acc;
    }, {} as Record<string, number>);
}

export function calcularMasaTotalGramos(especies: readonly EspecieQuimica[]): number {
    const masa = especies.reduce(
        (acc, esp) => acc + esp.coeficienteEstequiometrico * esp.masaMolarGramosMol,
        0
    );
    return Number(masa.toFixed(2));
}

export function formatearEcuacionQuimica(reaccion: ReaccionQuimicaRaw): string {
    const formatoReactivos = reaccion.reactivos
        .map((r) => (r.coeficienteEstequiometrico > 1 ? `${r.coeficienteEstequiometrico}${r.formula}` : r.formula))
        .join(' + ');

    const formatoProductos = reaccion.productos
        .map((p) => (p.coeficienteEstequiometrico > 1 ? `${p.coeficienteEstequiometrico}${p.formula}` : p.formula))
        .join(' + ');

    return `${formatoReactivos} ➔ ${formatoProductos}`;
}

export function analizarBalanceQuimico(reaccion: ReaccionQuimicaRaw): MetricasBalanceQuimico {
    const atomosReactivos = calcularAtomosTotalesPorLado(reaccion.reactivos);
    const atomosProductos = calcularAtomosTotalesPorLado(reaccion.productos);

    const todosElementos = Array.from(
        new Set([...Object.keys(atomosReactivos), ...Object.keys(atomosProductos)])
    );

    let todoBalanceado = true;
    const conteoPorElemento: Record<string, ConteoElemento> = {};

    for (const elem of todosElementos) {
        const cantR = atomosReactivos[elem] ?? 0;
        const cantP = atomosProductos[elem] ?? 0;
        const estaBal = cantR === cantP && cantR > 0;

        if (!estaBal) {
            todoBalanceado = false;
        }

        conteoPorElemento[elem] = {
            simbolo: elem,
            atomosReactivos: cantR,
            atomosProductos: cantP,
            estaBalanceado: estaBal
        };
    }

    const masaTotalReactivosGramos = calcularMasaTotalGramos(reaccion.reactivos);
    const masaTotalProductosGramos = calcularMasaTotalGramos(reaccion.productos);
    const conservacionMasaValida = Math.abs(masaTotalReactivosGramos - masaTotalProductosGramos) < 0.05;

    const estadoBalance: EstadoBalance = todoBalanceado && conservacionMasaValida
        ? 'Balanceado'
        : 'Desbalanceado';

    return {
        totalEspeciesReactivos: reaccion.reactivos.length,
        totalEspeciesProductos: reaccion.productos.length,
        masaTotalReactivosGramos,
        masaTotalProductosGramos,
        conservacionMasaValida,
        estadoBalance,
        conteoPorElemento
    };
}

export class ServicioBalanceQuimico {
    private readonly contenedor = new ContenedorReacciones<ReaccionQuimicaRaw>();

    public async procesarReaccionAsync(
        reaccionRaw: ReaccionQuimicaRaw
    ): Promise<ResumenBalanceQuimico> {
        const advertencias: string[] = [];
        const valRes = await validarReaccionQuimicaAsync(reaccionRaw);

        if (!valRes.esValido) {
            advertencias.push(...valRes.errores);
        } else {
            this.contenedor.agregar(valRes.datos);
        }

        const metricas = analizarBalanceQuimico(reaccionRaw);
        const ecuacionTexto = formatearEcuacionQuimica(reaccionRaw);

        if (metricas.estadoBalance === 'Desbalanceado') {
            advertencias.push(
                `La reacción quimica "${reaccionRaw.nombre}" se encuentra desbalanceada en sus átomos o conservación de masa.`
            );
        }

        return {
            reaccionId: reaccionRaw.id,
            codigoReaccion: reaccionRaw.codigoReaccion,
            nombreReaccion: reaccionRaw.nombre,
            ecuacionTexto,
            metricas,
            advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenBalance(resumen: ResumenBalanceQuimico, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` BALANCE QUÍMICO SIMPLE - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Reacción            : ${resumen.nombreReaccion}`);
    console.log(`Código Reacción     : ${resumen.codigoReaccion}`);
    console.log(`Ecuación Química    : ${resumen.ecuacionTexto}`);
    console.log(`Estado del Balance  : ${resumen.metricas.estadoBalance === 'Balanceado' ? ' BALANCEADO' : ' DESBALANCEADO'}`);
    console.log(`Masa Reactivos      : ${resumen.metricas.masaTotalReactivosGramos} g/mol`);
    console.log(`Masa Productos      : ${resumen.metricas.masaTotalProductosGramos} g/mol`);
    console.log(`Conservación Masa   : ${resumen.metricas.conservacionMasaValida ? 'Sí cumple Ley de Lavoisier' : 'No cumple'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REACCIÓN (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`CONTEO Y COMPARACIÓN DE ÁTOMOS POR ELEMENTO:`);
    console.table(
        Object.values(resumen.metricas.conteoPorElemento).map((c) => ({
            Elemento: c.simbolo,
            'Reactivos (Átomos)': c.atomosReactivos,
            'Productos (Átomos)': c.atomosProductos,
            Balanceado: c.estaBalanceado ? 'Sí' : 'No'
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite con Async/Await)

// --- CASO 1: Combustión Completa del Metano (CH4 + 2O2 ➔ CO2 + 2H2O) ---
const reaccionCombustionNormal: ReaccionQuimicaRaw = {
    id: 'rxn-01',
    codigoReaccion: 'RXN-CH4-01',
    nombre: 'Combustión Completa del Metano',
    tipo: 'Combustión',
    reactivos: [
        {
            id: 'esp-01',
            formula: 'CH4',
            nombreComun: 'Metano',
            coeficienteEstequiometrico: 1,
            composicion: [
                { simbolo: 'C', cantidadAtomos: 1 },
                { simbolo: 'H', cantidadAtomos: 4 }
            ],
            masaMolarGramosMol: 16.04
        },
        {
            id: 'esp-02',
            formula: 'O2',
            nombreComun: 'Oxígeno Molecular',
            coeficienteEstequiometrico: 2,
            composicion: [{ simbolo: 'O', cantidadAtomos: 2 }],
            masaMolarGramosMol: 32.0
        }
    ],
    productos: [
        {
            id: 'esp-03',
            formula: 'CO2',
            nombreComun: 'Dióxido de Carbono',
            coeficienteEstequiometrico: 1,
            composicion: [
                { simbolo: 'C', cantidadAtomos: 1 },
                { simbolo: 'O', cantidadAtomos: 2 }
            ],
            masaMolarGramosMol: 44.01
        },
        {
            id: 'esp-04',
            formula: 'H2O',
            nombreComun: 'Agua',
            coeficienteEstequiometrico: 2,
            composicion: [
                { simbolo: 'H', cantidadAtomos: 2 },
                { simbolo: 'O', cantidadAtomos: 1 }
            ],
            masaMolarGramosMol: 18.02
        }
    ]
};

// --- CASO 2: Formación Desbalanceada del Agua (H2 + O2 ➔ H2O) ---
const reaccionDesbalanceada: ReaccionQuimicaRaw = {
    id: 'rxn-99',
    codigoReaccion: 'RXN-H2O-FAIL',
    nombre: 'Síntesis del Agua (Desbalanceada)',
    tipo: 'Síntesis',
    reactivos: [
        {
            id: 'esp-05',
            formula: 'H2',
            nombreComun: 'Hidrógeno Gas',
            coeficienteEstequiometrico: 1,
            composicion: [{ simbolo: 'H', cantidadAtomos: 2 }],
            masaMolarGramosMol: 2.02
        },
        {
            id: 'esp-06',
            formula: 'O2',
            nombreComun: 'Oxígeno Gas',
            coeficienteEstequiometrico: 1,
            composicion: [{ simbolo: 'O', cantidadAtomos: 2 }],
            masaMolarGramosMol: 32.0
        }
    ],
    productos: [
        {
            id: 'esp-07',
            formula: 'H2O',
            nombreComun: 'Agua',
            coeficienteEstequiometrico: 1, // Falta 2H2O para balancear oxígeno
            composicion: [
                { simbolo: 'H', cantidadAtomos: 2 },
                { simbolo: 'O', cantidadAtomos: 1 }
            ],
            masaMolarGramosMol: 18.02
        }
    ]
};

async function ejecutarPruebas(): Promise<void> {
    const servicio = new ServicioBalanceQuimico();

    // Ejecución Caso 1
    const resumenNormal = await servicio.procesarReaccionAsync(reaccionCombustionNormal);
    mostrarResumenBalance(resumenNormal, 'Caso Normal - Combustión del Metano');

    // Ejecución Caso 2
    const resumenLimite = await servicio.procesarReaccionAsync(reaccionDesbalanceada);
    mostrarResumenBalance(resumenLimite, 'Caso Límite - Síntesis del Agua Desbalanceada');
}

// Iniciar pruebas asíncronas
ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));