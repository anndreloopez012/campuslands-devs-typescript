
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Clases)

export type DisciplinaArquitectura =
    | 'Arquitectura'
    | 'Estructura'
    | 'InstalacionesMEP'
    | 'Interiorismo'
    | 'Paisajismo'
    | 'Urbanismo';

export type EstadoRevision =
    | 'Borrador'
    | 'EnRevision'
    | 'Aprobado'
    | 'Rechazado'
    | 'Observado';

export type NivelLOD =
    | 'LOD100'
    | 'LOD200'
    | 'LOD300'
    | 'LOD350'
    | 'LOD400'
    | 'LOD500';

export interface Plano3D {
    readonly id: string;
    readonly codigoPlano: string;
    readonly titulo: string;
    readonly disciplina: DisciplinaArquitectura;
    readonly version: number;
    readonly lod: NivelLOD;
    readonly areaSuperficieM2: number;
    readonly conteoElementosBIM: number;
    readonly estado: EstadoRevision;
    readonly esModeloFederado: boolean;
    readonly horasDisenoInvertidas: number;
}

export interface ProyectoArquitectura3D {
    readonly id: string;
    readonly codigoProyecto: string;
    readonly nombreProyecto: string;
    readonly cliente: string;
    readonly presupuestoHoras: number;
    readonly planos: readonly Plano3D[];
}

export interface MetricasControlPlanos {
    readonly totalPlanos: number;
    readonly planosAprobadosCount: number;
    readonly porcentajeAprobacion: number;
    readonly horasTotalesDiseno: number;
    readonly areaTotalModeladaM2: number;
    readonly totalElementosBIM: number;
    readonly planoMasComplejo: Plano3D | null;
    readonly desglosePorDisciplina: Readonly<Record<DisciplinaArquitectura, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoRevision, number>>;
}

