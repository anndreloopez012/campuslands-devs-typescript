
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type TipoComision =
    | 'Boceto'
    | 'Lineart'
    | 'ColorCompleto'
    | 'IlustracionPlena'
    | 'SpriteRPG'
    | 'ConceptArt';

export type ClasePersonajeRPG =
    | 'Guerrero'
    | 'Mago'
    | 'Picaro'
    | 'Paladin'
    | 'Nigromante'
    | 'Bardo'
    | 'Clerigo';

export type EstadoComision =
    | 'Pendiente'
    | 'EnProceso'
    | 'Revision'
    | 'Entregada'
    | 'Cancelada';

export interface ArtistaDigital {
    readonly id: string;
    readonly nombre: string;
    readonly tarifaBaseUSD: number;
}

export interface ClienteRPG {
    readonly id: string;
    readonly nombre: string;
    readonly juegoRPG: string;
}

export interface ComisionDibujo {
    readonly id: string;
    readonly titulo: string;
    readonly tipo: TipoComision;
    readonly clasePersonaje: ClasePersonajeRPG;
    readonly artista: ArtistaDigital;
    readonly cliente: ClienteRPG;
    readonly precioUSD: number;
    readonly horasEstimadas: number;
    readonly esUsoComercial: boolean;
    readonly estado: EstadoComision;
}

export interface MetricasComisiones {
    readonly totalComisiones: number;
    readonly totalEntregadas: number;
    readonly ingresosTotalesUSD: number;
    readonly precioPromedioUSD: number;
    readonly horasTotalesTrabajadas: number;
    readonly artistaMasSolicitado: { readonly nombre: string; readonly totalComisiones: number } | null;
    readonly desglosePorTipo: Readonly<Record<TipoComision, number>>;
    readonly desglosePorClase: Readonly<Record<ClasePersonajeRPG, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoComision, number>>;
}

