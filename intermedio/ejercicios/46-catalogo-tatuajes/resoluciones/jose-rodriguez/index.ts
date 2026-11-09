
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Clases)

export type EstiloTatuaje =
    | 'Tradicional'
    | 'Neotradicional'
    | 'Realismo'
    | 'Blackwork'
    | 'Acuarela'
    | 'Geometria'
    | 'Japones';

export type NivelDolorZona = 'Bajo' | 'Moderado' | 'Alto' | 'Extremo';

export type ZonaCuerpo =
    | 'Brazo'
    | 'Antebrazo'
    | 'Espalda'
    | 'Pecho'
    | 'Costillas'
    | 'Pierna'
    | 'Cuello';

export interface DisenoTatuaje {
    readonly id: string;
    readonly titulo: string;
    readonly artista: string;
    readonly estilo: EstiloTatuaje;
    readonly tiempoEstimadoHoras: number;
    readonly precioUSD: number;
    readonly zonaSugerida: ZonaCuerpo;
    readonly nivelDolor: NivelDolorZona;
    readonly esPersonalizado: boolean;
    readonly requiereVariasSesiones: boolean;
}

export interface CatalogoEstilosTatuaje {
    readonly id: string;
    readonly nombreEstudio: string;
    readonly ciudad: string;
    readonly disenos: readonly DisenoTatuaje[];
}

export interface MetricasCatalogoTatuajes {
    readonly totalDisenos: number;
    readonly totalHorasEstimadas: number;
    readonly precioPromedioUSD: number;
    readonly tiempoPromedioHoras: number;
    readonly disenoMasCostoso: DisenoTatuaje | null;
    readonly porcentajePersonalizados: number;
    readonly desglosePorEstilo: Readonly<Record<EstiloTatuaje, number>>;
    readonly desglosePorZona: Readonly<Record<ZonaCuerpo, number>>;
}

