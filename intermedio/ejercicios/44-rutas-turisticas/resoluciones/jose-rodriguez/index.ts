
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Clases)

export type CategoriaAtraccion =
    | 'Historico'
    | 'Cultural'
    | 'Naturaleza'
    | 'Gastronomia'
    | 'Aventura'
    | 'Arquitectura';

export type NivelDificultad = 'Fácil' | 'Moderado' | 'Exigente' | 'Extremo';

export type ModoTransporteRuta = 'Caminando' | 'Bicicleta' | 'Vehiculo' | 'Mixto';

export interface AtraccionTuristica {
    readonly id: string;
    readonly nombre: string;
    readonly categoria: CategoriaAtraccion;
    readonly tiempoEstimadoMinutos: number;
    readonly costoEntradaUSD: number;
    readonly calificacionPromedio: number; // 1.0 a 5.0
    readonly requiereReservaPrevia: boolean;
    readonly esAccesibleDiscapacidad: boolean;
}

export interface PuntoControlRuta {
    readonly orden: number;
    readonly atraccion: AtraccionTuristica;
    readonly distanciaSiguienteKm: number;
    readonly tiempoTrasladoMinutos: number;
}

export interface ItinerarioRutaTuristica {
    readonly id: string;
    readonly codigoRuta: string;
    readonly nombreRuta: string;
    readonly ciudad: string;
    readonly modoTransporte: ModoTransporteRuta;
    readonly dificultad: NivelDificultad;
    readonly tiempoMaximoDisponibleMinutos: number;
    readonly presupuestoMaximoUSD: number;
    readonly puntosControl: readonly PuntoControlRuta[];
}

export interface MetricasRutaTuristica {
    readonly totalAtracciones: number;
    readonly tiempoTotalRecorridoMinutos: number;
    readonly costoTotalRecorridoUSD: number;
    readonly distanciaTotalKm: number;
    readonly calificacionPromedioRuta: number;
    readonly porcentajePresupuestoUtilizado: number;
    readonly atraccionMejorCalificada: AtraccionTuristica | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaAtraccion, number>>;
    readonly desglosePorDificultad: Readonly<Record<NivelDificultad, number>>;
}