export interface ResumenComisionesDibujo {
    readonly totalComisionesValidas: number;
    readonly metricas: MetricasComisiones;
    readonly comisionesProcesadas: readonly ComisionDibujo[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarComisionDibujo(comision: ComisionDibujo): ResultadoValidacion<ComisionDibujo> {
    const errores: string[] = [];

    if (comision.precioUSD <= 0) {
        errores.push(`El precio de la comision "${comision.titulo}" debe ser mayor a 0 USD ($${comision.precioUSD}).`);
    }

    if (comision.horasEstimadas <= 0 || comision.horasEstimadas > 200) {
        errores.push(`Horas estimadas invalidas (${comision.horasEstimadas}h) en la comision "${comision.titulo}".`);
    }

    if (comision.artista.tarifaBaseUSD <= 0) {
        errores.push(`La tarifa base del artista ${comision.artista.nombre} es invalida ($${comision.artista.tarifaBaseUSD}).`);
    }

    if (comision.titulo.trim().length === 0) {
        errores.push('La comision debe registrar un titulo descriptivo.');
    }

    return errores.length === 0
        ? { esValido: true, datos: comision }
        : { esValido: false, errores };
}

export function validarComisionesRaw(comisiones: readonly ComisionDibujo[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (comisiones.length === 0) {
        advertencias.push('La lista de comisiones de dibujo RPG esta vacia.');
    }

    for (const comision of comisiones) {
        if (idsVistos.has(comision.id)) {
            advertencias.push(`Comision duplicada detectada: ID ${comision.id} (${comision.titulo}).`);
        }
        idsVistos.add(comision.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce y Record)

const TIPOS_COMISION: readonly TipoComision[] = [
    'Boceto',
    'Lineart',
    'ColorCompleto',
    'IlustracionPlena',
    'SpriteRPG',
    'ConceptArt'
];

const CLASES_PERSONAJE: readonly ClasePersonajeRPG[] = [
    'Guerrero',
    'Mago',
    'Picaro',
    'Paladin',
    'Nigromante',
    'Bardo',
    'Clerigo'
];

const ESTADOS_COMISION: readonly EstadoComision[] = [
    'Pendiente',
    'EnProceso',
    'Revision',
    'Entregada',
    'Cancelada'
];

export function calcularMetricasComisiones(comisiones: readonly ComisionDibujo[]): MetricasComisiones {
    if (comisiones.length === 0) {
        const desgloseTipoVacio = TIPOS_COMISION.reduce((acc, t) => {
            acc[t] = 0;
            return acc;
        }, {} as Record<TipoComision, number>);

        const desgloseClaseVacio = CLASES_PERSONAJE.reduce((acc, c) => {
            acc[c] = 0;
            return acc;
        }, {} as Record<ClasePersonajeRPG, number>);

        const desgloseEstadoVacio = ESTADOS_COMISION.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoComision, number>);

        return {
            totalComisiones: 0,
            totalEntregadas: 0,
            ingresosTotalesUSD: 0,
            precioPromedioUSD: 0,
            horasTotalesTrabajadas: 0,
            artistaMasSolicitado: null,
            desglosePorTipo: desgloseTipoVacio,
            desglosePorClase: desgloseClaseVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const comisionesActivas = comisiones.filter((c) => c.estado !== 'Cancelada');
    const totalEntregadas = comisiones.filter((c) => c.estado === 'Entregada').length;

    const ingresosTotalesUSD = Number(
        comisiones
            .filter((c) => c.estado === 'Entregada')
            .reduce((acc, c) => acc + c.precioUSD, 0)
            .toFixed(2)
    );

    const sumaPrecios = comisionesActivas.reduce((acc, c) => acc + c.precioUSD, 0);
    const precioPromedioUSD = comisionesActivas.length > 0
        ? Number((sumaPrecios / comisionesActivas.length).toFixed(2))
        : 0;

    const horasTotalesTrabajadas = comisionesActivas.reduce((acc, c) => acc + c.horasEstimadas, 0);

    // Conteo de solicitudes por artista utilizando reduce
    const conteoArtistas = comisionesActivas.reduce((acc, c) => {
        acc[c.artista.nombre] = (acc[c.artista.nombre] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    let artistaMasSolicitado: { nombre: string; totalComisiones: number } | null = null;
    let maxComisiones = 0;
    Object.entries(conteoArtistas).forEach(([nombre, total]) => {
        if (total > maxComisiones) {
            maxComisiones = total;
            artistaMasSolicitado = { nombre, totalComisiones: total };
        }
    });

    // Agrupaciones mediante reduce y Record
    const desglosePorTipo = comisionesActivas.reduce((acc, c) => {
        acc[c.tipo] = (acc[c.tipo] ?? 0) + 1;
        return acc;
    }, TIPOS_COMISION.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoComision, number>));

    const desglosePorClase = comisionesActivas.reduce((acc, c) => {
        acc[c.clasePersonaje] = (acc[c.clasePersonaje] ?? 0) + 1;
        return acc;
    }, CLASES_PERSONAJE.reduce((acc, cl) => ({ ...acc, [cl]: 0 }), {} as Record<ClasePersonajeRPG, number>));

    const desglosePorEstado = comisiones.reduce((acc, c) => {
        acc[c.estado] = (acc[c.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_COMISION.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoComision, number>));

    return {
        totalComisiones: comisiones.length,
        totalEntregadas,
        ingresosTotalesUSD,
        precioPromedioUSD,
        horasTotalesTrabajadas,
        artistaMasSolicitado,
        desglosePorTipo,
        desglosePorClase,
        desglosePorEstado
    };
}

export function procesarComisionesDibujo(comisionesRaw: readonly ComisionDibujo[]): ResumenComisionesDibujo {
    const advertencias: string[] = [...validarComisionesRaw(comisionesRaw)];
    const comisionesValidas: ComisionDibujo[] = [];

    for (const raw of comisionesRaw) {
        const res = validarComisionDibujo(raw);
        if (res.esValido) {
            comisionesValidas.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasComisiones(comisionesValidas);

    return {
        totalComisionesValidas: comisionesValidas.length,
        metricas,
        comisionesProcesadas: comisionesValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenComisiones(resumen: ResumenComisionesDibujo, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` COMISIONES DE DIBUJO RPG - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Comisiones Validadas: ${resumen.totalComisionesValidas}`);
    console.log(`Entregadas          : ${resumen.metricas.totalEntregadas} / ${resumen.metricas.totalComisiones}`);
    console.log(`Ingresos Entregados : $${resumen.metricas.ingresosTotalesUSD.toLocaleString()} USD`);
    console.log(`Precio Promedio     : $${resumen.metricas.precioPromedioUSD} USD`);
    console.log(`Horas Trabajadas    : ${resumen.metricas.horasTotalesTrabajadas} horas`);
    console.log(`Artista Mas Buscado : ${resumen.metricas.artistaMasSolicitado ? `${resumen.metricas.artistaMasSolicitado.nombre} (${resumen.metricas.artistaMasSolicitado.totalComisiones} encargos)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REGISTRO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR TIPO DE ILUSTRACION:`);
    Object.entries(resumen.metricas.desglosePorTipo).forEach(([tipo, cantidad]) => {
        console.log(`   - ${tipo.padEnd(18)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.comisionesProcesadas.map((c) => ({
            ID: c.id,
            Titulo: c.titulo,
            Tipo: c.tipo,
            Clase: c.clasePersonaje,
            Artista: c.artista.nombre,
            Cliente: c.cliente.nombre,
            Juego: c.cliente.juegoRPG,
            Precio: `$${c.precioUSD}`,
            Horas: `${c.horasEstimadas}h`,
            Comercial: c.esUsoComercial ? 'SI' : 'NO',
            Estado: c.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const artista1: ArtistaDigital = { id: 'art-01', nombre: 'Kyuu Art', tarifaBaseUSD: 50 };
const artista2: ArtistaDigital = { id: 'art-02', nombre: 'Valeria Design', tarifaBaseUSD: 80 };

const cliente1: ClienteRPG = { id: 'cli-01', nombre: 'Gabriel Vane', juegoRPG: 'Dungeons & Dragons 5e' };
const cliente2: ClienteRPG = { id: 'cli-02', nombre: 'Lucia Thorne', juegoRPG: 'Pathfinder 2e' };

// --- CASO 1: Lista de Encargos de Ilustración RPG (Caso Normal) ---
const comisionesNormales: readonly ComisionDibujo[] = [
    {
        id: 'COM-001',
        titulo: 'Retrato de Paladin Divino',
        tipo: 'ColorCompleto',
        clasePersonaje: 'Paladin',
        artista: artista1,
        cliente: cliente1,
        precioUSD: 150,
        horasEstimadas: 10,
        esUsoComercial: false,
        estado: 'Entregada'
    },
    {
        id: 'COM-002',
        titulo: 'Sprite Pixel Art Nigromante',
        tipo: 'SpriteRPG',
        clasePersonaje: 'Nigromante',
        artista: artista2,
        cliente: cliente2,
        precioUSD: 200,
        horasEstimadas: 12,
        esUsoComercial: true,
        estado: 'Entregada'
    },
    {
        id: 'COM-003',
        titulo: 'Ilustracion Plena Grupo en Taberna',
        tipo: 'IlustracionPlena',
        clasePersonaje: 'Bardo',
        artista: artista1,
        cliente: cliente1,
        precioUSD: 350,
        horasEstimadas: 25,
        esUsoComercial: false,
        estado: 'EnProceso'
    }
];

// --- CASO 2: Precio Inválido, Horas Negativas y Registro Duplicado (Caso Límite) ---
const comisionesLimiteCorruptas: readonly ComisionDibujo[] = [
    {
        id: 'COM-004',
        titulo: 'Boceto Precio Invalido',
        tipo: 'Boceto',
        clasePersonaje: 'Picaro',
        artista: artista1,
        cliente: cliente2,
        precioUSD: -10, // Precio negativo -> Invalido
        horasEstimadas: 3,
        esUsoComercial: false,
        estado: 'Pendiente'
    },
    {
        id: 'COM-005',
        titulo: 'Concept Art Horas Imposibles',
        tipo: 'ConceptArt',
        clasePersonaje: 'Mago',
        artista: artista2,
        cliente: cliente1,
        precioUSD: 100,
        horasEstimadas: 250, // Horas > 200 -> Invalido
        esUsoComercial: false,
        estado: 'Pendiente'
    },
    {
        id: 'COM-001', // ID Duplicado con COM-001
        titulo: 'Retrato de Paladin Divino Copia',
        tipo: 'ColorCompleto',
        clasePersonaje: 'Paladin',
        artista: artista1,
        cliente: cliente1,
        precioUSD: 150,
        horasEstimadas: 10,
        esUsoComercial: false,
        estado: 'Entregada'
    }
];

// Ejecución
const resumenNormal = procesarComisionesDibujo(comisionesNormales);
mostrarResumenComisiones(resumenNormal, 'Caso Normal - Encargos de Arte para RPG');

const resumenLimite = procesarComisionesDibujo(comisionesLimiteCorruptas);
mostrarResumenComisiones(resumenLimite, 'Caso Limite - Precios Negativos y Horas Invalidas');