export interface ResumenControlPlanos {
    readonly proyectoId: string;
    readonly codigoProyecto: string;
    readonly nombreProyecto: string;
    readonly totalPlanosValidos: number;
    readonly metricas: MetricasControlPlanos;
    readonly planosProcesados: readonly Plano3D[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y CLASE DE CONTROL (Generics & Encapsulamiento)

export class ContenedorPlanos3D<T extends { readonly id: string; readonly codigoPlano: string }> {
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

export function validarPlano3D(plano: Plano3D): ResultadoValidacion<Plano3D> {
    const errores: string[] = [];

    if (plano.version <= 0) {
        errores.push(`Número de versión inválido (v${plano.version}) en el plano "${plano.titulo}".`);
    }

    if (plano.areaSuperficieM2 <= 0) {
        errores.push(`Área de superficie inválida (${plano.areaSuperficieM2} m²) en el plano "${plano.titulo}".`);
    }

    if (plano.conteoElementosBIM <= 0) {
        errores.push(`Conteo de elementos BIM inválido (${plano.conteoElementosBIM}) en "${plano.titulo}".`);
    }

    if (plano.horasDisenoInvertidas <= 0) {
        errores.push(`Horas de diseño inválidas (${plano.horasDisenoInvertidas} hrs) en "${plano.titulo}".`);
    }

    if (plano.codigoPlano.trim().length === 0) {
        errores.push('El plano 3D debe registrar un código de plano válido.');
    }

    if (plano.titulo.trim().length === 0) {
        errores.push(`El plano con código "${plano.codigoPlano}" debe registrar un título válido.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: plano }
        : { esValido: false, errores };
}

export function validarProyectoRaw(proyecto: ProyectoArquitectura3D): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();
    const codigosVistos = new Set<string>();

    if (proyecto.presupuestoHoras <= 0) {
        advertencias.push(`Presupuesto de horas inválido (${proyecto.presupuestoHoras} hrs) en "${proyecto.nombreProyecto}".`);
    }

    if (proyecto.planos.length === 0) {
        advertencias.push(`El proyecto "${proyecto.nombreProyecto}" no contiene planos 3D registrados.`);
    }

    for (const p of proyecto.planos) {
        if (idsVistos.has(p.id)) {
            advertencias.push(`Plano 3D duplicado detectado por ID: ${p.id} (${p.titulo}).`);
        }
        if (codigosVistos.has(p.codigoPlano)) {
            advertencias.push(`Código de plano duplicado detectado: ${p.codigoPlano}.`);
        }
        idsVistos.add(p.id);
        codigosVistos.add(p.codigoPlano);
    }

    return advertencias;
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const DISCIPLINAS_ARQUITECTURA: readonly DisciplinaArquitectura[] = [
    'Arquitectura',
    'Estructura',
    'InstalacionesMEP',
    'Interiorismo',
    'Paisajismo',
    'Urbanismo'
];

const ESTADOS_REVISION: readonly EstadoRevision[] = [
    'Borrador',
    'EnRevision',
    'Aprobado',
    'Rechazado',
    'Observado'
];

export function calcularMetricasPlanos(planos: readonly Plano3D[]): MetricasControlPlanos {
    if (planos.length === 0) {
        const desgloseDisVacio = DISCIPLINAS_ARQUITECTURA.reduce((acc, d) => {
            acc[d] = 0;
            return acc;
        }, {} as Record<DisciplinaArquitectura, number>);

        const desgloseEstVacio = ESTADOS_REVISION.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoRevision, number>);

        return {
            totalPlanos: 0,
            planosAprobadosCount: 0,
            porcentajeAprobacion: 0,
            horasTotalesDiseno: 0,
            areaTotalModeladaM2: 0,
            totalElementosBIM: 0,
            planoMasComplejo: null,
            desglosePorDisciplina: desgloseDisVacio,
            desglosePorEstado: desgloseEstVacio
        };
    }

    const aprobados = planos.filter((p) => p.estado === 'Aprobado');
    const planosAprobadosCount = aprobados.length;
    const porcentajeAprobacion = Number(((planosAprobadosCount / planos.length) * 100).toFixed(1));

    const horasTotalesDiseno = Number(
        planos.reduce((acc, p) => acc + p.horasDisenoInvertidas, 0).toFixed(1)
    );

    const areaTotalModeladaM2 = Number(
        planos.reduce((acc, p) => acc + p.areaSuperficieM2, 0).toFixed(2)
    );

    const totalElementosBIM = planos.reduce((acc, p) => acc + p.conteoElementosBIM, 0);

    const planoMasComplejo = [...planos].sort(
        (a, b) => b.conteoElementosBIM - a.conteoElementosBIM
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorDisciplina = planos.reduce((acc, p) => {
        acc[p.disciplina] = (acc[p.disciplina] ?? 0) + 1;
        return acc;
    }, DISCIPLINAS_ARQUITECTURA.reduce((acc, d) => ({ ...acc, [d]: 0 }), {} as Record<DisciplinaArquitectura, number>));

    const desglosePorEstado = planos.reduce((acc, p) => {
        acc[p.estado] = (acc[p.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_REVISION.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoRevision, number>));

    return {
        totalPlanos: planos.length,
        planosAprobadosCount,
        porcentajeAprobacion,
        horasTotalesDiseno,
        areaTotalModeladaM2,
        totalElementosBIM,
        planoMasComplejo,
        desglosePorDisciplina,
        desglosePorEstado
    };
}

export class ServicioGestionPlanos3D {
    private readonly contenedor = new ContenedorPlanos3D<Plano3D>();
    private readonly advertencias: string[] = [];

    constructor(private readonly proyectoRaw: ProyectoArquitectura3D) { }

    public procesarPlanos(): ResumenControlPlanos {
        this.advertencias.push(...validarProyectoRaw(this.proyectoRaw));

        for (const rawPlano of this.proyectoRaw.planos) {
            const resVal = validarPlano3D(rawPlano);

            if (!resVal.esValido) {
                this.advertencias.push(...resVal.errores);
            } else {
                const agregado = this.contenedor.agregar(resVal.datos);
                if (!agregado) {
                    this.advertencias.push(`No se pudo agregar el plano duplicado por ID: ${rawPlano.id}`);
                }
            }
        }

        const planosValidos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasPlanos(planosValidos);

        if (metricas.horasTotalesDiseno > this.proyectoRaw.presupuestoHoras) {
            this.advertencias.push(
                `Exceso de horas: Las horas invertidas (${metricas.horasTotalesDiseno} hrs) superan el presupuesto asignado (${this.proyectoRaw.presupuestoHoras} hrs).`
            );
        }

        const planosRechazados = planosValidos.filter((p) => p.estado === 'Rechazado');
        if (planosRechazados.length > 0) {
            this.advertencias.push(
                `Alerta de revisión: Se registraron ${planosRechazados.length} plano(s) 3D en estado Rechazado.`
            );
        }

        return {
            proyectoId: this.proyectoRaw.id,
            codigoProyecto: this.proyectoRaw.codigoProyecto,
            nombreProyecto: this.proyectoRaw.nombreProyecto,
            totalPlanosValidos: planosValidos.length,
            metricas,
            planosProcesados: planosValidos,
            advertencias: this.advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenControlPlanos(resumen: ResumenControlPlanos, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` CONTROL DE PLANOS 3D - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Proyecto 3D         : ${resumen.nombreProyecto}`);
    console.log(`Código Proyecto     : ${resumen.codigoProyecto}`);
    console.log(`Planos Validados    : ${resumen.totalPlanosValidos}`);
    console.log(`Área Total Modelada : ${resumen.metricas.areaTotalModeladaM2.toLocaleString()} m²`);
    console.log(`Elementos BIM       : ${resumen.metricas.totalElementosBIM.toLocaleString()} objetos`);
    console.log(`Horas Totales Diseño: ${resumen.metricas.horasTotalesDiseno} hrs`);
    console.log(`Porcentaje Aprobación: ${resumen.metricas.planosAprobadosCount} de ${resumen.metricas.totalPlanos} (${resumen.metricas.porcentajeAprobacion}%)`);
    console.log(`Plano Más Complejo  : ${resumen.metricas.planoMasComplejo ? `"${resumen.metricas.planoMasComplejo.titulo}" (${resumen.metricas.planoMasComplejo.conteoElementosBIM} objetos BIM - ${resumen.metricas.planoMasComplejo.lod})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REVISIÓN (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE PLANOS POR DISCIPLINA:`);
    Object.entries(resumen.metricas.desglosePorDisciplina).forEach(([disciplina, cantidad]) => {
        console.log(`   - ${disciplina.padEnd(18)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.planosProcesados.map((p) => ({
            ID: p.id,
            Código: p.codigoPlano,
            Título: p.titulo,
            Disciplina: p.disciplina,
            LOD: p.lod,
            Versión: `v${p.version}`,
            'Área M²': `${p.areaSuperficieM2} m²`,
            'BIM Objs': p.conteoElementosBIM,
            Federado: p.esModeloFederado ? 'Sí' : 'No',
            Estado: p.estado
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const p1: Plano3D = {
    id: 'dwg-01',
    codigoPlano: 'ARQ-N1-001',
    titulo: 'Planta Arquitectónica Nivel 1',
    disciplina: 'Arquitectura',
    version: 3,
    lod: 'LOD350',
    areaSuperficieM2: 1250.5,
    conteoElementosBIM: 3400,
    estado: 'Aprobado',
    esModeloFederado: true,
    horasDisenoInvertidas: 45
};

const p2: Plano3D = {
    id: 'dwg-02',
    codigoPlano: 'EST-FOC-002',
    titulo: 'Cimentación y Columnas Principales',
    disciplina: 'Estructura',
    version: 2,
    lod: 'LOD400',
    areaSuperficieM2: 1400.0,
    conteoElementosBIM: 5200,
    estado: 'Aprobado',
    esModeloFederado: true,
    horasDisenoInvertidas: 60
};

const p3: Plano3D = {
    id: 'dwg-03',
    codigoPlano: 'MEP-HVAC-003',
    titulo: 'Ductos HVAC y Climatización Central',
    disciplina: 'InstalacionesMEP',
    version: 1,
    lod: 'LOD300',
    areaSuperficieM2: 980.0,
    conteoElementosBIM: 2800,
    estado: 'EnRevision',
    esModeloFederado: false,
    horasDisenoInvertidas: 35
};

// --- CASO 1: Proyecto Complejo Residencial Torres del Valle (Caso Normal) ---
const proyectoNormal: ProyectoArquitectura3D = {
    id: 'PROJ-BIM-2026',
    codigoProyecto: 'TORRES-VALLE-01',
    nombreProyecto: 'Complejo Residencial Torres del Valle',
    cliente: 'Desarrolladora Urbana S.A.',
    presupuestoHoras: 200,
    planos: [p1, p2, p3]
};

// --- CASO 2: Versión Inválida, Área Negativa y Código Duplicado (Caso Límite) ---
const planoCorrupto: Plano3D = {
    id: 'dwg-99',
    codigoPlano: 'ARQ-ERR-999',
    titulo: 'Plano De Pruebas Corrupto',
    disciplina: 'Urbanismo',
    version: 0, // Versión 0 -> Inválido
    lod: 'LOD100',
    areaSuperficieM2: -200, // Área negativa -> Inválido
    conteoElementosBIM: 0, // BIM objetos 0 -> Inválido
    estado: 'Rechazado', // Provocará alerta de plano rechazado
    esModeloFederado: false,
    horasDisenoInvertidas: -10 // Horas negativas -> Inválido
};

const proyectoLimiteCorrupto: ProyectoArquitectura3D = {
    id: 'PROJ-FAIL-02',
    codigoProyecto: 'TORRES-FAIL-02',
    nombreProyecto: 'Proyecto Con Inconsistencias BIM',
    cliente: 'Cliente Prueba Límite',
    presupuestoHoras: 50, // Presupuesto bajo que provocará sobrecosto de horas
    planos: [
        p1,
        planoCorrupto,
        p1 // ID y Código duplicado
    ]
};

// Ejecución Caso 1
const servicioNormal = new ServicioGestionPlanos3D(proyectoNormal);
const resumenNormal = servicioNormal.procesarPlanos();
mostrarResumenControlPlanos(resumenNormal, 'Caso Normal - Complejo Residencial Torres del Valle');

// Ejecución Caso 2
const servicioLimite = new ServicioGestionPlanos3D(proyectoLimiteCorrupto);
const resumenLimite = servicioLimite.procesarPlanos();
mostrarResumenControlPlanos(resumenLimite, 'Caso Límite - Datos Corruptos y Exceso de Horas');