export interface ResumenRutaTuristica {
    readonly rutaId: string;
    readonly codigoRuta: string;
    readonly nombreRuta: string;
    readonly totalAtraccionesValidas: number;
    readonly metricas: MetricasRutaTuristica;
    readonly atraccionesProcesadas: readonly PuntoControlRuta[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y CLASE DE GESTIÓN (Generics & Encapsulamiento)

export class ColeccionPuntosRuta<T extends { readonly orden: number; readonly atraccion: { readonly id: string } }> {
    private readonly elementos: Map<string, T> = new Map();

    public agregar(item: T): boolean {
        if (this.elementos.has(item.atraccion.id)) {
            return false;
        }
        this.elementos.set(item.atraccion.id, item);
        return true;
    }

    public obtenerPorId(id: string): T | undefined {
        return this.elementos.get(id);
    }

    public obtenerTodos(): readonly T[] {
        return Array.from(this.elementos.values()).sort((a, b) => a.orden - b.orden);
    }

    public existe(id: string): boolean {
        return this.elementos.has(id);
    }

    public obtenerTamano(): number {
        return this.elementos.size;
    }
}

// 3. VALIDACIONES Y REGLAS DE NEGOCIO

export function validarAtraccion(atraccion: AtraccionTuristica): ResultadoValidacion<AtraccionTuristica> {
    const errores: string[] = [];

    if (atraccion.tiempoEstimadoMinutos <= 0 || atraccion.tiempoEstimadoMinutos > 480) {
        errores.push(`Tiempo de visita inválido (${atraccion.tiempoEstimadoMinutos} min) para "${atraccion.nombre}".`);
    }

    if (atraccion.costoEntradaUSD < 0) {
        errores.push(`Costo de entrada negativo ($${atraccion.costoEntradaUSD}) en "${atraccion.nombre}".`);
    }

    if (atraccion.calificacionPromedio < 1.0 || atraccion.calificacionPromedio > 5.0) {
        errores.push(`Calificación fuera de rango (${atraccion.calificacionPromedio}) en "${atraccion.nombre}".`);
    }

    if (atraccion.nombre.trim().length === 0) {
        errores.push('La atracción debe registrar un nombre válido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: atraccion }
        : { esValido: false, errores };
}

export function validarPuntoControl(punto: PuntoControlRuta): ResultadoValidacion<PuntoControlRuta> {
    const errores: string[] = [];

    if (punto.orden <= 0) {
        errores.push(`Orden de punto de control inválido (${punto.orden}) para "${punto.atraccion.nombre}".`);
    }

    if (punto.distanciaSiguienteKm < 0) {
        errores.push(`Distancia de traslado negativa (${punto.distanciaSiguienteKm} km) en "${punto.atraccion.nombre}".`);
    }

    if (punto.tiempoTrasladoMinutos < 0) {
        errores.push(`Tiempo de traslado negativo (${punto.tiempoTrasladoMinutos} min) en "${punto.atraccion.nombre}".`);
    }

    return errores.length === 0
        ? { esValido: true, datos: punto }
        : { esValido: false, errores };
}

export function validarItinerarioRaw(itinerario: ItinerarioRutaTuristica): readonly string[] {
    const advertencias: string[] = [];
    const ordenesVistos = new Set<number>();
    const idsAtracciones = new Set<string>();

    if (itinerario.tiempoMaximoDisponibleMinutos <= 0) {
        advertencias.push(`Tiempo máximo disponible inválido (${itinerario.tiempoMaximoDisponibleMinutos} min).`);
    }

    if (itinerario.presupuestoMaximoUSD <= 0) {
        advertencias.push(`Presupuesto máximo asignado inválido ($${itinerario.presupuestoMaximoUSD} USD).`);
    }

    if (itinerario.puntosControl.length === 0) {
        advertencias.push(`La ruta turística "${itinerario.nombreRuta}" no contiene puntos de control asignados.`);
    }

    for (const p of itinerario.puntosControl) {
        if (ordenesVistos.has(p.orden)) {
            advertencias.push(`Orden duplicado de punto de control: #${p.orden} en "${p.atraccion.nombre}".`);
        }
        if (idsAtracciones.has(p.atraccion.id)) {
            advertencias.push(`Atracción duplicada en la misma ruta: ID ${p.atraccion.id} (${p.atraccion.nombre}).`);
        }
        ordenesVistos.add(p.orden);
        idsAtracciones.add(p.atraccion.id);
    }

    return advertencias;
}

// 4. TRANSFORMACIÓN Y CÁLCULOS METRICOS (reduce & Record)

const CATEGORIAS_ATRACCION: readonly CategoriaAtraccion[] = [
    'Historico',
    'Cultural',
    'Naturaleza',
    'Gastronomia',
    'Aventura',
    'Arquitectura'
];

const NIVELES_DIFICULTAD: readonly NivelDificultad[] = [
    'Fácil',
    'Moderado',
    'Exigente',
    'Extremo'
];

export function calcularMetricasRuta(
    puntos: readonly PuntoControlRuta[],
    presupuestoMaxUSD: number,
    dificultadRuta: NivelDificultad
): MetricasRutaTuristica {
    if (puntos.length === 0) {
        const desgloseCatVacio = CATEGORIAS_ATRACCION.reduce((acc, c) => {
            acc[c] = 0;
            return acc;
        }, {} as Record<CategoriaAtraccion, number>);

        const desgloseDifVacio = NIVELES_DIFICULTAD.reduce((acc, d) => {
            acc[d] = 0;
            return acc;
        }, {} as Record<NivelDificultad, number>);

        return {
            totalAtracciones: 0,
            tiempoTotalRecorridoMinutos: 0,
            costoTotalRecorridoUSD: 0,
            distanciaTotalKm: 0,
            calificacionPromedioRuta: 0,
            porcentajePresupuestoUtilizado: 0,
            atraccionMejorCalificada: null,
            desglosePorCategoria: desgloseCatVacio,
            desglosePorDificultad: desgloseDifVacio
        };
    }

    const tiempoTotalRecorridoMinutos = puntos.reduce(
        (acc, p) => acc + p.atraccion.tiempoEstimadoMinutos + p.tiempoTrasladoMinutos,
        0
    );

    const costoTotalRecorridoUSD = Number(
        puntos.reduce((acc, p) => acc + p.atraccion.costoEntradaUSD, 0).toFixed(2)
    );

    const distanciaTotalKm = Number(
        puntos.reduce((acc, p) => acc + p.distanciaSiguienteKm, 0).toFixed(2)
    );

    const sumaCalificaciones = puntos.reduce((acc, p) => acc + p.atraccion.calificacionPromedio, 0);
    const calificacionPromedioRuta = Number((sumaCalificaciones / puntos.length).toFixed(2));

    const porcentajePresupuestoUtilizado = presupuestoMaxUSD > 0
        ? Number(((costoTotalRecorridoUSD / presupuestoMaxUSD) * 100).toFixed(1))
        : 0;

    const mejorPunto = [...puntos].sort(
        (a, b) => b.atraccion.calificacionPromedio - a.atraccion.calificacionPromedio
    )[0] ?? null;

    const atraccionMejorCalificada = mejorPunto ? mejorPunto.atraccion : null;

    // Agrupaciones mediante reduce y Record
    const desglosePorCategoria = puntos.reduce((acc, p) => {
        acc[p.atraccion.categoria] = (acc[p.atraccion.categoria] ?? 0) + 1;
        return acc;
    }, CATEGORIAS_ATRACCION.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CategoriaAtraccion, number>));

    const desglosePorDificultad = NIVELES_DIFICULTAD.reduce((acc, d) => {
        acc[d] = d === dificultadRuta ? 1 : 0;
        return acc;
    }, {} as Record<NivelDificultad, number>);

    return {
        totalAtracciones: puntos.length,
        tiempoTotalRecorridoMinutos,
        costoTotalRecorridoUSD,
        distanciaTotalKm,
        calificacionPromedioRuta,
        porcentajePresupuestoUtilizado,
        atraccionMejorCalificada,
        desglosePorCategoria,
        desglosePorDificultad
    };
}

export class ServicioGestionRutaTuristica {
    private readonly coleccion = new ColeccionPuntosRuta<PuntoControlRuta>();
    private readonly advertencias: string[] = [];

    constructor(private readonly itinerarioRaw: ItinerarioRutaTuristica) { }

    public procesarRuta(): ResumenRutaTuristica {
        this.advertencias.push(...validarItinerarioRaw(this.itinerarioRaw));

        for (const rawPunto of this.itinerarioRaw.puntosControl) {
            const resAtr = validarAtraccion(rawPunto.atraccion);
            const resPto = validarPuntoControl(rawPunto);

            if (!resAtr.esValido) {
                this.advertencias.push(...resAtr.errores);
            }
            if (!resPto.esValido) {
                this.advertencias.push(...resPto.errores);
            }

            if (resAtr.esValido && resPto.esValido) {
                const agregado = this.coleccion.agregar(rawPunto);
                if (!agregado) {
                    this.advertencias.push(`Atracción duplicada ignorada: ${rawPunto.atraccion.nombre}`);
                }
            }
        }

        const puntosValidos = this.coleccion.obtenerTodos();
        const metricas = calcularMetricasRuta(
            puntosValidos,
            this.itinerarioRaw.presupuestoMaximoUSD,
            this.itinerarioRaw.dificultad
        );

        if (metricas.tiempoTotalRecorridoMinutos > this.itinerarioRaw.tiempoMaximoDisponibleMinutos) {
            this.advertencias.push(
                `Exceso de tiempo: El recorrido (${metricas.tiempoTotalRecorridoMinutos} min) supera el tiempo disponible (${this.itinerarioRaw.tiempoMaximoDisponibleMinutos} min).`
            );
        }

        if (metricas.costoTotalRecorridoUSD > this.itinerarioRaw.presupuestoMaximoUSD) {
            this.advertencias.push(
                `Exceso de presupuesto: El costo de entradas ($${metricas.costoTotalRecorridoUSD} USD) supera el límite ($${this.itinerarioRaw.presupuestoMaximoUSD} USD).`
            );
        }

        return {
            rutaId: this.itinerarioRaw.id,
            codigoRuta: this.itinerarioRaw.codigoRuta,
            nombreRuta: this.itinerarioRaw.nombreRuta,
            totalAtraccionesValidas: puntosValidos.length,
            metricas,
            atraccionesProcesadas: puntosValidos,
            advertencias: this.advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenRuta(resumen: ResumenRutaTuristica, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` RUTAS TURÍSTICAS INTELIGENTES - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Nombre Ruta         : ${resumen.nombreRuta}`);
    console.log(`Código Ruta         : ${resumen.codigoRuta}`);
    console.log(`Atracciones Validadas: ${resumen.totalAtraccionesValidas}`);
    console.log(`Tiempo Total        : ${resumen.metricas.tiempoTotalRecorridoMinutos} min (${(resumen.metricas.tiempoTotalRecorridoMinutos / 60).toFixed(1)} hrs)`);
    console.log(`Costo Entradas Total: $${resumen.metricas.costoTotalRecorridoUSD} USD (${resumen.metricas.porcentajePresupuestoUtilizado}% del presupuesto)`);
    console.log(`Distancia Total     : ${resumen.metricas.distanciaTotalKm} km`);
    console.log(`Calificación Prom.  : ${resumen.metricas.calificacionPromedioRuta} / 5.0 ⭐`);
    console.log(`Top Atracción       : ${resumen.metricas.atraccionMejorCalificada ? `"${resumen.metricas.atraccionMejorCalificada.nombre}" (${resumen.metricas.atraccionMejorCalificada.calificacionPromedio}⭐)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE RUTA (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR CATEGORÍA DE ATRACCIÓN:`);
    Object.entries(resumen.metricas.desglosePorCategoria).forEach(([cat, cantidad]) => {
        console.log(`   - ${cat.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.atraccionesProcesadas.map((p) => ({
            Orden: `#${p.orden}`,
            Atracción: p.atraccion.nombre,
            Categoría: p.atraccion.categoria,
            'Tiempo Visita': `${p.atraccion.tiempoEstimadoMinutos} min`,
            'Traslado Siguiente': `${p.tiempoTrasladoMinutos} min (${p.distanciaSiguienteKm} km)`,
            Costo: `$${p.atraccion.costoEntradaUSD} USD`,
            Rating: `${p.atraccion.calificacionPromedio}⭐`,
            Reserva: p.atraccion.requiereReservaPrevia ? 'Sí' : 'No'
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const a1: AtraccionTuristica = { id: 'atr-01', nombre: 'Arco de Santa Catalina', categoria: 'Historico', tiempoEstimadoMinutos: 45, costoEntradaUSD: 0, calificacionPromedio: 4.8, requiereReservaPrevia: false, esAccesibleDiscapacidad: true };
const a2: AtraccionTuristica = { id: 'atr-02', nombre: 'Iglesia de La Merced', categoria: 'Arquitectura', tiempoEstimadoMinutos: 60, costoEntradaUSD: 3.0, calificacionPromedio: 4.7, requiereReservaPrevia: false, esAccesibleDiscapacidad: true };
const a3: AtraccionTuristica = { id: 'atr-03', nombre: 'Cerro de la Cruz', categoria: 'Naturaleza', tiempoEstimadoMinutos: 90, costoEntradaUSD: 0, calificacionPromedio: 4.9, requiereReservaPrevia: false, esAccesibleDiscapacidad: false };
const a4: AtraccionTuristica = { id: 'atr-04', nombre: 'Mercado de Artesanías', categoria: 'Cultural', tiempoEstimadoMinutos: 75, costoEntradaUSD: 0, calificacionPromedio: 4.5, requiereReservaPrevia: false, esAccesibleDiscapacidad: true };

// --- CASO 1: Ruta Colonial Antigua Guatemala (Caso Normal) ---
const itinerarioNormal: ItinerarioRutaTuristica = {
    id: 'ROUTE-ANTIGUA-01',
    codigoRuta: 'ANT-COLONIAL-2026',
    nombreRuta: 'Ruta Colonial e Histórica Antigua Guatemala',
    ciudad: 'Antigua Guatemala',
    modoTransporte: 'Caminando',
    dificultad: 'Fácil',
    tiempoMaximoDisponibleMinutos: 360, // 6 horas
    presupuestoMaximoUSD: 50.0,
    puntosControl: [
        { orden: 1, atraccion: a1, distanciaSiguienteKm: 0.4, tiempoTrasladoMinutos: 8 },
        { orden: 2, atraccion: a2, distanciaSiguienteKm: 1.2, tiempoTrasladoMinutos: 20 },
        { orden: 3, atraccion: a3, distanciaSiguienteKm: 1.8, tiempoTrasladoMinutos: 25 },
        { orden: 4, atraccion: a4, distanciaSiguienteKm: 0.0, tiempoTrasladoMinutos: 0 }
    ]
};

// --- CASO 2: Exceso de Tiempo, Costo Negativo y Punto Duplicado (Caso Límite) ---
const atraccionCorrupta: AtraccionTuristica = {
    id: 'atr-99',
    nombre: 'Atracción Invalida',
    categoria: 'Aventura',
    tiempoEstimadoMinutos: 600, // 10 horas -> Invalido (> 480)
    costoEntradaUSD: -20.0, // Costo negativo -> Invalido
    calificacionPromedio: 6.5, // Rating > 5 -> Invalido
    requiereReservaPrevia: true,
    esAccesibleDiscapacidad: false
};

const itinerarioLimiteCorrupto: ItinerarioRutaTuristica = {
    id: 'ROUTE-FAIL-02',
    codigoRuta: 'ANT-FAIL-02',
    nombreRuta: 'Ruta Con Exceso de Tiempo y Datos Corruptos',
    ciudad: 'Antigua Guatemala',
    modoTransporte: 'Caminando',
    dificultad: 'Extremo',
    tiempoMaximoDisponibleMinutos: 120, // 2 horas max (provocara alerta de exceso de tiempo)
    presupuestoMaximoUSD: 5.0, // Presupuesto muy bajo (provocara alerta de exceso de presupuesto)
    puntosControl: [
        { orden: 1, atraccion: a2, distanciaSiguienteKm: 0.5, tiempoTrasladoMinutos: 10 },
        { orden: 2, atraccion: atraccionCorrupta, distanciaSiguienteKm: -2.0, tiempoTrasladoMinutos: -15 }, // Traslado negativo -> Invalido
        { orden: 1, atraccion: a2 } as any // Orden duplicado e ID duplicado
    ]
};

// Ejecución Caso 1
const servicioNormal = new ServicioGestionRutaTuristica(itinerarioNormal);
const resumenNormal = servicioNormal.procesarRuta();
mostrarResumenRuta(resumenNormal, 'Caso Normal - Ruta Colonial Antigua Guatemala');

// Ejecución Caso 2
const servicioLimite = new ServicioGestionRutaTuristica(itinerarioLimiteCorrupto);
const resumenLimite = servicioLimite.procesarRuta();
mostrarResumenRuta(resumenLimite, 'Caso Límite - Exceso de Tiempo y Datos Corruptos');

