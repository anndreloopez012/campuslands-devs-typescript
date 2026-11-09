
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Clases)

export type CategoriaPrenda =
    | 'Superior'
    | 'Inferior'
    | 'Calzado'
    | 'Abrigo'
    | 'Accesorio';

export type CondicionClimatica =
    | 'Soleado'
    | 'Lluvioso'
    | 'Nublado'
    | 'Nieve'
    | 'VientoFuerte';

export type EstiloOutfit =
    | 'Casual'
    | 'Formal'
    | 'Deportivo'
    | 'SmartCasual'
    | 'Urbano';

export interface PrendaRopa {
    readonly id: string;
    readonly nombre: string;
    readonly categoria: CategoriaPrenda;
    readonly temperaturaMinimaC: number;
    readonly temperaturaMaximaC: number;
    readonly esImpermeable: boolean;
    readonly nivelNivelAislamiento: number; // 1 (Muy ligero) a 5 (Extremo)
    readonly estilo: EstiloOutfit;
}

export interface CondicionTiempoActual {
    readonly ciudad: string;
    readonly temperaturaC: number;
    readonly condicion: CondicionClimatica;
    readonly probabilidadLluviaPct: number;
    readonly velocidadVientoKmH: number;
}

export interface RecomendacionOutfit {
    readonly id: string;
    readonly codigoOutfit: string;
    readonly prendas: readonly PrendaRopa[];
    readonly tiempo: CondicionTiempoActual;
    readonly estiloObjetivo: EstiloOutfit;
    readonly puntajeAdecuacion: number; // 0 a 100
    readonly justificacion: readonly string[];
}

export interface MetricasRecomendacionesOutfit {
    readonly totalPrendasGuardarropa: number;
    readonly totalOutfitsGenerados: number;
    readonly puntajePromedioAdecuacion: number;
    readonly outfitMejorCalificado: RecomendacionOutfit | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaPrenda, number>>;
    readonly desglosePorEstilo: Readonly<Record<EstiloOutfit, number>>;
}

