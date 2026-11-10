
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Clases)

export type TecnicaDibujo =
    | 'Grafito'
    | 'Carboncillo'
    | 'Tinta'
    | 'Acuarela'
    | 'Pastel'
    | 'Digital'
    | 'Mixta';

export type EstiloDibujo =
    | 'Realismo'
    | 'ConceptArt'
    | 'AnimeManga'
    | 'Ilustracion'
    | 'Boceto'
    | 'Retrato';

export type EstadoObra =
    | 'EnProceso'
    | 'Completado'
    | 'EnExposicion'
    | 'Vendido'
    | 'Archivado';

export interface ObraDibujo {
    readonly id: string;
    readonly titulo: string;
    readonly artista: string;
    readonly tecnica: TecnicaDibujo;
    readonly estilo: EstiloDibujo;
    readonly horasInvertidas: number;
    readonly anioCreacion: number;
    readonly precioEstimadoUSD: number;
    readonly esOriginal: boolean;
    readonly estado: EstadoObra;
}

export interface PortafolioArtista {
    readonly id: string;
    readonly nombreArtista: string;
    readonly especialidad: string;
    readonly obras: readonly ObraDibujo[];
}

export interface MetricasPortafolio {
    readonly totalObras: number;
    readonly totalHorasInvertidas: number;
    readonly promedioHorasPorObra: number;
    readonly valorTotalEstimadoUSD: number;
    readonly precioPromedioUSD: number;
    readonly obraMasValiosa: ObraDibujo | null;
    readonly porcentajeCompletadas: number;
    readonly desglosePorTecnica: Readonly<Record<TecnicaDibujo, number>>;
    readonly desglosePorEstilo: Readonly<Record<EstiloDibujo, number>>;
}