export interface ResumenCatalogoTatuajes {
    readonly estudioId: string;
    readonly nombreEstudio: string;
    readonly totalDisenosValidos: number;
    readonly metricas: MetricasCatalogoTatuajes;
    readonly disenosProcesados: readonly DisenoTatuaje[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y CLASE DE CATÁLOGO (Generics & Encapsulamiento)

export class ContenedorCatalogo<T extends { readonly id: string }> {
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

export function validarDiseno(diseno: DisenoTatuaje): ResultadoValidacion<DisenoTatuaje> {
    const errores: string[] = [];

    if (diseno.tiempoEstimadoHoras <= 0 || diseno.tiempoEstimadoHoras > 60) {
        errores.push(`Tiempo estimado de sesión inválido (${diseno.tiempoEstimadoHoras} hrs) para "${diseno.titulo}".`);
    }

    if (diseno.precioUSD <= 0) {
        errores.push(`Precio inválido ($${diseno.precioUSD} USD) en el diseño "${diseno.titulo}".`);
    }

    if (diseno.titulo.trim().length === 0) {
        errores.push('El diseño de tatuaje debe tener un título válido.');
    }

    if (diseno.artista.trim().length === 0) {
        errores.push(`El diseño "${diseno.titulo}" debe tener un artista asignado.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: diseno }
        : { esValido: false, errores };
}

export function validarCatalogoRaw(catalogo: CatalogoEstilosTatuaje): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (catalogo.disenos.length === 0) {
        advertencias.push(`El catálogo del estudio "${catalogo.nombreEstudio}" no registra diseños.`);
    }

    for (const d of catalogo.disenos) {
        if (idsVistos.has(d.id)) {
            advertencias.push(`Diseño duplicado detectado por ID: ${d.id} (${d.titulo}).`);
        }
        idsVistos.add(d.id);
    }

    return advertencias;
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const ESTILOS_TATUAJE: readonly EstiloTatuaje[] = [
    'Tradicional',
    'Neotradicional',
    'Realismo',
    'Blackwork',
    'Acuarela',
    'Geometria',
    'Japones'
];

const ZONAS_CUERPO: readonly ZonaCuerpo[] = [
    'Brazo',
    'Antebrazo',
    'Espalda',
    'Pecho',
    'Costillas',
    'Pierna',
    'Cuello'
];

export function calcularMetricasCatalogo(disenos: readonly DisenoTatuaje[]): MetricasCatalogoTatuajes {
    if (disenos.length === 0) {
        const desgloseEstiloVacio = ESTILOS_TATUAJE.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstiloTatuaje, number>);

        const desgloseZonaVacio = ZONAS_CUERPO.reduce((acc, z) => {
            acc[z] = 0;
            return acc;
        }, {} as Record<ZonaCuerpo, number>);

        return {
            totalDisenos: 0,
            totalHorasEstimadas: 0,
            precioPromedioUSD: 0,
            tiempoPromedioHoras: 0,
            disenoMasCostoso: null,
            porcentajePersonalizados: 0,
            desglosePorEstilo: desgloseEstiloVacio,
            desglosePorZona: desgloseZonaVacio
        };
    }

    const totalHorasEstimadas = disenos.reduce((acc, d) => acc + d.tiempoEstimadoHoras, 0);
    const tiempoPromedioHoras = Number((totalHorasEstimadas / disenos.length).toFixed(1));

    const sumaPrecios = disenos.reduce((acc, d) => acc + d.precioUSD, 0);
    const precioPromedioUSD = Number((sumaPrecios / disenos.length).toFixed(2));

    const personalizadosCount = disenos.filter((d) => d.esPersonalizado).length;
    const porcentajePersonalizados = Number(((personalizadosCount / disenos.length) * 100).toFixed(1));

    const disenoMasCostoso = [...disenos].sort((a, b) => b.precioUSD - a.precioUSD)[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorEstilo = disenos.reduce((acc, d) => {
        acc[d.estilo] = (acc[d.estilo] ?? 0) + 1;
        return acc;
    }, ESTILOS_TATUAJE.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstiloTatuaje, number>));

    const desglosePorZona = disenos.reduce((acc, d) => {
        acc[d.zonaSugerida] = (acc[d.zonaSugerida] ?? 0) + 1;
        return acc;
    }, ZONAS_CUERPO.reduce((acc, z) => ({ ...acc, [z]: 0 }), {} as Record<ZonaCuerpo, number>));

    return {
        totalDisenos: disenos.length,
        totalHorasEstimadas,
        precioPromedioUSD,
        tiempoPromedioHoras,
        disenoMasCostoso,
        porcentajePersonalizados,
        desglosePorEstilo,
        desglosePorZona
    };
}

export class ServicioCatalogoTatuajes {
    private readonly contenedor = new ContenedorCatalogo<DisenoTatuaje>();
    private readonly advertencias: string[] = [];

    constructor(private readonly catalogoRaw: CatalogoEstilosTatuaje) { }

    public procesarCatalogo(): ResumenCatalogoTatuajes {
        this.advertencias.push(...validarCatalogoRaw(this.catalogoRaw));

        for (const rawDiseno of this.catalogoRaw.disenos) {
            const resVal = validarDiseno(rawDiseno);

            if (!resVal.esValido) {
                this.advertencias.push(...resVal.errores);
            } else {
                const agregado = this.contenedor.agregar(resVal.datos);
                if (!agregado) {
                    this.advertencias.push(`No se pudo agregar el diseño duplicado por ID: ${rawDiseno.id}`);
                }
            }
        }

        const disenosValidos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasCatalogo(disenosValidos);

        return {
            estudioId: this.catalogoRaw.id,
            nombreEstudio: this.catalogoRaw.nombreEstudio,
            totalDisenosValidos: disenosValidos.length,
            metricas,
            disenosProcesados: disenosValidos,
            advertencias: this.advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenCatalogo(resumen: ResumenCatalogoTatuajes, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` CATÁLOGO DE ESTILOS TATTOO - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Estudio Tatuaje     : ${resumen.nombreEstudio}`);
    console.log(`Diseños Validados   : ${resumen.totalDisenosValidos}`);
    console.log(`Precio Promedio     : $${resumen.metricas.precioPromedioUSD.toLocaleString()} USD`);
    console.log(`Tiempo Promedio     : ${resumen.metricas.tiempoPromedioHoras} hrs/sesión`);
    console.log(`Personalizados      : ${resumen.metricas.porcentajePersonalizados}% del catálogo`);
    console.log(`Diseño Más Costoso  : ${resumen.metricas.disenoMasCostoso ? `"${resumen.metricas.disenoMasCostoso.titulo}" ($${resumen.metricas.disenoMasCostoso.precioUSD} USD - ${resumen.metricas.disenoMasCostoso.estilo})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE CATÁLOGO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE DISEÑOS POR ESTILO:`);
    Object.entries(resumen.metricas.desglosePorEstilo).forEach(([estilo, cantidad]) => {
        console.log(`   - ${estilo.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.disenosProcesados.map((d) => ({
            ID: d.id,
            Título: d.titulo,
            Artista: d.artista,
            Estilo: d.estilo,
            Zona: d.zonaSugerida,
            Dolor: d.nivelDolor,
            Tiempo: `${d.tiempoEstimadoHoras} hrs`,
            Precio: `$${d.precioUSD} USD`,
            Custom: d.esPersonalizado ? 'Sí' : 'No'
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const d1: DisenoTatuaje = {
    id: 'tat-01',
    titulo: 'Dragón Japonés Irezumi',
    artista: 'José Rodríguez',
    estilo: 'Japones',
    tiempoEstimadoHoras: 18,
    precioUSD: 1200,
    zonaSugerida: 'Espalda',
    nivelDolor: 'Alto',
    esPersonalizado: true,
    requiereVariasSesiones: true
};

const d2: DisenoTatuaje = {
    id: 'tat-02',
    titulo: 'Pantera Clásica Flash',
    artista: 'Carlos Mendoza',
    estilo: 'Tradicional',
    tiempoEstimadoHoras: 3,
    precioUSD: 250,
    zonaSugerida: 'Antebrazo',
    nivelDolor: 'Bajo',
    esPersonalizado: false,
    requiereVariasSesiones: false
};

const d3: DisenoTatuaje = {
    id: 'tat-03',
    titulo: 'Retrato Realista Neotradicional',
    artista: 'José Rodríguez',
    estilo: 'Neotradicional',
    tiempoEstimadoHoras: 8,
    precioUSD: 650,
    zonaSugerida: 'Brazo',
    nivelDolor: 'Moderado',
    esPersonalizado: true,
    requiereVariasSesiones: true
};

// --- CASO 1: Catálogo de Galería de Arte Tattoo (Caso Normal) ---
const catalogoNormal: CatalogoEstilosTatuaje = {
    id: 'STUDIO-GT-01',
    nombreEstudio: 'Madness Ink Studio',
    ciudad: 'Ciudad de Guatemala',
    disenos: [d1, d2, d3]
};

// --- CASO 2: Precio Negativo, Horas Fuera de Rango y Diseño Duplicado (Caso Límite) ---
const disenoCorrupto: DisenoTatuaje = {
    id: 'tat-99',
    titulo: 'Diseño Invalido',
    artista: '', // Sin artista -> Invalido
    estilo: 'Blackwork',
    tiempoEstimadoHoras: 0, // Horas 0 -> Invalido
    precioUSD: -100, // Precio negativo -> Invalido
    zonaSugerida: 'Costillas',
    nivelDolor: 'Extremo',
    esPersonalizado: false,
    requiereVariasSesiones: false
};

const catalogoLimiteCorrupto: CatalogoEstilosTatuaje = {
    id: 'STUDIO-FAIL-02',
    nombreEstudio: 'Estudio Con Errores',
    ciudad: 'Desconocida',
    disenos: [
        d2,
        disenoCorrupto,
        d2 // ID duplicado
    ]
};

// Ejecución Caso 1
const servicioNormal = new ServicioCatalogoTatuajes(catalogoNormal);
const resumenNormal = servicioNormal.procesarCatalogo();
mostrarResumenCatalogo(resumenNormal, 'Caso Normal - Madness Ink Studio');

// Ejecución Caso 2
const servicioLimite = new ServicioCatalogoTatuajes(catalogoLimiteCorrupto);
const resumenLimite = servicioLimite.procesarCatalogo();
mostrarResumenCatalogo(resumenLimite, 'Caso Límite - Precio Negativo y Horas Inválidas');