export interface ResumenOutfitClima {
    readonly usuarioNombre: string;
    readonly totalPrendasValidas: number;
    readonly metricas: MetricasRecomendacionesOutfit;
    readonly outfitsProcesados: readonly RecomendacionOutfit[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y CLASE DE ARMARIO (Generics & Encapsulamiento)

export class ArmarioGuardarropa<T extends { readonly id: string }> {
    private readonly prendas: Map<string, T> = new Map();

    public agregar(item: T): boolean {
        if (this.prendas.has(item.id)) {
            return false;
        }
        this.prendas.set(item.id, item);
        return true;
    }

    public obtenerPorId(id: string): T | undefined {
        return this.prendas.get(id);
    }

    public obtenerTodas(): readonly T[] {
        return Array.from(this.prendas.values());
    }

    public existe(id: string): boolean {
        return this.prendas.has(id);
    }

    public obtenerTamano(): number {
        return this.prendas.size;
    }
}

// 3. VALIDACIONES Y REGLAS DE NEGOCIO

export function validarPrenda(prenda: PrendaRopa): ResultadoValidacion<PrendaRopa> {
    const errores: string[] = [];

    if (prenda.temperaturaMinimaC < -40 || prenda.temperaturaMinimaC > 50) {
        errores.push(`Temperatura minima fuera de rango (${prenda.temperaturaMinimaC}°C) en "${prenda.nombre}".`);
    }

    if (prenda.temperaturaMaximaC < prenda.temperaturaMinimaC) {
        errores.push(
            `Inconsistencia en "${prenda.nombre}": Temperatura maxima (${prenda.temperaturaMaximaC}°C) es menor a la minima (${prenda.temperaturaMinimaC}°C).`
        );
    }

    if (prenda.nivelNivelAislamiento < 1 || prenda.nivelNivelAislamiento > 5) {
        errores.push(`Nivel de aislamiento fuera de rango (${prenda.nivelNivelAislamiento}) en "${prenda.nombre}".`);
    }

    if (prenda.nombre.trim().length === 0) {
        errores.push('La prenda debe registrar un nombre valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: prenda }
        : { esValido: false, errores };
}

export function validarTiempoActual(tiempo: CondicionTiempoActual): ResultadoValidacion<CondicionTiempoActual> {
    const errores: string[] = [];

    if (tiempo.probabilidadLluviaPct < 0 || tiempo.probabilidadLluviaPct > 100) {
        errores.push(`Probabilidad de lluvia fuera de rango (${tiempo.probabilidadLluviaPct}%) en ${tiempo.ciudad}.`);
    }

    if (tiempo.velocidadVientoKmH < 0 || tiempo.velocidadVientoKmH > 200) {
        errores.push(`Velocidad de viento invalida (${tiempo.velocidadVientoKmH} km/h) en ${tiempo.ciudad}.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: tiempo }
        : { esValido: false, errores };
}

export function validarGuardarropaRaw(prendas: readonly PrendaRopa[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (prendas.length === 0) {
        advertencias.push('El guardarropa del usuario se encuentra completamente vacio.');
    }

    for (const p of prendas) {
        if (idsVistos.has(p.id)) {
            advertencias.push(`Prenda duplicada detectada por ID: ${p.id} (${p.nombre}).`);
        }
        idsVistos.add(p.id);
    }

    return advertencias;
}

// 4. TRANSFORMACIÓN, MOTOR DE ALGORITMO Y CÁLCULOS (reduce & Record)

const CATEGORIAS_PRENDA: readonly CategoriaPrenda[] = [
    'Superior',
    'Inferior',
    'Calzado',
    'Abrigo',
    'Accesorio'
];

const ESTILOS_OUTFIT: readonly EstiloOutfit[] = [
    'Casual',
    'Formal',
    'Deportivo',
    'SmartCasual',
    'Urbano'
];

export function evaluarPrendaParaTiempo(
    prenda: PrendaRopa,
    tiempo: CondicionTiempoActual
): { readonly esCompatible: boolean; readonly puntos: number; readonly razon: string } {
    if (tiempo.temperaturaC < prenda.temperaturaMinimaC || tiempo.temperaturaC > prenda.temperaturaMaximaC) {
        return {
            esCompatible: false,
            puntos: 0,
            razon: `Fuera del rango termico (${prenda.temperaturaMinimaC}°C a ${prenda.temperaturaMaximaC}°C)`
        };
    }

    let puntos = 25; // Puntos base por compatibilidad térmica
    let razon = `Apta para ${tiempo.temperaturaC}°C`;

    if (tiempo.probabilidadLluviaPct > 50 || tiempo.condicion === 'Lluvioso') {
        if (prenda.esImpermeable) {
            puntos += 25;
            razon += ' | Protección impermeable eficaz';
        }
    }

    if (tiempo.temperaturaC < 10 && prenda.nivelNivelAislamiento >= 4) {
        puntos += 25;
        razon += ' | Aislamiento térmico adecuado para frío';
    }

    return { esCompatible: true, puntos, razon };
}

export function calcularMetricasOutfits(
    guardarropa: readonly PrendaRopa[],
    outfits: readonly RecomendacionOutfit[]
): MetricasRecomendacionesOutfit {
    if (outfits.length === 0) {
        const desgloseCatVacio = CATEGORIAS_PRENDA.reduce((acc, c) => {
            acc[c] = 0;
            return acc;
        }, {} as Record<CategoriaPrenda, number>);

        const desgloseEstiloVacio = ESTILOS_OUTFIT.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstiloOutfit, number>);

        return {
            totalPrendasGuardarropa: guardarropa.length,
            totalOutfitsGenerados: 0,
            puntajePromedioAdecuacion: 0,
            outfitMejorCalificado: null,
            desglosePorCategoria: desgloseCatVacio,
            desglosePorEstilo: desgloseEstiloVacio
        };
    }

    const sumaPuntajes = outfits.reduce((acc, o) => acc + o.puntajeAdecuacion, 0);
    const puntajePromedioAdecuacion = Number((sumaPuntajes / outfits.length).toFixed(1));

    const outfitMejorCalificado = [...outfits].sort(
        (a, b) => b.puntajeAdecuacion - a.puntajeAdecuacion
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorCategoria = guardarropa.reduce((acc, p) => {
        acc[p.categoria] = (acc[p.categoria] ?? 0) + 1;
        return acc;
    }, CATEGORIAS_PRENDA.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CategoriaPrenda, number>));

    const desglosePorEstilo = outfits.reduce((acc, o) => {
        acc[o.estiloObjetivo] = (acc[o.estiloObjetivo] ?? 0) + 1;
        return acc;
    }, ESTILOS_OUTFIT.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstiloOutfit, number>));

    return {
        totalPrendasGuardarropa: guardarropa.length,
        totalOutfitsGenerados: outfits.length,
        puntajePromedioAdecuacion,
        outfitMejorCalificado,
        desglosePorCategoria,
        desglosePorEstilo
    };
}

export class ServicioRecomendadorOutfit {
    private readonly armario = new ArmarioGuardarropa<PrendaRopa>();
    private readonly advertencias: string[] = [];

    constructor(private readonly usuarioNombre: string) { }

    public cargarGuardarropa(prendasRaw: readonly PrendaRopa[]): void {
        this.advertencias.push(...validarGuardarropaRaw(prendasRaw));

        for (const rawPrenda of prendasRaw) {
            const res = validarPrenda(rawPrenda);
            if (res.esValido) {
                const agregada = this.armario.agregar(res.datos);
                if (!agregada) {
                    this.advertencias.push(`No se pudo agregar la prenda duplicada ID: ${rawPrenda.id}`);
                }
            } else {
                this.advertencias.push(...res.errores);
            }
        }
    }

    public generarRecomendacion(
        id: string,
        codigoOutfit: string,
        tiempo: CondicionTiempoActual,
        estiloObjetivo: EstiloOutfit
    ): ResumenOutfitClima {
        const resTiempo = validarTiempoActual(tiempo);
        if (!resTiempo.esValido) {
            this.advertencias.push(...resTiempo.errores);
        }

        const prendasDisponibles = this.armario.obtenerTodas();
        const prendasOutfit: PrendaRopa[] = [];
        const justificacion: string[] = [];
        let puntajeAcumulado = 0;

        // Buscar una prenda para cada categoría esencial: Superior, Inferior, Calzado
        const categoriasEsenciales: CategoriaPrenda[] = ['Superior', 'Inferior', 'Calzado'];

        for (const cat of categoriasEsenciales) {
            const candidata = prendasDisponibles.find((p) => {
                if (p.categoria !== cat) return false;
                const evalRes = evaluarPrendaParaTiempo(p, tiempo);
                return evalRes.esCompatible;
            });

            if (candidata) {
                prendasOutfit.push(candidata);
                const evalRes = evaluarPrendaParaTiempo(candidata, tiempo);
                puntajeAcumulado += evalRes.puntos;
                justificacion.push(`${cat}: ${candidata.nombre} (${evalRes.razon})`);
            } else {
                this.advertencias.push(`Falta prenda adecuada de categoria "${cat}" para el clima actual en ${tiempo.ciudad}.`);
            }
        }

        // Agregar abrigo si la temperatura es menor a 15°C
        if (tiempo.temperaturaC < 15) {
            const abrigo = prendasDisponibles.find((p) => {
                if (p.categoria !== 'Abrigo') return false;
                const evalRes = evaluarPrendaParaTiempo(p, tiempo);
                return evalRes.esCompatible;
            });

            if (abrigo) {
                prendasOutfit.push(abrigo);
                const evalRes = evaluarPrendaParaTiempo(abrigo, tiempo);
                puntajeAcumulado += evalRes.puntos;
                justificacion.push(`Abrigo: ${abrigo.nombre} (${evalRes.razon})`);
            } else {
                this.advertencias.push(`Temperatura fria (${tiempo.temperaturaC}°C) pero no hay abrigo adecuado en el armario.`);
            }
        }

        const outfitsGenerados: RecomendacionOutfit[] = [];

        if (prendasOutfit.length >= 3) {
            outfitsGenerados.push({
                id,
                codigoOutfit,
                prendas: prendasOutfit,
                tiempo,
                estiloObjetivo,
                puntajeAdecuacion: Math.min(100, puntajeAcumulado),
                justificacion
            });
        }

        const metricas = calcularMetricasOutfits(prendasDisponibles, outfitsGenerados);

        return {
            usuarioNombre: this.usuarioNombre,
            totalPrendasValidas: prendasDisponibles.length,
            metricas,
            outfitsProcesados: outfitsGenerados,
            advertencias: this.advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenOutfit(resumen: ResumenOutfitClima, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` OUTFIT SEGÚN CLIMA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Usuario             : ${resumen.usuarioNombre}`);
    console.log(`Prendas en Armario  : ${resumen.totalPrendasValidas}`);
    console.log(`Outfits Generados   : ${resumen.metricas.totalOutfitsGenerados}`);
    console.log(`Puntaje Promedio    : ${resumen.metricas.puntajePromedioAdecuacion} / 100 pts`);
    console.log(`Mejor Outfit Match  : ${resumen.metricas.outfitMejorCalificado ? `${resumen.metricas.outfitMejorCalificado.codigoOutfit} (${resumen.metricas.outfitMejorCalificado.puntajeAdecuacion}% adecuación)` : 'Sin outfit recomendado'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REGISTRO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DEL ARMARIO POR CATEGORÍA DE PRENDA:`);
    Object.entries(resumen.metricas.desglosePorCategoria).forEach(([cat, cantidad]) => {
        console.log(`   - ${cat.padEnd(14)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    for (const o of resumen.outfitsProcesados) {
        console.log(`RECOMENDACIÓN [${o.codigoOutfit}] - Clima: ${o.tiempo.ciudad} (${o.tiempo.temperaturaC}°C, ${o.tiempo.condicion})`);
        console.table(
            o.prendas.map((p) => ({
                ID: p.id,
                Prenda: p.nombre,
                Categoría: p.categoria,
                Estilo: p.estilo,
                'Rango Térmico': `${p.temperaturaMinimaC}°C a ${p.temperaturaMaximaC}°C`,
                Impermeable: p.esImpermeable ? 'Sí' : 'No',
                Aislamiento: `${p.nivelNivelAislamiento}/5`
            }))
        );
    }
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const p1: PrendaRopa = { id: 'cl-01', nombre: 'Camiseta de Algodón Blanca', categoria: 'Superior', temperaturaMinimaC: 15, temperaturaMaximaC: 35, esImpermeable: false, nivelNivelAislamiento: 1, estilo: 'Casual' };
const p2: PrendaRopa = { id: 'cl-02', nombre: 'Jeans Denim Oscuro', categoria: 'Inferior', temperaturaMinimaC: 5, temperaturaMaximaC: 28, esImpermeable: false, nivelNivelAislamiento: 2, estilo: 'Casual' };
const p3: PrendaRopa = { id: 'cl-03', nombre: 'Sneakers Urbanas White', categoria: 'Calzado', temperaturaMinimaC: 0, temperaturaMaximaC: 35, esImpermeable: true, nivelNivelAislamiento: 2, estilo: 'Casual' };
const p4: PrendaRopa = { id: 'cl-04', nombre: 'Chaqueta Cortavientos Impermeable', categoria: 'Abrigo', temperaturaMinimaC: 2, temperaturaMaximaC: 18, esImpermeable: true, nivelNivelAislamiento: 4, estilo: 'Casual' };

// --- CASO 1: Clima Lluvioso y Fresco en Ciudad de Guatemala (Caso Normal) ---
const servicioNormal = new ServicioRecomendadorOutfit('José Rodríguez');
servicioNormal.cargarGuardarropa([p1, p2, p3, p4]);

const climaNormal: CondicionTiempoActual = {
    ciudad: 'Ciudad de Guatemala',
    temperaturaC: 12,
    condicion: 'Lluvioso',
    probabilidadLluviaPct: 85,
    velocidadVientoKmH: 20
};

const resumenNormal = servicioNormal.generarRecomendacion('out-01', 'OUTFIT-LLUVIA-01', climaNormal, 'Casual');
mostrarResumenOutfit(resumenNormal, 'Caso Normal - Outfit Lluvia / Fresco en Guatemala');

// --- CASO 2: Temperaturas Incoherentes y Falta de Prendas Esenciales (Caso Límite) ---
const prendaCorrupta: PrendaRopa = {
    id: 'cl-99',
    nombre: 'Abrigo Incoherente',
    categoria: 'Abrigo',
    temperaturaMinimaC: 30, // Minima 30 > Maxima 10 -> Invalida
    temperaturaMaximaC: 10,
    esImpermeable: false,
    nivelNivelAislamiento: 0, // Aislamiento 0 -> Invalido
    estilo: 'Formal'
};

const servicioLimite = new ServicioRecomendadorOutfit('José Rodríguez');
servicioLimite.cargarGuardarropa([prendaCorrupta, p1]); // Solo Camiseta (Faltan Inferior y Calzado)

const climaLimite: CondicionTiempoActual = {
    ciudad: 'Quetzaltenango',
    temperaturaC: -5,
    condicion: 'Nieve',
    probabilidadLluviaPct: 150, // Lluvia > 100% -> Invalida
    velocidadVientoKmH: -10 // Viento negativo -> Invalido
};

const resumenLimite = servicioLimite.generarRecomendacion('out-99', 'OUTFIT-FAIL-02', climaLimite, 'Formal');
mostrarResumenOutfit(resumenLimite, 'Caso Límite - Rango Térmico Invalido y Falta de Prendas Esenciales');