export interface ResumenPortafolioDibujo {
    readonly portafolioId: string;
    readonly nombreArtista: string;
    readonly totalObrasValidas: number;
    readonly metricas: MetricasPortafolio;
    readonly obrasProcesadas: readonly ObraDibujo[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y CLASE DE PORTAFOLIO (Generics & Encapsulamiento)

export class ContenedorPortafolio<T extends { readonly id: string }> {
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

export function validarObra(obra: ObraDibujo): ResultadoValidacion<ObraDibujo> {
    const errores: string[] = [];

    if (obra.horasInvertidas <= 0 || obra.horasInvertidas > 1000) {
        errores.push(`Horas invertidas inválidas (${obra.horasInvertidas} hrs) en "${obra.titulo}".`);
    }

    if (obra.anioCreacion < 1900 || obra.anioCreacion > 2027) {
        errores.push(`Año de creación inválido (${obra.anioCreacion}) para "${obra.titulo}".`);
    }

    if (obra.precioEstimadoUSD < 0) {
        errores.push(`Precio estimado negativo ($${obra.precioEstimadoUSD} USD) en "${obra.titulo}".`);
    }

    if (obra.titulo.trim().length === 0) {
        errores.push('La obra de dibujo debe registrar un título válido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: obra }
        : { esValido: false, errores };
}

export function validarPortafolioRaw(portafolio: PortafolioArtista): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (portafolio.obras.length === 0) {
        advertencias.push(`El portafolio del artista "${portafolio.nombreArtista}" no contiene obras registradas.`);
    }

    for (const o of portafolio.obras) {
        if (idsVistos.has(o.id)) {
            advertencias.push(`Obra duplicada detectada por ID: ${o.id} (${o.titulo}).`);
        }
        idsVistos.add(o.id);
    }

    return advertencias;
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const TECNICAS_DIBUJO: readonly TecnicaDibujo[] = [
    'Grafito',
    'Carboncillo',
    'Tinta',
    'Acuarela',
    'Pastel',
    'Digital',
    'Mixta'
];

const ESTILOS_DIBUJO: readonly EstiloDibujo[] = [
    'Realismo',
    'ConceptArt',
    'AnimeManga',
    'Ilustracion',
    'Boceto',
    'Retrato'
];

export function calcularMetricasPortafolio(obras: readonly ObraDibujo[]): MetricasPortafolio {
    if (obras.length === 0) {
        const desgloseTecnicaVacio = TECNICAS_DIBUJO.reduce((acc, t) => {
            acc[t] = 0;
            return acc;
        }, {} as Record<TecnicaDibujo, number>);

        const desgloseEstiloVacio = ESTILOS_DIBUJO.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstiloDibujo, number>);

        return {
            totalObras: 0,
            totalHorasInvertidas: 0,
            promedioHorasPorObra: 0,
            valorTotalEstimadoUSD: 0,
            precioPromedioUSD: 0,
            obraMasValiosa: null,
            porcentajeCompletadas: 0,
            desglosePorTecnica: desgloseTecnicaVacio,
            desglosePorEstilo: desgloseEstiloVacio
        };
    }

    const totalHorasInvertidas = obras.reduce((acc, o) => acc + o.horasInvertidas, 0);
    const promedioHorasPorObra = Number((totalHorasInvertidas / obras.length).toFixed(1));

    const valorTotalEstimadoUSD = Number(
        obras.reduce((acc, o) => acc + o.precioEstimadoUSD, 0).toFixed(2)
    );

    const precioPromedioUSD = Number((valorTotalEstimadoUSD / obras.length).toFixed(2));

    const obrasCompletadasCount = obras.filter(
        (o) => o.estado === 'Completado' || o.estado === 'Vendido' || o.estado === 'EnExposicion'
    ).length;

    const porcentajeCompletadas = Number(((obrasCompletadasCount / obras.length) * 100).toFixed(1));

    const obraMasValiosa = [...obras].sort((a, b) => b.precioEstimadoUSD - a.precioEstimadoUSD)[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorTecnica = obras.reduce((acc, o) => {
        acc[o.tecnica] = (acc[o.tecnica] ?? 0) + 1;
        return acc;
    }, TECNICAS_DIBUJO.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TecnicaDibujo, number>));

    const desglosePorEstilo = obras.reduce((acc, o) => {
        acc[o.estilo] = (acc[o.estilo] ?? 0) + 1;
        return acc;
    }, ESTILOS_DIBUJO.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstiloDibujo, number>));

    return {
        totalObras: obras.length,
        totalHorasInvertidas,
        promedioHorasPorObra,
        valorTotalEstimadoUSD,
        precioPromedioUSD,
        obraMasValiosa,
        porcentajeCompletadas,
        desglosePorTecnica,
        desglosePorEstilo
    };
}

export class ServicioPortafolioDibujo {
    private readonly contenedor = new ContenedorPortafolio<ObraDibujo>();
    private readonly advertencias: string[] = [];

    constructor(private readonly portafolioRaw: PortafolioArtista) { }

    public procesarPortafolio(): ResumenPortafolioDibujo {
        this.advertencias.push(...validarPortafolioRaw(this.portafolioRaw));

        for (const rawObra of this.portafolioRaw.obras) {
            const resVal = validarObra(rawObra);

            if (!resVal.esValido) {
                this.advertencias.push(...resVal.errores);
            } else {
                const agregado = this.contenedor.agregar(resVal.datos);
                if (!agregado) {
                    this.advertencias.push(`No se pudo agregar la obra duplicada por ID: ${rawObra.id}`);
                }
            }
        }

        const obrasValidas = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasPortafolio(obrasValidas);

        return {
            portafolioId: this.portafolioRaw.id,
            nombreArtista: this.portafolioRaw.nombreArtista,
            totalObrasValidas: obrasValidas.length,
            metricas,
            obrasProcesadas: obrasValidas,
            advertencias: this.advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenPortafolio(resumen: ResumenPortafolioDibujo, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` PORTAFOLIO DE DIBUJO - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Artista             : ${resumen.nombreArtista}`);
    console.log(`Obras Validadas     : ${resumen.totalObrasValidas}`);
    console.log(`Horas Totales       : ${resumen.metricas.totalHorasInvertidas} hrs (${resumen.metricas.promedioHorasPorObra} hrs/obra)`);
    console.log(`Valor Estimado Total: $${resumen.metricas.valorTotalEstimadoUSD.toLocaleString()} USD`);
    console.log(`Precio Promedio Obra: $${resumen.metricas.precioPromedioUSD.toLocaleString()} USD`);
    console.log(`Efectividad Obra    : ${resumen.metricas.porcentajeCompletadas}% completadas / finalizadas`);
    console.log(`Obra Más Valiosa    : ${resumen.metricas.obraMasValiosa ? `"${resumen.metricas.obraMasValiosa.titulo}" ($${resumen.metricas.obraMasValiosa.precioEstimadoUSD} USD - ${resumen.metricas.obraMasValiosa.tecnica})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REGISTRO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE OBRAS POR TÉCNICA:`);
    Object.entries(resumen.metricas.desglosePorTecnica).forEach(([tecnica, cantidad]) => {
        console.log(`   - ${tecnica.padEnd(14)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.obrasProcesadas.map((o) => ({
            ID: o.id,
            Título: o.titulo,
            Técnica: o.tecnica,
            Estilo: o.estilo,
            'Año': o.anioCreacion,
            Horas: `${o.horasInvertidas} hrs`,
            Precio: `$${o.precioEstimadoUSD} USD`,
            Original: o.esOriginal ? 'Sí' : 'No',
            Estado: o.estado
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const o1: ObraDibujo = {
    id: 'art-01',
    titulo: 'Estudio de Anatomía y Sombras',
    artista: 'José Rodríguez',
    tecnica: 'Grafito',
    estilo: 'Realismo',
    horasInvertidas: 14,
    anioCreacion: 2026,
    precioEstimadoUSD: 350,
    esOriginal: true,
    estado: 'Completado'
};

const o2: ObraDibujo = {
    id: 'art-02',
    titulo: 'Cyberpunk Sentinel Character Design',
    artista: 'José Rodríguez',
    tecnica: 'Digital',
    estilo: 'ConceptArt',
    horasInvertidas: 28,
    anioCreacion: 2026,
    precioEstimadoUSD: 850,
    esOriginal: true,
    estado: 'Vendido'
};

const o3: ObraDibujo = {
    id: 'art-03',
    titulo: 'Retrato en Sombras de Luz',
    artista: 'José Rodríguez',
    tecnica: 'Carboncillo',
    estilo: 'Retrato',
    horasInvertidas: 10,
    anioCreacion: 2025,
    precioEstimadoUSD: 280,
    esOriginal: true,
    estado: 'EnExposicion'
};

// --- CASO 1: Portafolio Digital & Tradicional de Arte (Caso Normal) ---
const portafolioNormal: PortafolioArtista = {
    id: 'PORT-JR-2026',
    nombreArtista: 'José Rodríguez',
    especialidad: 'Concept Art & Realismo Tradicional',
    obras: [o1, o2, o3]
};

// --- CASO 2: Horas Negativas, Precio Inválido y Obra Duplicada (Caso Límite) ---
const obraCorrupta: ObraDibujo = {
    id: 'art-99',
    titulo: 'Boceto Incompleto Error',
    artista: 'José Rodríguez',
    tecnica: 'Tinta',
    estilo: 'Boceto',
    horasInvertidas: -5, // Horas negativas -> Inválido
    anioCreacion: 1850, // Año < 1900 -> Inválido
    precioEstimadoUSD: -100, // Precio negativo -> Inválido
    esOriginal: false,
    estado: 'EnProceso'
};

const portafolioLimiteCorrupto: PortafolioArtista = {
    id: 'PORT-FAIL-02',
    nombreArtista: 'José Rodríguez',
    especialidad: 'Pruebas Límite',
    obras: [
        o1,
        obraCorrupta,
        o1 // ID duplicado
    ]
};

// Ejecución Caso 1
const servicioNormal = new ServicioPortafolioDibujo(portafolioNormal);
const resumenNormal = servicioNormal.procesarPortafolio();
mostrarResumenPortafolio(resumenNormal, 'Caso Normal - Portafolio de José Rodríguez');

// Ejecución Caso 2
const servicioLimite = new ServicioPortafolioDibujo(portafolioLimiteCorrupto);
const resumenLimite = servicioLimite.procesarPortafolio();
mostrarResumenPortafolio(resumenLimite, 'Caso Límite - Horas Negativas y Datos Corruptos');